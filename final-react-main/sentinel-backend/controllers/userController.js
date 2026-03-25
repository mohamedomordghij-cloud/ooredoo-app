import User from "../models/User.js";

// GET /api/users  (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error });
  }
};

// PUT /api/users/:id/role  (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["administrator", "superviseur", "technicien", "utilisateur"];
    if (!validRoles.includes(role))
      return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user role", error });
  }
};

// DELETE /api/users/:id  (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id)
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user", error });
  }
};
