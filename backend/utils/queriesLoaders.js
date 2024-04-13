const fs = require('fs').promises; 

async function loadQueriesAsync() {
  const queriesFilePath = './queries.json';
  console.log('Loading the queries from the path.')
  try {
    const queriesRaw = await fs.readFile(queriesFilePath, 'utf8');
    console.log('Done reading the file');
    return JSON.parse(queriesRaw);
  } catch (error) {
    console.error(`Failed to load queries from ${queriesFilePath}:`, error);
    throw error;
  }
}

module.exports = loadQueriesAsync;
