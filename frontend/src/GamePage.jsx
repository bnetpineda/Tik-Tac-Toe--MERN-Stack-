// src/GamePage.jsx
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
// Helper function to determine the winner ('X' or 'O')
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // Returns 'X' or 'O'
    }
  }
  return null;
}

// Helper function to find the winning line indices
function findWinningLineIndices(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i]; // Return the array of indices [a, b, c]
    }
  }
  return null;
}

// Board Square Component
function Square({ value, onClick, isWinningSquare }) {
  const glowClass = isWinningSquare
    ? "text-pink-400 [text-shadow:_0_0_10px_theme(colors.pink.500),_0_0_20px_theme(colors.pink.600),_0_0_30px_theme(colors.pink.700)]"
    : "text-pink-500 group-hover:text-pink-400 group-hover:[text-shadow:_0_0_5px_theme(colors.pink.500),_0_0_10px_theme(colors.pink.600)]";

  return (
    <button
      className={`w-24 h-24 md:w-32 md:h-32 bg-gray-800 flex items-center justify-center text-5xl md:text-6xl border border-pink-700 cursor-pointer transition-all duration-200 ease-in-out group ${
        isWinningSquare ? "bg-pink-900" : "hover:bg-gray-700"
      }`}
      onClick={onClick}
    >
      <span className={`font-pixelify ${glowClass}`}>{value}</span>
    </button>
  );
}

function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { player1Name = "Player 1", player2Name = "Player 2" } =
    location.state || {};

  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [isDraw, setIsDraw] = useState(false);

  const [playerX, setPlayerX] = useState("");
  const [playerO, setPlayerO] = useState("");

  // State for player wins
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);

  // Effect to randomize who is X and O
  useEffect(() => {
    const randomXO = Math.random() < 0.5;
    if (randomXO) {
      setPlayerX(player1Name);
      setPlayerO(player2Name);
    } else {
      setPlayerX(player2Name);
      setPlayerO(player1Name);
    }
  }, [player1Name, player2Name]);

  // Effect to fetch initial win counts
  useEffect(() => {
    const fetchWins = async () => {
      if (!player1Name || !player2Name) return;
      const endpoint = `${API_BASE_URL}/api/show-winner`;
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          // Set wins to 0 or handle error appropriately if players not found initially
          setPlayer1Wins(0);
          setPlayer2Wins(0);
          return;
        }
        const allPlayers = await response.json();

        const p1Data = allPlayers.find((p) => p.name === player1Name);
        const p2Data = allPlayers.find((p) => p.name === player2Name);

        setPlayer1Wins(p1Data ? p1Data.wins : 0);
        setPlayer2Wins(p2Data ? p2Data.wins : 0);
      } catch (error) {
        console.error("Error fetching player wins:", error);
        setPlayer1Wins(0); // Default to 0 on error
        setPlayer2Wins(0);
      }
    };

    fetchWins();
  }, [player1Name, player2Name]); // Re-fetch if player names change

  const winner = calculateWinner(squares); // 'X' or 'O'
  const winningLineIndices = winner ? findWinningLineIndices(squares) : null; // [a,b,c] or null

  const currentPlayerName = xIsNext ? playerX : playerO;

  // Function to send win data to the backend
  const recordWin = useCallback(
    async (winnerName) => {
      if (!winnerName) return; // Do not proceed if winnerName is empty
      const endpoint = `${API_BASE_URL}/api/record-win`;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ winnerName }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Win recorded:", data.player);
          // Update local win count state immediately
          if (data.player.name === player1Name) {
            setPlayer1Wins(data.player.wins);
          } else if (data.player.name === player2Name) {
            setPlayer2Wins(data.player.wins);
          }
        } else {
          console.error("Error recording win:", data.message);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    },
    [player1Name, player2Name, setPlayer1Wins, setPlayer2Wins]
  ); // Dependencies for useCallback

  // Effect to handle game over (win or draw)
  useEffect(() => {
    if (winner) {
      const winnerPlayerName = winner === "X" ? playerX : playerO;
      // Ensure winnerPlayerName is determined before calling recordWin
      if (winnerPlayerName) {
        console.log(`Game Over! Winner: ${winnerPlayerName}`);
        recordWin(winnerPlayerName);
      }
    } else if (!winner && squares.every((square) => square !== null)) {
      setIsDraw(true);
      console.log("It's a Draw!");
    } else {
      setIsDraw(false);
    }
  }, [squares, winner, playerX, playerO, recordWin]);

  const handleClick = (i) => {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setIsDraw(false);
    // Re-randomize X/O
    const randomXO = Math.random() < 0.5;
    if (randomXO) {
      setPlayerX(player1Name);
      setPlayerO(player2Name);
    } else {
      setPlayerX(player2Name);
      setPlayerO(player1Name);
    }
    // Optionally re-fetch wins if you want to ensure they are fresh,
    // though recordWin should keep them in sync for the current players.
  };

  const handleGoHome = () => {
    navigate("/");
  };

  let status;
  if (winner) {
    status = `Winner: ${winner === "X" ? playerX : playerO}`;
  } else if (isDraw) {
    status = "It's a Draw!";
  } else {
    status = `Current Turn: ${currentPlayerName} (${xIsNext ? "X" : "O"})`;
  }

  const renderSquare = (i) => {
    const isWinningSquare =
      winner && winningLineIndices && winningLineIndices.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => handleClick(i)}
        isWinningSquare={isWinningSquare}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-pixelify flex flex-col items-center p-4">
      <h1 className="text-6xl md:text-7xl text-pink-500 [text-shadow:_0_0_5px_theme(colors.pink.600),_0_0_10px_theme(colors.pink.700)] text-center">
        Tic-Tac-Toe
      </h1>

      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between w-full max-w-5xl flex-grow mt-8">
        {/* Player 1 Info (Left) */}
        <div className="text-center md:text-left mb-8 md:mb-0 md:mr-4 lg:mr-8 flex-shrink-0 max-w-56 lg:max-w-64 w-full">
          <p className="text-sm md:text-base text-gray-400 mb-1">
            Wins: {player1Wins}
          </p>
          <h2
            className={`text-xl md:text-2xl mb-2 ${
              (xIsNext && playerX === player1Name) ||
              (!xIsNext && playerO === player1Name)
                ? "text-pink-500 [text-shadow:_0_0_5px_theme(colors.pink.600)]"
                : "text-gray-400"
            }`}
          >
            Player 1: {player1Name} ({playerX === player1Name ? "X" : "O"})
          </h2>
          <p className="text-base md:text-lg text-gray-400 break-words">
            {/* You can add more player 1 stats here later */}
          </p>
        </div>

        {/* Game Board and Status Container */}
        <div className="flex flex-col items-center flex-grow mx-2">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {Array(9)
              .fill(null)
              .map((_, i) => renderSquare(i))}
          </div>
          <div
            className={`mt-8 text-xl md:text-2xl text-center ${
              winner
                ? "text-green-500 [text-shadow:_0_0_5px_theme(colors.green.600)]"
                : isDraw
                ? "text-yellow-500 [text-shadow:_0_0_5px_theme(colors.yellow.600)]"
                : "text-pink-500 [text-shadow:_0_0_5px_theme(colors.pink.600)]"
            }`}
          >
            {status}
          </div>
          {(winner || isDraw) && (
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button
                className="bg-transparent text-pink-500 text-xl md:text-2xl font-pixelify py-2 px-4 border border-pink-500 rounded-md transition-all duration-300 ease-in-out [box-shadow:0_0_5px_theme(colors.pink.500),_0_0_15px_theme(colors.pink.600)] hover:bg-pink-500 hover:text-gray-900 hover:[box-shadow:0_0_10px_theme(colors.pink.600),_0_0_20px_theme(colors.pink.700)] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
                onClick={handleRestart}
              >
                Restart Game
              </button>
              <button
                className="bg-transparent text-gray-400 text-xl md:text-2xl font-pixelify py-2 px-4 border border-gray-400 rounded-md transition-all duration-300 ease-in-out hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                onClick={handleGoHome}
              >
                Go Home
              </button>
            </div>
          )}
        </div>

        {/* Player 2 Info (Right) */}
        <div className="text-center md:text-right mt-8 md:mt-0 md:ml-4 lg:ml-8 flex-shrink-0 max-w-56 lg:max-w-64 w-full">
          <p className="text-sm md:text-base text-gray-400 mb-1">
            Wins: {player2Wins}
          </p>
          <h2
            className={`text-xl md:text-2xl mb-2 ${
              (xIsNext && playerX === player2Name) ||
              (!xIsNext && playerO === player2Name)
                ? "text-pink-500 [text-shadow:_0_0_5px_theme(colors.pink.600)]"
                : "text-gray-400"
            }`}
          >
            Player 2: {player2Name} ({playerX === player2Name ? "X" : "O"})
          </h2>
          <p className="text-base md:text-lg text-gray-400 break-words">
            {/* You can add more player 2 stats here later */}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
