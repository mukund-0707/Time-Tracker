const express = require("express");
const router = express.Router();
const User = require("../models/User");
TimeEntry = require("../models/TimeEntry");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// Middleware to check if user is not authenticated
function isNotAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return next();
  }
  res.redirect("/home");
}

// Landing page route
router.get("/", isNotAuthenticated, (req, res) => {
  res.render("landing");
});

// Home route
router.get("/home", isAuthenticated, async (req, res) => {
  // Assuming you have a TimeEntry model
  try {
    const entries = await TimeEntry.find();
    res.render("index", { entries });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Render registration page
router.get("/register", isNotAuthenticated, (req, res) => {
  res.render("register");
});

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    req.flash('success_msg', 'Registration successful, please log in.');
    res.redirect('/login');
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

// Render login page
router.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login");
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    
    // Check if user exists
    if (!user) {
      req.flash('error_msg', 'User not found. Please try again.');
      return res.redirect('/login');
    }

    // Use the comparePassword method
    console.log('Compare Password', password)
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      req.flash('error_msg', 'Invalid password');
      return res.redirect('/login');
    }

    // Store user ID in session
    req.session.userId = user._id;
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Login failed. Please try again.');
    res.redirect('/login');
  }
});


// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/login'); // Redirect to login after logout
  });
});

// Profile route (optional)
router.get('/profile', isAuthenticated, (req, res) => {
  res.json({ message: 'Welcome to your profile!' });
});

// Add time entry (assuming you have a TimeEntry model)
router.post(
  "/add",
  isAuthenticated,
  [
    check("user", "User is required").not().isEmpty(),
    check("startTime", "Start time is required").not().isEmpty(),
    check("endTime", "End time is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error_msg", "All fields are required");
      return res.redirect("/home");
    }

    const { user, startTime, endTime, description } = req.body;
    try {
      const newEntry = new TimeEntry({ user, startTime, endTime, description });
      await newEntry.save();
      req.flash("success_msg", "Time entry added successfully");
      res.redirect("/home");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Server Error");
      res.redirect("/home");
    }
  }
);

module.exports = router;
