import Zone from "../models/Zone.js";
import Node from "../models/Node.js";

// GET /api/zones?datacenterId=xxx
export const getZones = async (req, res) => {
  try {
    const filter = req.query.datacenterId ? { datacenterId: req.query.datacenterId } : {};
    const zones = await Zone.find(filter).populate("datacenterId", "name");
    const result = await Promise.all(
      zones.map(async (z) => {
        const nodes = await Node.find({ zoneId: z._id });
        return { ...z.toJSON(), nodes };
      })
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching zones", error });
  }
};

// GET /api/zones/:id
export const getZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id).populate("datacenterId", "name");
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching zone", error });
  }
};

// POST /api/zones
export const createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating zone", error });
  }
};

// PUT /api/zones/:id
export const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating zone", error });
  }
};

// DELETE /api/zones/:id
export const deleteZone = async (req, res) => {
  try {
    await Zone.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Zone deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting zone", error });
  }
};
