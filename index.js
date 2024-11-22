import { getLatestFile, parseFileContent } from './util.js';
import { authenticateToken } from './authenticateToken.js';
import express from "express";
import fs from "fs";
import https from 'https';

import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

const app = express();

// Directory where the raw data files are stored
const DATA_DIR = "./data";
dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 10, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(authenticateToken);

// Load SSL certificate and key
const sslOptions = {
  key: fs.readFileSync('./certs/neepco-spark.key'),  // Replace with the path to your private key
  cert: fs.readFileSync('./certs/neepco-spark.crt') // Replace with the path to your certificate
};

// API to read the latest file and return the JSON response
app.get("/api/data/nafra", (req, res) => {
  const latestFile = getLatestFile(DATA_DIR,'NEEPCO_NAFRA');

  if (!latestFile) {
    return res.status(404).json({ error: "No data files found." });
  }

  try {
    const content = fs.readFileSync(latestFile, "utf-8");
    const parsedData = parseFileContent(content, 'Nafra');
    res.json(parsedData);
  } catch (err) {
    res.status(500).json({ error: "Failed to read or parse the data file." });
  }
});

app.get("/api/data/dirang", (req, res) => {
  const latestFile = getLatestFile(DATA_DIR,'NEEPCO_MC');

  if (!latestFile) {
    return res.status(404).json({ error: "No data files found." });
  }

  try {
    const content = fs.readFileSync(latestFile, "utf-8");
    const parsedData = parseFileContent(content, 'Dirang');
    res.json(parsedData);
  } catch (err) {
    res.status(500).json({ error: "Failed to read or parse the data file." });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'The requested resource does not exist.' });
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start the server
const PORT = 443; // Standard HTTPS port
httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});
