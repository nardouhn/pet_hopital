const express = require("express");
const { blockUser, getBlockedUsers } = require("../Models/BlockUser");
const { authenticator } = require("../middlewares/authenticator");
const { checkRole } = require("../middlewares/authorization");
const {
  getAllUsers,
  deleteUserById,
  userLogin,
  registerNewUser,
  updateUserById,
} = require("../controllers/userController.js");

const userRouter = express.Router();

/* ===================== AUTH ===================== */

// Register
userRouter.post("/register", registerNewUser);

// Login
userRouter.post("/login", userLogin);

// Logout (requires auth)
userRouter.post("/logout", authenticator, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Block token
    const block = new BlockModel({ token });
    await block.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ===================== ADMIN ROUTES ===================== */
// Get all users (admin/superadmin only)
userRouter.get(
  "/all",
  authenticator,
  checkRole(["admin", "superadmin"]),
  getAllUsers
);

// Update user by ID (admin/superadmin only)
userRouter.patch(
  "/update/:id",
  authenticator,
  checkRole(["admin", "superadmin"]),
  updateUserById
);

// Delete user by ID (admin/superadmin only)
userRouter.delete(
  "/delete/:id",
  authenticator,
  checkRole(["admin", "superadmin"]),
  deleteUserById
);

module.exports = { userRouter };
