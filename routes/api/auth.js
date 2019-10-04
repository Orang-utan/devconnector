const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route  GET api/auth
// @desc   Test route
// @access Public
router.get("/", auth, async (request, response) => {
  try {
    // return user data except for password
    const user = await User.findById(request.user.id).select("-password");
    response.json(user);
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

module.exports = router;
