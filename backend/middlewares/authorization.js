const { errorResponse } = require("../helpers/successAndErrorResponse");

// function checkRole(roles = []) {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json(errorResponse(401, "Unauthenticated"));
//     }

//     if (!roles.includes(req.user.user_type)) {
//       return res.status(403).json(
//         errorResponse(403, "Forbidden - No permission")
//       );
//     }

//     next();
//   };
// }
function checkRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse(401, "Unauthenticated"));
    }

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json(
        errorResponse(403, "Forbidden - No permission")
      );
    }

    next();
  };
}

module.exports = { checkRole };
