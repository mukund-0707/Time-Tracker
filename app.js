const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MD')
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
  secret: 'testkskdjfkdkjk', // Replace with a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    secure: false // Set true if using HTTPS
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
app.use('/', require('./routes/index')); // Make sure your routes are set up correctly

// Start the server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
