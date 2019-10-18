const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private (need to send a token)

// if the route is protected, just need to include the auth middleware
router.get("/me", auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({ user: request.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return response
        .status(400)
        .json({ msg: "There is no profile for this user" });
    }
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server Error");
  }
});

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skill is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = request.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = request.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.bio = location;
    if (bio) profileFields.bio = website;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: request.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: request.user.id },
          { $set: profileFields },
          { new: true, useFindAndModify: false }
        );
        return response.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server Error");
    }
  }
);

// @route  GET api/profile
// @desc   Get all profile
// @access Public
router.get("/", async (request, response) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    response.json(profiles);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get all profile
// @access Public
router.get("/user/:user_id", async (request, response) => {
  try {
    const profile = await Profile.findOne({
      user: request.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return response.status(400).json({ msg: "Profile not found" });

    response.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return response.status(400).json({ msg: "Profile not found" });
    }
    response.status(500).send("Server error");
  }
});

// @route  DELETE api/profile
// @desc   Delete profile, user, post
// @access Private
router.delete("/", auth, async (request, response) => {
  try {
    // @todo - remove user posts
    // Remove profile
    await Profile.findOneAndRemove({ user: request.user.id });

    // Remove user
    await User.findOneAndRemove({ _id: request.user.id });
    response.json({ msg: "User removed" });
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = request.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: request.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server Error");
    }
  }
);

module.exports = router;
