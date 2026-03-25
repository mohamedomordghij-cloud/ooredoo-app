// Mock data for dashboard demo before real data is connected

export const mockMetrics = {
  temperature: { current: 22.5, min: 18, max: 27, unit: "°C", status: "normal" as const },
  humidity: { current: 45, min: 30, max: 60, unit: "%HR", status: "normal" as const },
  gasLevel: { current: 12, min: 0, max: 50, unit: "ppm", status: "normal" as const },
  pressure: { current: 1013, min: 980, max: 1040, unit: "hPa", status: "normal" as const },
  vibration: { current: 0.3, min: 0, max: 2, unit: "mm/s", status: "normal" as const },
};

type Status = "normal" | "warning" | "critical";

export const mockZones: Array<{ id: string; name: string; status: Status; nodeCount: number; avgTemp: number; avgHumidity: number; description: string }> = [
  { id: "zone-a", name: "Zone A - Serveurs", status: "normal", nodeCount: 4, avgTemp: 22.5, avgHumidity: 45, description: "Salle serveurs principale avec racks haute densité" },
  { id: "zone-b", name: "Zone B - Réseau", status: "warning", nodeCount: 3, avgTemp: 25.8, avgHumidity: 52, description: "Infrastructure réseau et commutateurs" },
  { id: "zone-c", name: "Zone C - Énergie", status: "normal", nodeCount: 3, avgTemp: 21.2, avgHumidity: 40, description: "UPS, générateurs et distribution électrique" },
];

type Severity = "info" | "warning" | "critical";
type AlertStatus = "active" | "acknowledged" | "resolved";

export const mockAlerts: Array<{
  id: string;
  severity: Severity;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  time: string;
  status: AlertStatus;
  datacenter: string;
  zone: string;
  nodeId: string;
  timestamp: string;
}> = [
  { id: "1", severity: "critical", message: "Température élevée dépassant le seuil critique", metric: "temperature", value: 42, threshold: 35, time: "Il y a 5 min", status: "active", datacenter: "Charguia", zone: "Zone A - Serveurs", nodeId: "ESP32-A2", timestamp: "2026-02-17 10:32:00" },
  { id: "2", severity: "critical", message: "Panne réseau détectée - connectivité perdue", metric: "network", value: 0, threshold: 1, time: "Il y a 8 min", status: "active", datacenter: "Charguia", zone: "Zone B - Réseau", nodeId: "ESP32-B3", timestamp: "2026-02-17 10:29:00" },
  { id: "3", severity: "warning", message: "Humidité élevée approchant le seuil", metric: "humidity", value: 58, threshold: 55, time: "Il y a 12 min", status: "active", datacenter: "Charguia", zone: "Zone B - Réseau", nodeId: "ESP32-B1", timestamp: "2026-02-17 10:25:00" },
  { id: "4", severity: "warning", message: "Batterie UPS faible - niveau critique", metric: "power", value: 15, threshold: 20, time: "Il y a 20 min", status: "active", datacenter: "Sousse", zone: "Zone C - Énergie", nodeId: "ESP32-C2", timestamp: "2026-02-17 10:17:00" },
  { id: "5", severity: "warning", message: "Vibrations anormales détectées", metric: "vibration", value: 1.8, threshold: 1.5, time: "Il y a 35 min", status: "acknowledged", datacenter: "Charguia", zone: "Zone A - Serveurs", nodeId: "ESP32-A4", timestamp: "2026-02-17 10:02:00" },
  { id: "6", severity: "info", message: "Nœud ESP32-C3 reconnecté après maintenance", metric: "connectivity", value: 0, threshold: 0, time: "Il y a 30 min", status: "acknowledged", datacenter: "Charguia", zone: "Zone C - Énergie", nodeId: "ESP32-C3", timestamp: "2026-02-17 10:07:00" },
  { id: "7", severity: "info", message: "Mise à jour firmware terminée", metric: "system", value: 0, threshold: 0, time: "Il y a 1h", status: "resolved", datacenter: "Sousse", zone: "Zone A - Serveurs", nodeId: "ESP32-A1", timestamp: "2026-02-17 09:37:00" },
  { id: "8", severity: "critical", message: "Détection de fumée - niveau anormal", metric: "gas", value: 45, threshold: 30, time: "Il y a 2h", status: "resolved", datacenter: "Sousse", zone: "Zone A - Serveurs", nodeId: "ESP32-A3", timestamp: "2026-02-17 08:37:00" },
];

export const mockNodes = [
  { id: "esp32-a1", name: "ESP32-A1", zone: "Zone A", online: true, lastPing: "Il y a 10s", temp: 22.1, humidity: 44, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:01", sensors: ["temperature", "humidity", "gas"] },
  { id: "esp32-a2", name: "ESP32-A2", zone: "Zone A", online: true, lastPing: "Il y a 15s", temp: 23.0, humidity: 46, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:02", sensors: ["temperature", "humidity", "pressure"] },
  { id: "esp32-a3", name: "ESP32-A3", zone: "Zone A", online: true, lastPing: "Il y a 8s", temp: 22.8, humidity: 45, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:03", sensors: ["temperature", "humidity", "vibration"] },
  { id: "esp32-a4", name: "ESP32-A4", zone: "Zone A", online: true, lastPing: "Il y a 12s", temp: 22.2, humidity: 44, firmware: "v2.1.2", mac: "AA:BB:CC:DD:EE:04", sensors: ["temperature", "humidity"] },
  { id: "esp32-b1", name: "ESP32-B1", zone: "Zone B", online: true, lastPing: "Il y a 5s", temp: 25.5, humidity: 58, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:05", sensors: ["temperature", "humidity", "gas"] },
  { id: "esp32-b2", name: "ESP32-B2", zone: "Zone B", online: true, lastPing: "Il y a 3s", temp: 28.5, humidity: 52, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:06", sensors: ["temperature", "humidity", "pressure"] },
  { id: "esp32-b3", name: "ESP32-B3", zone: "Zone B", online: false, lastPing: "Il y a 5min", temp: 0, humidity: 0, firmware: "v2.1.1", mac: "AA:BB:CC:DD:EE:07", sensors: ["temperature", "humidity"] },
  { id: "esp32-c1", name: "ESP32-C1", zone: "Zone C", online: true, lastPing: "Il y a 20s", temp: 21.0, humidity: 39, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:08", sensors: ["temperature", "humidity", "power"] },
  { id: "esp32-c2", name: "ESP32-C2", zone: "Zone C", online: true, lastPing: "Il y a 18s", temp: 21.5, humidity: 41, firmware: "v2.1.3", mac: "AA:BB:CC:DD:EE:09", sensors: ["temperature", "humidity", "vibration"] },
  { id: "esp32-c3", name: "ESP32-C3", zone: "Zone C", online: true, lastPing: "Il y a 25s", temp: 21.1, humidity: 40, firmware: "v2.1.2", mac: "AA:BB:CC:DD:EE:0A", sensors: ["temperature", "humidity", "gas"] },
];

export const mockDatacenters = [
  { id: "dc-charguia", name: "Charguia", location: "Tunis, Tunisie", status: "warning" as Status, zones: 3, nodes: 10, installDate: "2023-06-15", capacity: "150 racks", admin: "Mohamed Ben Ali" },
  { id: "dc-sousse", name: "Sousse", location: "Sousse, Tunisie", status: "normal" as Status, zones: 2, nodes: 6, installDate: "2024-01-20", capacity: "80 racks", admin: "Anis Trabelsi" },
];

export const mockAIPredictions = [
  { id: "pred-1", datacenter: "Charguia", zone: "Zone A - Serveurs", node: "ESP32-A2", metric: "temperature", currentValue: 34, predictedValue: 42, threshold: 35, probability: 85, timeToFailure: "1h 30min", severity: "warning" as Severity, recommendation: "Vérifier le système de refroidissement en Zone A" },
  { id: "pred-2", datacenter: "Sousse", zone: "Zone C - Énergie", node: "ESP32-C2", metric: "power", currentValue: 18, predictedValue: 10, threshold: 20, probability: 72, timeToFailure: "3h", severity: "warning" as Severity, recommendation: "Inspecter la batterie UPS et planifier le remplacement" },
  { id: "pred-3", datacenter: "Charguia", zone: "Zone B - Réseau", node: "ESP32-B1", metric: "humidity", currentValue: 58, predictedValue: 65, threshold: 60, probability: 68, timeToFailure: "4h", severity: "info" as Severity, recommendation: "Surveiller le taux d'humidité et ajuster la climatisation" },
];

export const mockAnomalies = [
  { id: "anom-1", datacenter: "Charguia", zone: "Zone A", node: "ESP32-A3", parameter: "Vibrations", normalRange: "0.1 - 0.5 mm/s", currentPattern: "Pics réguliers à 1.8 mm/s toutes les 15 min", timestamp: "2026-02-17 09:45:00", severity: "warning" as Severity },
  { id: "anom-2", datacenter: "Sousse", zone: "Zone A", node: "ESP32-A1", parameter: "Température", normalRange: "20 - 25°C", currentPattern: "Augmentation progressive de 0.5°C/h depuis 6h", timestamp: "2026-02-17 08:00:00", severity: "warning" as Severity },
  { id: "anom-3", datacenter: "Charguia", zone: "Zone B", node: "ESP32-B3", parameter: "Connectivité", normalRange: "Ping < 1s", currentPattern: "Interruptions fréquentes (5 déconnexions en 1h)", timestamp: "2026-02-17 10:15:00", severity: "critical" as Severity },
];

export const mockTemperatureHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  zoneA: 20 + Math.random() * 4,
  zoneB: 22 + Math.random() * 6,
  zoneC: 19 + Math.random() * 3,
}));

export const mockHumidityHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  zoneA: 40 + Math.random() * 10,
  zoneB: 45 + Math.random() * 15,
  zoneC: 38 + Math.random() * 8,
}));

export function getStatusColor(status: "normal" | "warning" | "critical") {
  switch (status) {
    case "normal": return "text-status-normal";
    case "warning": return "text-status-warning";
    case "critical": return "text-status-critical";
  }
}

export function getStatusBg(status: "normal" | "warning" | "critical") {
  switch (status) {
    case "normal": return "bg-status-normal/10 border-status-normal/30";
    case "warning": return "bg-status-warning/10 border-status-warning/30";
    case "critical": return "bg-status-critical/10 border-status-critical/30";
  }
}

export function getSeverityColor(severity: "info" | "warning" | "critical") {
  switch (severity) {
    case "info": return "text-muted-foreground";
    case "warning": return "text-status-warning";
    case "critical": return "text-status-critical";
  }
}
