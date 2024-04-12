const fs = require('fs');

function loadQueries() {
  const queriesFilePath = './queries.json'; // Make sure the path is correct relative to where you call this function
  try {
    const queriesRaw = fs.readFileSync(queriesFilePath);
    return JSON.parse(queriesRaw);
  } catch (error) {
    console.error(`Failed to load queries from ${queriesFilePath}:`, error);
    throw error; // Rethrow to handle it in the endpoint
  }
}

module.exports = loadQueries;
