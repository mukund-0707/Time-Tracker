const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

// Connect to MongoDB
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MD';
mongoose.connect(DB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret', // Use an environment variable for security
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    secure: process.env.NODE_ENV === 'production' // Secure cookie in production
  }
}));

app.use(flash());

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.userId = req.session.userId; // Pass userId to all views
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routes
app.use('/', require('./routes/index')); // Ensure routes are correctly set up

// Start server for local testing
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
