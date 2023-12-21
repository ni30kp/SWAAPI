const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const sqlite3 = require("sqlite3").verbose();
const _ = require("lodash");


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to SQLite database (in-memory for simplicity, consider using a file-based database in a real project)
const db = new sqlite3.Database(":memory:");

// Create a table to store cached data
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS cache (resource TEXT PRIMARY KEY, data TEXT)"
  );
});

// Function to fetch data from SWAPI
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return JSON.stringify(response.data);
  } catch (error) {
    throw new Error(`Error fetching data from ${url}: ${error.message}`);
  }
};

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
// Define search endpoint
app.get('/swapi/search', async (req, res) => {
  try {
    const { resource, query } = req.query;

    // Construct SWAPI search URL
    const swapiUrl = `https://swapi.dev/api/${resource}/?search=${query}`;

    // Fetch data from SWAPI
    const { data } = await axios.get(swapiUrl);

    // Return the data from SWAPI as-is
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Define sort endpoint
app.get('/swapi/sort', async (req, res) => {
  try {
    const { resource, attribute, order } = req.query;

    // Construct SWAPI sort URL
    const swapiUrl = `https://swapi.dev/api/${resource}/?format=json&ordering=${order === 'asc' ? '' : '-'}${attribute}`;

    // Fetch data from SWAPI
    const { data } = await axios.get(swapiUrl);

    // Return the data from SWAPI as-is
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get data with caching and query parameters
app.get('/swapi/:resource', async (req, res) => {
  const { resource } = req.params;
  const { page = 1, items_per_page = 10, sort, order, search } = req.query;

  const offset = (page - 1) * items_per_page;  // Calculate offset

  // Adjusted API URL to include offset and items_per_page
  const apiUrl = `https://swapi.dev/api/${resource}/?page=${page}&format=json&offset=${offset}&limit=${items_per_page}`;

  // Check if data is in the cache
  db.get('SELECT data FROM cache WHERE resource = ?', [resource], async (err, row) => {
    if (row) {
      console.log(`Cache hit for ${resource}`);
      const cachedData = JSON.parse(row.data);

      // Apply sorting and searching if specified
      let result = _.cloneDeep(cachedData);
      if (sort) {
        result.results = _.orderBy(result.results, sort, order || 'asc');
      }
      if (search) {
        result.results = result.results.filter(item =>
          Object.values(item).some(value => String(value).toLowerCase().includes(search.toLowerCase()))
        );
      }

      return res.json(result);
    }

    // Fetch data from SWAPI
    try {
      const data = await fetchData(apiUrl);

      // Update cache
      db.run('INSERT OR REPLACE INTO cache (resource, data) VALUES (?, ?)', [resource, data]);

      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});


// Endpoint to get details for a specific item within a resource
app.get("/swapi/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  const apiUrl = `https://swapi.dev/api/${resource}/${id}/`;

  // Fetch data from SWAPI
  try {
    const data = await fetchData(apiUrl);
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cron job to update data periodically
cron.schedule("0 * * * *", async () => {
  console.log("Updating cache...");
  const resources = [
    "people",
    "films",
    "starships",
    "vehicles",
    "species",
    "planets",
  ];

  for (const resource of resources) {
    const apiUrl = `https://swapi.dev/api/${resource}/?format=json`;
    const data = await fetchData(apiUrl);

    // Update cache
    db.run("INSERT OR REPLACE INTO cache (resource, data) VALUES (?, ?)", [
      resource,
      data,
    ]);
  }

  console.log("Cache updated successfully.");
});
// Endpoint for /swapi/people
app.get("/swapi/people", async (req, res) => {
  try {
    const response = await axios.get("https://swapi.dev/api/people/");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint for /swapi/people/:id
app.get('/swapi/people/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://swapi.dev/api/people/${id}/`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: 'Not Found' });
  }
});

// Endpoint for /swapi/planets/:id
app.get('/swapi/planets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://swapi.dev/api/planets/${id}/`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: 'Not Found' });
  }
});

// Endpoint for /swapi/species/:id
app.get('/swapi/species/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://swapi.dev/api/species/${id}/`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: 'Not Found' });
  }
});

// Endpoint for /swapi/starships/:id
app.get('/swapi/starships/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://swapi.dev/api/starships/${id}/`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: 'Not Found' });
  }
});
//end point for testing
app.get("/test", (req, res) => {
  res.json({ message: "Hello, this is a test endpoint!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});