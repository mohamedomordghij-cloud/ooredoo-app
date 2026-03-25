import mongoose from "mongoose";

const alertThresholdSchema = new mongoose.Schema(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    metricName: { type: String, required: true }, // temperature, humidity, gasLevel, etc.
    minValue: { type: Number, default: null },
    maxValue: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("AlertThreshold", alertThresholdSchema);
