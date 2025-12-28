// const jwt = require("jsonwebtoken");
// const { Block } = require("../Models/BlockUser"); 
// const User = require("../Models/User"); 
// const { errorResponse } = require("../helpers/successAndErrorResponse");

// const JWT_SECRET = process.env.JWT_SECRET || "masai-secret";

// const authenticator = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;


//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res
//         .status(401)
//         .json(errorResponse(401, "Please login first"));
//     }

//     const token = authHeader.split(" ")[1];


//     const isBlacklisted = await Block.findOne({ where: { token } });
//     if (isBlacklisted) {
//       return res
//         .status(401)
//         .json(errorResponse(401, "Session expired, please login again"));
//     }


//     const decoded = jwt.verify(token, JWT_SECRET);


//     const user = await User.findByPk(decoded.userId); 
//     if (!user) {
//       return res
//         .status(404)
//         .json(errorResponse(404, "User not found"));
//     }


//     req.user = user;
//     req.userId = user.user_id.toString(); 

//     next();
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(401)
//       .json(errorResponse(401, "Invalid or expired token"));
//   }
// };

// module.exports = { authenticator };
const jwt = require("jsonwebtoken");
const { Block } = require("../Models/BlockUser"); 
const User = require("../Models/User"); 
const { errorResponse } = require("../helpers/successAndErrorResponse");
const { JWT_SECRET } = require("../config/jwt");

const authenticator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(errorResponse(401, "Please login first"));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json(errorResponse(404, "User not found"));
    }

    req.user = user;
    req.userId = user.user_id;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json(errorResponse(401, "Invalid or expired token"));
  }
};

module.exports = { authenticator };
