import React from "react";
import { Link } from "react-router-dom";

import "./Stats.scss";

export const Stats = () => {
  return (
    <div className="stats">
      <h1>Stats</h1>
      <Link to="/">Home</Link>
    </div>
  );
}