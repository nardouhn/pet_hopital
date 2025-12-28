// const User = require("../Models/User"); // Sequelize User model
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config();
// const { successResponse, errorResponse } = require("../helpers/successAndErrorResponse");

// const JWT_SECRET = process.env.JWT_SECRET || "masai-secret";
// const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "masai-refresh-secret";

// /* ================= GET ALL USERS ================= */
// module.exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: { exclude: ["password"] } // loại bỏ password
//     });
//     res.status(200).json(successResponse(200, "Successfully retrieved users", users));
//   } catch (error) {
//     res.status(500).json(errorResponse(500, "Failed to retrieve users", error.message));
//   }
// };

// /* ================= DELETE USER ================= */
// module.exports.deleteUserById = async (req, res) => {
//   try {
//     const deletedUser = await User.destroy({
//       where: { user_id: req.params.id }
//     });
//     if (!deletedUser) {
//       return res.status(404).json(errorResponse(404, "User not found"));
//     }
//     res.status(200).json(successResponse(200, "User deleted successfully"));
//   } catch (error) {
//     res.status(500).json(errorResponse(500, error.message));
//   }
// };

// /* ================= UPDATE USER ================= */
// module.exports.updateUserById = async (req, res) => {
//   try {
//     const [updatedCount, updatedRows] = await User.update(req.body, {
//       where: { user_id: req.params.id },
//       returning: true
//     });

//     if (!updatedCount) {
//       return res.status(404).json(errorResponse(404, "User not found"));
//     }

//     const updatedUser = updatedRows[0].toJSON();
//     delete updatedUser.password;

//     res.status(200).json(successResponse(200, "User updated successfully", updatedUser));
//   } catch (error) {
//     res.status(500).json(errorResponse(500, error.message));
//   }
// };

// /* ================= REGISTER ================= */
// module.exports.registerNewUser = async (req, res) => {
//   try {
//     console.log("REQ BODY:", req.body); // debug xem frontend gửi gì
//     const { firstName, lastName, email, password, phone } = req.body;

//     if (!email || !password || !firstName || !lastName) {
//       return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ message: "Email đã tồn tại" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       first_name: firstName.trim(),
//       last_name: lastName.trim(),
//       email,
//       password: hashedPassword,
//       phone: phone || "",
//       user_type: "customer"
//     });

//     res.status(201).json({ message: "Đăng ký thành công", user: newUser });
//   } catch (error) {
//     console.error("REGISTER ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// /* ================= LOGIN ================= */
// module.exports.userLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json(errorResponse(401, "Invalid credentials"));
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json(errorResponse(401, "Invalid credentials"));
//     }

//     const accessToken = jwt.sign(
//       { userId: user.user_id, role: user.user_type },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     const refreshToken = jwt.sign(
//       { userId: user.user_id },
//       REFRESH_TOKEN_SECRET,
//       { expiresIn: "7d" }
//     );

//     const userResponse = {
//       id: user.user_id,
//       firstName: user.first_name,
//       lastName: user.last_name,
//       fullName: `${user.first_name} ${user.last_name}`,
//       email: user.email,
//       role: user.user_type,
//       phone: user.phone
//     };

//     res.status(200).json(
//       successResponse(200, "Login successful", {
//         user: userResponse,
//         accessToken,
//         refreshToken
//       })
//     );
//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     res.status(500).json(errorResponse(500, error.message));
//   }
// };
const User = require("../Models/User"); // Sequelize User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { successResponse, errorResponse } = require("../helpers/successAndErrorResponse");

const JWT_SECRET = process.env.JWT_SECRET || "masai-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "masai-refresh-secret";

/* ================= GET ALL USERS ================= */
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] } // loại bỏ password
    });
    res.status(200).json(successResponse(200, "Lấy danh sách người dùng thành công", users));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Lấy danh sách người dùng thất bại", error.message));
  }
};

/* ================= DELETE USER ================= */
module.exports.deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.destroy({
      where: { user_id: req.params.id }
    });
    if (!deletedUser) {
      return res.status(404).json(errorResponse(404, "Người dùng không tồn tại"));
    }
    res.status(200).json(successResponse(200, "Xóa người dùng thành công"));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Xóa người dùng thất bại", error.message));
  }
};

/* ================= UPDATE USER ================= */
module.exports.updateUserById = async (req, res) => {
  try {
    const [updatedCount, updatedRows] = await User.update(req.body, {
      where: { user_id: req.params.id },
      returning: true
    });

    if (!updatedCount) {
      return res.status(404).json(errorResponse(404, "Người dùng không tồn tại"));
    }

    const updatedUser = updatedRows[0].toJSON();
    delete updatedUser.password;

    res.status(200).json(successResponse(200, "Cập nhật người dùng thành công", updatedUser));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Cập nhật người dùng thất bại", error.message));
  }
};

/* ================= REGISTER ================= */
module.exports.registerNewUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email,
      password: hashedPassword,
      phone: phone || "",
      user_type: "customer"
    });

    // trả về giống format frontend mong muốn
    const userResponse = {
      id: newUser.user_id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      fullName: `${newUser.first_name} ${newUser.last_name}`,
      email: newUser.email,
      role: newUser.user_type,
      phone: newUser.phone
    };

    res.status(201).json(successResponse(201, "Đăng ký thành công", userResponse));
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json(errorResponse(500, "Đăng ký thất bại", error.message));
  }
};

/* ================= LOGIN ================= */
module.exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, role: user.user_type },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.user_type,
      phone: user.phone
    };

    res.status(200).json(
      successResponse(200, "Đăng nhập thành công", {
        user: userResponse,
        accessToken,
        refreshToken
      })
    );
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json(errorResponse(500, "Đăng nhập thất bại", error.message));
  }
};
/* ================= LOGOUT ================= */
module.exports.logoutUser = async (req, res) => {
  try {
    // Nếu bạn lưu refresh token trong DB thì xoá nó ở đây
    // Ví dụ: await Token.destroy({ where: { user_id: req.user.userId } });

    res.status(200).json(successResponse(200, "Đăng xuất thành công"));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Đăng xuất thất bại", error.message));
  }
};
