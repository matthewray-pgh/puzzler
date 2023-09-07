import React from "react";
import { Link } from "react-router-dom";

import "./Stats.scss";

export const Stats = () => {
  return (
    <div>
      <h1>Stats</h1>
      <p>Stats Page</p>
      <Link to="/">Home</Link>
    </div>
  );
}