import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_PHONE_NUMBER;
const TO   = process.env.TWILIO_ALERT_TO;

const smsCooldowns = new Map();
const SMS_COOLDOWN_MS = 15 * 60_000;

function canSendSms(key) {
  const last = smsCooldowns.get(key) || 0;
  return Date.now() - last >= SMS_COOLDOWN_MS;
}

export async function sendAlertSms({ severity, metricName, metricValue, nodeName, zoneName, datacenterName }) {
  if (!FROM || !TO) return;

  const key = `${nodeName}:${metricName}`;
  if (!canSendSms(key)) return;

  const label = severity === "critical" ? "CRITIQUE" : "AVERTISSEMENT";

  const metricLabel = {
    temperature: "Temperature",
    humidity:    "Humidite",
    gasLevel:    "Gaz/Fumee",
    pressure:    "Pression",
    vibration:   "Vibration",
  }[metricName] ?? metricName;

  const unit = {
    temperature: "C",
    humidity:    "%",
    gasLevel:    "PPM",
    pressure:    "hPa",
    vibration:   "mm/s",
  }[metricName] ?? "";

  const body =
    `[Sentinel IoT - Ooredoo]\n` +
    `ALERTE ${label}\n` +
    `-------------------------\n` +
    `Datacenter : ${datacenterName ?? "DC"}\n` +
    `Zone       : ${zoneName ?? "Zone"}\n` +
    `Noeud      : ${nodeName}\n` +
    `${metricLabel} : ${Number(metricValue).toFixed(2)} ${unit}\n` +
    `Heure      : ${new Date().toLocaleString("fr-FR", { timeZone: "Africa/Tunis" })}\n` +
    `-------------------------\n` +
    `Veuillez verifier le dashboard immediatement.`;

  try {
    await client.messages.create({ from: FROM, to: TO, body });
    smsCooldowns.set(key, Date.now());
    console.log(`SMS envoye -> ${TO} | ${metricLabel} ${label} sur ${nodeName}`);
  } catch (err) {
    console.error("SMS error:", err.message);
  }
}