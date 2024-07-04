const express = require("express");
const axios = require("axios");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const databasePath = path.join(__dirname, "hodlinfoDatabase.db");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

let database = null; // Declare the database variable

// Initialize the database
const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    await createTableIfNotExists();

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    );

    // Fetch and insert data after initializing the server
    await requestDataAndInsertIntoDb();

  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// Create the table if it does not exist
const createTableIfNotExists = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS hodlinfo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        last REAL,
        buy REAL,
        sell REAL,
        volume REAL,
        base_unit TEXT
      );
    `;
    await database.run(createTableQuery);
    console.log('Table created or already exists');
  } catch (error) {
    console.log(`Error creating table: ${error.message}`);
    throw error;
  }
};

// Fetch data from WazirX API and insert top 10 results into the database
const requestDataAndInsertIntoDb = async () => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const data = Object.values(response.data);

    // Sort data based on volume and get the top 10 results
    //const top10Data = data.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)).slice(0, 10);

    // Prepare data for insertion
    const dataTobeInserted = data.map(column => ({
      name: column.name,
      last: parseFloat(column.last),
      buy: parseFloat(column.buy),
      sell: parseFloat(column.sell),
      volume: parseFloat(column.volume),
      base_unit: column.base_unit,
    }));

    // Insert data into the database
    for (const entry of dataTobeInserted) {
      const insertQuery = `
        INSERT INTO hodlinfo (name, last, buy, sell, volume, base_unit)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await database.run(insertQuery, [
        entry.name,
        entry.last,
        entry.buy,
        entry.sell,
        entry.volume,
        entry.base_unit,
      ]);
    }

    console.log("Data inserted successfully");
  } catch (error) {
    console.error(`Error fetching or inserting data: ${error.message}`);
  }
}

// Route to get data from the database
app.get("/data", async (req, res) => {
  try {
    const getDataQuery = `SELECT * FROM hodlinfo`;
    const data = await database.all(getDataQuery);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    res.status(500).send({ error: "Error fetching data" });
  }
});

initializeDbAndServer();
