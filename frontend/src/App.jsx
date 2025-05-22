// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import GamePage from "./GamePage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {" "}
          // Wrapping all Route components
          {/* Route for the homepage */}
          <Route path="/" element={<HomePage />} />
          {/* Route for /game */}
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
