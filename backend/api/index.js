// api/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Player = require('../backend/models/Player'); // Adjust path if your Player.js model is elsewhere

const app = express();

// --- Environment Variables ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  // In a real app, you might exit or prevent startup if critical env vars are missing
  // For Vercel, it will fail during function invocation if MONGO_URI isn't set in Vercel's dashboard
}

// --- Middleware ---
// Configure CORS: Allow requests from your local dev environment and your Vercel domain
// For simplicity during setup, allowing all origins. Refine this for production.
app.use(cors({ origin: '*' })); // Example: app.use(cors({ origin: ['http://localhost:3000', 'https://your-project.vercel.app'] }));
app.use(express.json()); // To parse JSON request bodies

// --- Database Connection ---
// Mongoose connection logic. It's good practice to attempt connection at startup.
// Mongoose handles connection pooling internally.
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully via Express app on Vercel"))
  .catch(err => console.error("MongoDB connection error:", err));

// --- API Routes ---

// GET /api/show-winner
app.get('/api/show-winner', async (req, res) => {
  try {
    const players = await Player.find().sort({ wins: -1 }); // Sorting by wins descending
    res.status(200).json(players);
  } catch (err) {
    console.error("Error in /api/show-winner:", err.message);
    res.status(500).json({ message: "Error fetching players", error: err.message });
  }
});

// POST /api/record-win
app.post('/api/record-win', async (req, res) => {
  const { winnerName } = req.body;

  if (!winnerName) {
    return res.status(400).json({ message: "Winner name is required" });
  }

  try {
    let player = await Player.findOne({ name: winnerName });

    if (player) {
      player.wins += 1;
      await player.save();
    } else {
      player = new Player({ name: winnerName, wins: 1 });
      await player.save();
    }
    res.status(200).json({ message: "Win recorded successfully", player });
  } catch (err) {
    console.error("Error in /api/record-win:", err.message);
    res.status(500).json({ message: "Error recording win", error: err.message });
  }
});

// --- Catch-all for undefined API routes (optional) ---
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});


// --- Export the Express app for Vercel ---
// Vercel will look for this default export to run the serverless function.
module.exports = app;
