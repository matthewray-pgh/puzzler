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
};

// image assets needed
// grate
// skull stone
// spider web
// spike trap
// arrow shooter
// acid sprayer
// sliding spike wall / block
// pressure plate
// lever / switch
// stairs
// dirty water
// fire
// candle(s)
// cauldron
// vines
// mossy stone
// barrel
// crate
// pottery

//BUGS:
// player defsult facing after interaction

//TO DO:
// add game pause / unpause
// add level code generation for progress save and loading
// add player inventory / consumables
// -- need to decided on inventory size [min 2 (1 attack and 1 action) - max 6 (0-6 attack, 0-6 action, 0-6 consumable)]
// need game flow - start screen, win screen / win condition
// add player attack animations (slash wave), 
// add player death animations, maybe on death keep player on screen, black behind
// add player spawn animations
// add chest - contains items, gold, keys, etc
// add keys - open locked doors
// add dash / slide to player - does minor damage to enemies - can be used to break pots and barrels
// add enemy attack animations, death animations, spawn animations
// add enemy spawn points, pathing
// add enemy attack range, attack cooldown, attack damage