const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required.").exists()
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { email, password } = request.body;
    try {
      // Check if user exists
      let user = await User.findOne({ email: email });
      if (!user) {
        // Add return keyword if it's not last response
        return response
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Compare plain text password w/ database password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return response
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Return json web token
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000000 },
        (error, token) => {
          if (error) throw error;
          response.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server error");
    }
  }
);

module.exports = router;
