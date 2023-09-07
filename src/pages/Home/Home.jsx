import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <p>Home Page</p>

      <div>
        <Link to="/game">Start Game</Link>
      </div>

      <div>
        <Link to="/stats">Game Stats</Link>
      </div>

    </div>
  );
}