
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
const routes = require('./routes');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// Setup Winston logger
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    loggingWinston,
  ],
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const COOKIE_KEY = process.env.COOKIE_KEY;

// Passport and session setup
app.use(session({
  secret: process.env.COOKIE_KEY,  // Use the same secret key
  resave: false,  // Avoid resaving the session if it hasn't changed
  saveUninitialized: false,  // Avoid creating sessions for unauthenticated users
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  // 1 day
    httpOnly: true,  // Prevent JavaScript from accessing the cookie
  },
}));

// Make sure you still have these lines for Passport session handling
app.use(passport.initialize());
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  done(null, profile);
}));


// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware for handling CORS
app.use(function(req, res, next) {
  if(req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  if(req.headers['access-control-request-method']) {
    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
  }
  if(req.headers['access-control-request-headers']) {
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
  }
  if(req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware for parsing plain text
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
      } catch (error) {
        console.error('Error parsing JSON from text/plain request body:', error);
      }
      next();
    });
  } else {
    next();
  }
});

// Middleware for cookie parsing
app.use(cookieParser());

// Mount routes (including authentication and other routes)
app.use('/', routes);

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server.'
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
