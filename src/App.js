import React, { } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.scss';

import { Home } from './pages/Home/Home.jsx';
import { GameLevel } from './pages/Game/GameLevel.jsx';
import { Stats } from './pages/Stats/Stats.jsx';
import { LevelBuilder } from "./pages/LevelBuilder/LevelBuilder.jsx";
import { LevelSelect } from './pages/LevelSelect/LevelSelect.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:fileName" element={<GameLevel />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/levelBuilder" element={<LevelBuilder />} />
        <Route path="/levelSelect" element={<LevelSelect />} />
      </Routes>
    </BrowserRouter>
  );
};