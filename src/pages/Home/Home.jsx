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

      <div>
        <h2>Changelog</h2>
        <h3>v.0.1.3</h3>
        <ul>
          <li>Added player attack detection</li>
          <li>Added player direction state</li>
          <li>Add mob states: isIdle, isMoving, isAttacking, isCasting, isDamaged</li>
          <li>Reorganized tile list in level builder</li>
        </ul>
        <h3>v.0.1.2</h3>
        <ul>
          <li>Added doors to game (no animation).</li>
          <li>Player interaction messaging.</li>
        </ul>
        <h3>v.0.1.1</h3>
        <ul>
          <li>Added Level Builder with download of json data.</li>
          <li>Added level selection screen.</li>
        </ul>
        <h3>v.0.0.1</h3>
        <ul>
          <li>Level and Player.</li>
          <li>Player movement.</li>
          <li>Ghoul mob</li>
        </ul>
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
// start position not loading from json file
// player defsult facing after interaction

//TO DO:
// add game pause / unpause
// add level code generation for progress save and loading
// add player inventory / consumables
// -- need to decided on inventory size [min 2 (1 attack and 1 action) - max 6 (0-6 attack, 0-6 action, 0-6 consumable)]
// need game flow - start screen, game over, win screen / win condition
// add player attack animations (slash wave), death animations, spawn animations
// add chest - contains items, gold, keys, etc
// add keys - open locked doors
// add dash / slide to player - does minor damage to enemies - can be used to break pots and barrels
// add enemy health and damage, 
// add enemy attack animations, death animations, spawn animations
// add enemy spawn points, pathing
// add enemy attack range, attack cooldown, attack damage