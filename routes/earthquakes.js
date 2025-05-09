const express = require("express");
const router = express.Router();
const axios = require("axios");

const FEED_URLS = {
  hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
  month: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true,
  });
}

router.post("/fetch", async (req, res) => {
  const { range } = req.body;
  const url = FEED_URLS[range];

  if (!url) return res.status(400).send("Invalid time range.");

  try {
    const client = req.dbClient;
    await client.connect();
    const db = client.db(req.dbName);
    const collection = db.collection("earthquakes");

    const { data } = await axios.get(url);
    let earthquakes = data.features.map(eq => ({
      mag: eq.properties.mag,
      place: eq.properties.place,
      time: formatTime(eq.properties.time),
      id: eq.id,
      longitude: eq.geometry.coordinates[0],
      latitude: eq.geometry.coordinates[1]
    }));

    earthquakes = earthquakes
      .filter(eq => typeof eq.mag === "number")
      .sort((a, b) => b.mag - a.mag)
      .slice(0, 20);

    await collection.deleteMany({});
    await collection.insertMany(earthquakes);

    res.send(`
      <html>
      <head><title>Earthquake Fetch</title></head>
      <body>
        <h2>Earthquake data from the past ${range}</h2>
        <p>Stored ${earthquakes.length} records.</p>
        <a href="/">Go Back</a>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching earthquake data.");
  } finally {
    await req.dbClient.close();
  }
});

router.get("/all", async (req, res) => {
  try {
    await req.dbClient.connect();
    const db = req.dbClient.db(req.dbName);
    const data = await db.collection("earthquakes").find().toArray();
    res.json(data);
  } finally {
    await req.dbClient.close();
  }
});

module.exports = router;
