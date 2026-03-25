import Node from "../models/Node.js";
import SensorReading from "../models/SensorReading.js";
import Zone from "../models/Zone.js";
import Datacenter from "../models/Datacenter.js";
import { processMetric } from "./alertEngine.js";
import { recomputeAndEmitStatus } from "./statusEngine.js";

// état par node
const state = new Map();

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(x, min, max) { return Math.max(min, Math.min(max, x)); }
function maybe(p) { return Math.random() < p; }

function initState(nodeId) {
  return {
    base: {
      temperature: rand(20, 26),
      humidity: rand(42, 58),
      gasLevel: rand(120, 250),
      pressure: rand(995, 1025),
      vibration: rand(0.15, 0.30),
    },
    incident: null, // { type, until }
    vibBaselineWindow: [], // pour baseline ~10min (en mémoire)
  };
}

function nextValues(s) {
  // drift + noise + wave
  const periodMs = 8 * 60 * 1000; // vague “journée” accélérée (8min)
  const wave = Math.sin((2 * Math.PI * (Date.now() % periodMs)) / periodMs);

  s.base.temperature = clamp(s.base.temperature + rand(-0.10, 0.10), 16, 28);
  s.base.humidity = clamp(s.base.humidity + rand(-0.30, 0.30), 35, 65);
  s.base.gasLevel = clamp(s.base.gasLevel + rand(-8, 10), 80, 320);
  s.base.pressure = clamp(s.base.pressure + rand(-0.6, 0.6), 985, 1035);
  s.base.vibration = clamp(s.base.vibration + rand(-0.01, 0.02), 0.08, 0.45);

  let temperature = s.base.temperature + wave * 1.2 + rand(-0.3, 0.3);
  let humidity = s.base.humidity + wave * 3.0 + rand(-1.0, 1.0);
  let gasLevel = s.base.gasLevel + wave * 30 + rand(-20, 20);
  let pressure = s.base.pressure + wave * 2.0 + rand(-0.8, 0.8);
  let vibration = s.base.vibration + rand(-0.02, 0.03);

  // incidents (pour vraiment déclencher alertes)
  if (!s.incident && maybe(0.06)) { // augmente pour tester (6%)
    const types = ["OVERHEAT", "GAS", "HUM_LOW", "HUM_HIGH", "PRESS_LOW", "VIBRATION"];
    const type = types[Math.floor(Math.random() * types.length)];
    const durationSec = Math.floor(rand(20, 120));
    s.incident = { type, until: Date.now() + durationSec * 1000 };
  }

  if (s.incident) {
    const type = s.incident.type;

    if (type === "OVERHEAT") temperature += rand(6, 12); // passe >30
    if (type === "GAS") gasLevel += rand(250, 600);      // passe >500
    if (type === "HUM_LOW") humidity -= rand(15, 25);    // passe <30
    if (type === "HUM_HIGH") humidity += rand(12, 20);   // passe >70 parfois
    if (type === "PRESS_LOW") pressure -= rand(25, 40);  // passe <970
    if (type === "VIBRATION") vibration += rand(0.25, 0.60); // ratio baseline

    if (Date.now() >= s.incident.until) s.incident = null;
  }

  // clamp final
  return {
    temperature: clamp(temperature, 5, 60),
    humidity: clamp(humidity, 0, 100),
    gasLevel: clamp(gasLevel, 0, 2000),
    pressure: clamp(pressure, 900, 1100),
    vibration: clamp(vibration, 0, 10),
  };
}

function updateBaseline(s, v) {
  // tick=2s => 10min => 300 points
  s.vibBaselineWindow.push(v);
  if (s.vibBaselineWindow.length > 300) s.vibBaselineWindow.shift();
  const avg = s.vibBaselineWindow.reduce((a, b) => a + b, 0) / s.vibBaselineWindow.length;
  return avg;
}

export async function startRealtimeSimulator(io, { intervalMs = 2000 } = {}) {
  console.log("🧪 Realtime simulator started");

  setInterval(async () => {
    // on simule UNIQUEMENT les nodes ONLINE (donc Virtual DC va bouger)
    const nodes = await Node.find({ isOnline: true });

    for (const node of nodes) {
      let s = state.get(String(node._id));
      if (!s) { s = initState(String(node._id)); state.set(String(node._id), s); }

      const values = nextValues(s);
      const baseline = updateBaseline(s, values.vibration);

      // save reading
      const reading = await SensorReading.create({
        nodeId: node._id,
        temperature: values.temperature,
        humidity: values.humidity,
        gasLevel: values.gasLevel,
        pressure: values.pressure,
        vibration: values.vibration,
        recordedAt: new Date(),
      });

      // find zone + datacenter for socket room
      const zone = await Zone.findById(node.zoneId);
      const dcId = zone?.datacenterId ? String(zone.datacenterId) : null;

      // emit reading live
      if (dcId) {
        io.to(`dc:${dcId}`).emit("reading:new", {
          nodeId: String(node._id),
          zoneId: String(node.zoneId),
          datacenterId: dcId,
          recordedAt: reading.recordedAt,
          values,
        });
      }

      // process alerts (min duration + cooldown)
      const metrics = [
        ["temperature", values.temperature, null],
        ["humidity", values.humidity, null],
        ["gasLevel", values.gasLevel, null],
        ["pressure", values.pressure, null],
        ["vibration", values.vibration, baseline],
      ];

      for (const [metricName, value, b] of metrics) {
  const datacenter = await Datacenter.findById(zone?.datacenterId);
  const ev = await processMetric({
    nodeId: node._id,
    zoneId: node.zoneId,
    metricName,
    value,
    baseline: b,
    nodeName: node.name,
    zoneName: zone?.name,
    datacenterName: datacenter?.name,
  });

        if (ev && dcId) {
          // 1) Push alert event to the right datacenter room
          io.to(`dc:${dcId}`).emit("alert:event", {
            type: ev.type, // notified | updated | resolved
            alert: ev.alert,
          });

          // 2) Recompute hierarchy status (node -> zone -> datacenter)
          //    and emit status:update + send email on CRITICAL (with cooldown)
          await recomputeAndEmitStatus({
            nodeId: node._id,
            io,
            triggerAlert: ev.alert,
          });
        }
      }
    }
  }, intervalMs);
}