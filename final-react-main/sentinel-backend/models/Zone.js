import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["normal", "warning", "critical"],
      default: "normal",
    },
    datacenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Datacenter",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Zone", zoneSchema);
