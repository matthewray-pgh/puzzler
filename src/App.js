import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.scss';

import { Home } from './pages/Home/Home.jsx';
import { GameLevel } from './pages/Game/GameLevel.jsx';
import { Stats } from './pages/Stats/Stats.jsx';
import { Admin } from './pages/Admin/Admin.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GameLevel />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
};