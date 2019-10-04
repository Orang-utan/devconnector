const jwt = require("jsonwebtoken");
const config = require("config");

// middleware function
// next indicate it moves onto next
module.exports = function(request, response, next) {
  // Get token from header
  const token = request.header("x-auth-token");

  // Check if not token
  if (!token) {
    return response.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
  } catch (error) {}
};
