import AlertThreshold from "../models/AlertThreshold.js";

// GET /api/thresholds?zoneId=xxx
export const getThresholds = async (req, res) => {
  try {
    const filter = req.query.zoneId ? { zoneId: req.query.zoneId } : {};
    const thresholds = await AlertThreshold.find(filter).populate("zoneId", "name");
    res.json({ success: true, data: thresholds });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching thresholds", error });
  }
};

// POST /api/thresholds
export const createThreshold = async (req, res) => {
  try {
    const threshold = await AlertThreshold.create(req.body);
    res.status(201).json({ success: true, data: threshold });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating threshold", error });
  }
};

// PUT /api/thresholds/:id
export const updateThreshold = async (req, res) => {
  try {
    const threshold = await AlertThreshold.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!threshold) return res.status(404).json({ success: false, message: "Threshold not found" });
    res.json({ success: true, data: threshold });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating threshold", error });
  }
};

// DELETE /api/thresholds/:id
export const deleteThreshold = async (req, res) => {
  try {
    await AlertThreshold.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Threshold deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting threshold", error });
  }
};
