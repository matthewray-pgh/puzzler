import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.scss';

import { Home } from './pages/Home/Home.jsx';
import { GameLevel } from './pages/Game/GameLevel.jsx';
import { Stats } from './pages/Stats/Stats.jsx';

import { Player } from './components/Player';

import level from "./assets/levelOne.json";
import DungeonTiles from "./assets/images/DungeonTiles.png";

export const App = () => {
  // const [gameOver, setGameOver] = useState(false);
  // const levelMap = level.collisionMap;

  // const cellSize = level.cellSize;
  // const gridWidth = level.grid.width * cellSize;
  // const gridHeight = level.grid.height * cellSize;

  // gameloop
  // useEffect(() => {
  //   const movementDelay = Math.round(1000 / level.player.speed);
  //   const gameInterval = setInterval(() => {
  //   }, movementDelay);

  //   if(gameOver) { clearInterval(gameInterval); }

  //   return () => clearInterval(gameInterval);
  // }, [gameOver]);

  // const backgroundIndex = 0;
  // const collisionIndex = 1;
  // const animationIndex = 2;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GameLevel />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
      {/* background level */}
      {/* {level.baseMap.map((block, index) => {
        return (
          <Tile
            key={index}
            width={cellSize}
            height={cellSize}
            x={block.x * cellSize}
            y={block.y * cellSize}
            layerIndex={backgroundIndex}
            tileKey={block.tileKey}
          />
        );
      })} */}

      {/* collision / player layer */}
      {/* collision blocks */}
      {/* {levelMap.map((block, index) => {
        return (
          <CollisionBlock
            key={index}
            width={cellSize}
            height={cellSize}
            x={block.x * cellSize}
            y={block.y * cellSize}
            layerIndex={collisionIndex}
            tileKey={block.tileKey}
          />
        );
      })} */}

      {/* player */}
      {/* <Player
        width={30}
        height={30}
        playerIndex={1}
        // fill="green"
        collisionMinMax={{
          min: { x: 0, y: 0 },
          max: { x: gridWidth - cellSize, y: gridHeight - cellSize },
        }}
        level={level}
      /> */}

      {/* <LevelGrid
        width={level.grid.width}
        height={level.grid.height}
        cellSize={cellSize}
        zIndex={collisionIndex}
        borderColor='white'
        showCoords={false}
      /> */}

      {/* <Timer /> */}
    </BrowserRouter>
  );
}

export const LevelGrid = ({ width, height, cellSize, zIndex, borderColor="white", showCoords }) => {
  return (
    <div
      style={{
        position: "fixed",
        width: `${width * cellSize}px`,
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        columnGap: "0",
        zIndex: zIndex,
        border: `1px solid ${borderColor}`,
      }}
    >
      {Array.from(Array(height), (e, index) => {
        return Array.from(Array(width), (e, i) => {
          return (
            <div
              className="cell"
              key={i}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                color: borderColor,
                fontSize: "8px",
                textAlign: "center",
              }}
            >
              {showCoords && (
                <p>
                  ({i},{index})
                </p>
              )}
            </div>
          );
        });
      })}
    </div>
  );
};

export const RandomBaseTile = ({
  width,
  height,
  x,
  y,
  layerIndex,
}) => {
  const randomTileKey = level.baseTiles[Math.floor(Math.random() * level.baseTiles.length)];
  const tilePosition = level.dungeonTileKey.find((x) => x.id === randomTileKey);

  const styled = {
    width: `${width}px`,
    height: `${height}px`,
    background: `url(${DungeonTiles})`,
    backgroundPosition: `${tilePosition.x}px ${tilePosition.y}px`,
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    zIndex: layerIndex,
  };
  return <div data-testid="base-tile-block" style={styled}></div>;
};

export const Tile = ({
  width,
  height,
  x,
  y,
  layerIndex,
  tileKey,
}) => {
  const tilePosition = level.dungeonTileKey.find((x) => x.id === tileKey);

  const styled = {
    width: `${width}px`,
    height: `${height}px`,
    background: `url(${DungeonTiles})`,
    backgroundPosition: `${tilePosition.x}px ${tilePosition.y}px`,
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    zIndex: layerIndex,
  };
  return <div data-testid="tile" style={styled}></div>;
};

export const CollisionBlock = ({ width, height, x, y, layerIndex, tileKey }) => {  
  const tilePosition = level.dungeonTileKey.find(x => x.id === tileKey);

  const styled = {
    width: `${width}px`,
    height: `${height}px`,
    background: `url(${DungeonTiles})`,
    backgroundPosition: `${tilePosition.x}px ${tilePosition.y}px`,
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    zIndex: layerIndex,
  };
  return (
    <div id={`collision-block-${x}-${y}`} data-testid='collision-block' style={styled}></div>
  )
}

function useFrameTime(){
  const [frameTime, setFrameTime] = useState(performance.now());
  useEffect(() => {
    let frameId;
    const frame = (time) => {
      setFrameTime(time);
      frameId = window.requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);
  return frameTime;
}

const Timer = () => {
  const [startTime, setStartTime] = React.useState(0);
  const [pauseTime, setPauseTime] = React.useState(0);
  const paused = pauseTime !== undefined;
  const frameTime = useFrameTime();
  const displayTime = paused ? pauseTime : frameTime - startTime;
  const pause = () => {
    setPauseTime(displayTime);
  };
  const play = () => {
    setStartTime(performance.now() - pauseTime);
    setPauseTime(undefined);
  };

  const formatTimer = (time) => {
    let minutes = Math.floor(time / 60000);
    
    let seconds = Math.floor(time / 1000);
    let secondsString = seconds - minutes * 60;
    let displaySeconds =
      secondsString < 10 ? `0${secondsString}` : secondsString;
    
    let milliSeconds = Math.floor(time / 100);
    let displayMilliSeconds = milliSeconds - (seconds * 10);
    
    return `${minutes}:${displaySeconds}.${displayMilliSeconds}`;
  }

  return (
    <div className="timer">
      <div>{formatTimer(displayTime)}</div>
      <button onClick={paused ? play : pause}>
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
};

