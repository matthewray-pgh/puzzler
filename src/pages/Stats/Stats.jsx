import React from "react";
import { Link } from "react-router-dom";

import "./Stats.scss";

export const Stats = () => {
  return (
    <div className="stats">
      <h1>Stats</h1>
      <Link to="/">Home</Link>

      <div>
        <h1>Changelog</h1>
        <h3>v.0.4.0</h3>
        <ul>
          <li>Updated erase controls on Level Builder</li>
          <li>Added mob controls on Level Builder</li>
          <li>Updated attack indicator on Game level - changed from rect to circle</li>
        </ul>
        <h3>v.0.3.0</h3>
        <ul>
          <li>Added new home page "Lone Bridge Games"</li>
          <li>Bug fix: save on level builder</li>
          <li>Cleaned up unusabled level files</li>
        </ul>
        <h3>v.0.2.1</h3>
        <ul>
          <li>Added wooden doors to Game Levels</li>
        </ul>
        <h3>v.0.2.0</h3>
        <ul>
          <li>Level Builder redesign</li>
        </ul>
        <h3>v.0.1.4</h3>
        <ul>
          <li>Added Game Over flow</li>
          <li>Added prevention of player movment when taking damage</li>
        </ul>
        <h3>v.0.1.3</h3>
        <ul>
          <li>Added player attack detection</li>
          <li>Added player direction state</li>
          <li>Add mob states: isIdle, isMoving, isAttacking, isCasting, isDamaged</li>
          <li>Added mob health and damage</li>
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
}