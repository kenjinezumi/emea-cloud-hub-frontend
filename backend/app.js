/* eslint-env node */

const express = require('express');
// const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors'); 
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", ["https://cloudhub.googleplex.com"]);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.status(204).end();
    return; 
  }

  next();
});

app.get('/', (req, res) => {
  console.log('GET request to the root');
  res.json({ message: 'GET request success' });
});

// Basic POST endpoint
app.post('/queryBigQuery', (req, res) => {
  console.log('POST request to /TEST');
  // Log the request body to see what was sent by the client
  console.log('Request Body:', req.body);
  res.json({ message: 'POST request success', requestBody: req.body });
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

