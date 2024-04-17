const fs = require('fs').promises; 

async function loadQueriesAsync() {
  const queriesFilePath = './queries.json';
  try {
    const queriesRaw = await fs.readFile(queriesFilePath, 'utf8');
    return JSON.parse(queriesRaw);
  } catch (error) {
    console.error(`Failed to load queries from ${queriesFilePath}:`, error);
    throw error;
  }
}

module.exports = loadQueriesAsync;
