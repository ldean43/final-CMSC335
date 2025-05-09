const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();
const app = express();

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
const dbName = "CMSC335DB";

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Make the DB client available to routes
app.use((req, res, next) => {
  req.dbClient = client;
  req.dbName = dbName;
  next();
});

// Routing
const earthquakesRouter = require("./routes/earthquakes");
app.use("/earthquakes", earthquakesRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Server + shutdown logic
const readline = require("readline");
const port = process.argv[2] || 3000;

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Type 'stop' to shut down the server.");
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("line", input => {
  if (input.trim().toLowerCase() === "stop") {
    console.log("Shutting down the server...");
    server.close(() => {
      rl.close();
      process.exit(0);
    });
  }
});
