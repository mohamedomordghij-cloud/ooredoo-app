import SensorReading from "../models/SensorReading.js";
import Node from "../models/Node.js";
import Zone from "../models/Zone.js";

// GET /api/sensors/latest?datacenterId=xxx
export const getLatestReadings = async (req, res) => {
  try {
    const { datacenterId } = req.query;
    let nodeIds = [];

    if (datacenterId) {
      const zones = await Zone.find({ datacenterId }, "_id");
      const nodes = await Node.find({ zoneId: { $in: zones.map((z) => z._id) } }, "_id");
      nodeIds = nodes.map((n) => n._id);
    }

    // get the latest reading per node
    const readings = await SensorReading.aggregate([
      ...(nodeIds.length ? [{ $match: { nodeId: { $in: nodeIds } } }] : []),
      { $sort: { recordedAt: -1 } },
      { $group: { _id: "$nodeId", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);

    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching latest readings", error });
  }
};

// GET /api/sensors/history?datacenterId=xxx  (default last 24h, supports hours & limit)
export const getSensorHistory = async (req, res) => {
  try {
    const { datacenterId } = req.query;

    const hoursRaw = req.query.hours;
    const hours = hoursRaw ? Math.max(1, Math.min(168, Number(hoursRaw))) : 24; // 1h..7d
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const limitRaw = req.query.limit;
    const limit = limitRaw ? Math.max(100, Math.min(200000, Number(limitRaw))) : null;

    let nodeIds = [];
    if (datacenterId) {
      const zones = await Zone.find({ datacenterId }, "_id");
      const nodes = await Node.find({ zoneId: { $in: zones.map((z) => z._id) } }, "_id");
      nodeIds = nodes.map((n) => n._id);
    }

    const filter = {
      recordedAt: { $gte: since },
      ...(nodeIds.length ? { nodeId: { $in: nodeIds } } : {}),
    };

    // Use DESC + limit, then reverse to keep ascending time in response (good for charts)
    let q = SensorReading.find(filter).sort({ recordedAt: -1 }).populate("nodeId", "name zoneId");
    if (limit) q = q.limit(limit);
    const readingsDesc = await q;
    const readings = readingsDesc.reverse();

    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sensor history", error });
  }
};

// POST /api/sensors  (ESP32 pushes data here)
export const createReading = async (req, res) => {
  try {
    const reading = await SensorReading.create(req.body);
    // update node lastPing and isOnline
    await Node.findByIdAndUpdate(req.body.nodeId, {
      lastPing: new Date(),
      isOnline: true,
    });
    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving sensor reading", error });
  }
};
