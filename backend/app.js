const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const routes = require('./routes');


app.use(function(req, res, next) {
  var oneof = false;
  if(req.headers.origin) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', 'true'); 
      oneof = true;
  }
  if(req.headers['access-control-request-method']) {
      res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
      oneof = true;
  }
  if(req.headers['access-control-request-headers']) {
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
      oneof = true;
  }
  if(oneof) {
      res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  }

  if (oneof && req.method == 'OPTIONS') {
      res.send(200);
  }
  else {
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

// Mount the router at the root path
app.use('/', routes);

// Middleware for the errors management
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
