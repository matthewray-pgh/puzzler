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