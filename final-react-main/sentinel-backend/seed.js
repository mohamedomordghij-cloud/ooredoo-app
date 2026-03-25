import "dotenv/config";
import mongoose from "mongoose";
import Datacenter from "./models/Datacenter.js";
import Zone from "./models/Zone.js";
import Node from "./models/Node.js";
import SensorReading from "./models/SensorReading.js";
import Alert from "./models/Alert.js";
import AlertThreshold from "./models/AlertThreshold.js";
import User from "./models/User.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await Promise.all([
    Datacenter.deleteMany(),
    Zone.deleteMany(),
    Node.deleteMany(),
    SensorReading.deleteMany(),
    Alert.deleteMany(),
    AlertThreshold.deleteMany(),
  ]);
  console.log("🗑️  Cleared existing data");

  // ─── Users ───
  await User.deleteMany({ email: { $ne: "admin@sentinel.com" } });
  const existingAdmin = await User.findOne({ email: "admin@sentinel.com" });
  if (!existingAdmin) {
    await User.create({
      email: "admin@sentinel.com",
      password: "admin123",
      fullName: "Admin Sentinel",
      role: "administrator",
      emailVerified: true,
    });
  }
  await User.create({ email: "superviseur@sentinel.com", password: "super123", fullName: "Karim Superviseur", role: "superviseur", emailVerified: true });
  await User.create({ email: "tech@sentinel.com", password: "tech123", fullName: "Anis Technicien", role: "technicien", emailVerified: true });
  await User.create({ email: "mohamedomor.dghij@isimg.tn", password: "Hh1234", fullName: "Mohamed Omar Dghij", role: "administrator", emailVerified: true });
  console.log("👤 Users created");

  // ─── Datacenters ───
  // Tunis = exemple (non simulé)
  const tunis = await Datacenter.create({ name: "Tunis North Hub", location: "Charguia, Tunis", status: "normal" });

  // Virtual DC = coeur du projet (temps réel)
  const vdc = await Datacenter.create({
    name: "Virtual DC - RealTime Lab",
    location: "Simulation",
    status: "normal",
  });

  console.log("🏢 Datacenters created (Tunis + Virtual DC)");

  // ─── Zones ───
  const tunisZones = await Zone.insertMany([
    { name: "Zone A - Serveurs", description: "Salle serveurs (exemple)", status: "normal", datacenterId: tunis._id },
    { name: "Zone B - Réseau", description: "Infrastructure réseau (exemple)", status: "normal", datacenterId: tunis._id },
  ]);

  const vdcZones = await Zone.insertMany([
    { name: "SIM - Salle Serveurs", description: "Zone virtuelle (racks + HVAC)", status: "normal", datacenterId: vdc._id },
    { name: "SIM - Energie & UPS", description: "Zone virtuelle (UPS + distribution)", status: "normal", datacenterId: vdc._id },
    { name: "SIM - Réseau", description: "Zone virtuelle (switches + routeurs)", status: "normal", datacenterId: vdc._id },
  ]);

  console.log("🗂️  Zones created");

  // ─── Nodes ───
  // Tunis nodes OFFLINE (pas de simulation ici)
  await Node.insertMany([
    { name: "TN-ESP32-1", zoneId: tunisZones[0]._id, isOnline: false, status: "normal", macAddress: "TN:00:00:00:00:01", firmwareVersion: "1.0", lastPing: new Date(Date.now() - 10 * 60_000) },
    { name: "TN-ESP32-2", zoneId: tunisZones[1]._id, isOnline: false, status: "normal", macAddress: "TN:00:00:00:00:02", firmwareVersion: "1.0", lastPing: new Date(Date.now() - 12 * 60_000) },
  ]);

  // Virtual DC nodes ONLINE (simulation temps réel)
  const vdcNodeSpecs = [
    { zoneIdx: 0, count: 4, prefix: "SIM-SRV" },
    { zoneIdx: 1, count: 3, prefix: "SIM-UPS" },
    { zoneIdx: 2, count: 3, prefix: "SIM-NET" },
  ];

  const vdcNodes = [];
  let seq = 1;
  for (const spec of vdcNodeSpecs) {
    for (let i = 0; i < spec.count; i++) {
      const name = `${spec.prefix}-ESP32-${i + 1}`;
      vdcNodes.push({
        name,
        zoneId: vdcZones[spec.zoneIdx]._id,
        isOnline: true,
        status: "normal",
        macAddress: `SIM:00:00:00:00:${String(seq).padStart(2, "0")}`,
        firmwareVersion: "sim-1.0",
        lastPing: new Date(),
      });
      seq++;
    }
  }
  const createdVdcNodes = await Node.insertMany(vdcNodes);
  console.log(`🧪 Virtual DC nodes created: ${createdVdcNodes.length} online`);

  // ─── Thresholds (par zone) ───
  const thresholds = [];
  for (const zone of [...tunisZones, ...vdcZones]) {
    thresholds.push(
      // Temperature
      { zoneId: zone._id, metricName: "temperature_normal", minValue: 18, maxValue: 27 },
      { zoneId: zone._id, metricName: "temperature_warning_low", minValue: 15, maxValue: 18 },
      { zoneId: zone._id, metricName: "temperature_warning_high", minValue: 27, maxValue: 30 },
      { zoneId: zone._id, metricName: "temperature_critical_low", minValue: -999, maxValue: 15 },
      { zoneId: zone._id, metricName: "temperature_critical_high", minValue: 30, maxValue: 999 },

      // Humidity
      { zoneId: zone._id, metricName: "humidity_normal", minValue: 40, maxValue: 60 },
      { zoneId: zone._id, metricName: "humidity_warning_low", minValue: 30, maxValue: 40 },
      { zoneId: zone._id, metricName: "humidity_warning_high", minValue: 60, maxValue: 70 },
      { zoneId: zone._id, metricName: "humidity_critical_low", minValue: -999, maxValue: 30 },
      { zoneId: zone._id, metricName: "humidity_critical_high", minValue: 70, maxValue: 999 },

      // Gas
      { zoneId: zone._id, metricName: "gas_normal", minValue: 0, maxValue: 300 },
      { zoneId: zone._id, metricName: "gas_warning", minValue: 300, maxValue: 500 },
      { zoneId: zone._id, metricName: "gas_critical", minValue: 500, maxValue: 999999 },

      // Pressure
      { zoneId: zone._id, metricName: "pressure_normal", minValue: 990, maxValue: 1030 },
      { zoneId: zone._id, metricName: "pressure_warning_low", minValue: 970, maxValue: 990 },
      { zoneId: zone._id, metricName: "pressure_warning_high", minValue: 1030, maxValue: 1050 },
      { zoneId: zone._id, metricName: "pressure_critical_low", minValue: -999, maxValue: 970 },
      { zoneId: zone._id, metricName: "pressure_critical_high", minValue: 1050, maxValue: 9999 },

      // Vibration ratios
      { zoneId: zone._id, metricName: "vibration_baseline_window_min", minValue: 10, maxValue: 10 },
      { zoneId: zone._id, metricName: "vibration_warning_ratio", minValue: 1.2, maxValue: 1.5 },
      { zoneId: zone._id, metricName: "vibration_critical_ratio", minValue: 1.5, maxValue: 999 }
    );
  }
  await AlertThreshold.insertMany(thresholds);
  console.log("⚙️  Thresholds created");

  // ─── Optional: one example alert on Tunis (static), Virtual alerts are generated by simulator ───
  const tnNode = await Node.findOne({ name: "TN-ESP32-1" });
  if (tnNode) {
    await Alert.create({
      nodeId: tnNode._id,
      zoneId: tunisZones[0]._id,
      metricName: "temperature",
      metricValue: 31,
      thresholdExceeded: 30,
      message: "Exemple: Température élevée (datacenter Tunis - démonstration)",
      severity: "warning",
      status: "acknowledged",
      acknowledgedAt: new Date(Date.now() - 30 * 60_000),
    });
  }

  console.log("✅ Seed complete! Login with:");
  console.log("   admin@sentinel.com / admin123");
  console.log("   superviseur@sentinel.com / super123");
  console.log("   tech@sentinel.com / tech123");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
