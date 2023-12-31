import React from 'react';
import { Link } from 'react-router-dom';

import './Home.scss';

export const Home = () => {
  return (
    <div className="home">
      <h1>Home</h1>

      <div>
        <Link to="/levelSelect">Start Game</Link>
      </div>

      <div>
        <Link to="/stats">Game Stats</Link>
      </div>

      <div>
        <Link to="/levelBuilder">Level Builder</Link>
      </div>

    </div>
  );
}