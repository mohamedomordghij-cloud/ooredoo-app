import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    metricName: { type: String, required: true },
    metricValue: { type: Number, required: true },
    thresholdExceeded: { type: Number, default: null },
    message: { type: String, default: null },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
    },
    acknowledgedAt: { type: Date, default: null },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
