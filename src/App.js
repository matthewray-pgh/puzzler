import React, { useState, useRef, useEffect } from 'react';
import './App.scss';

import level from "./assets/levelOne.json";
import DungeonTiles from "./assets/images/DungeonTiles.png";
import Hero from "./assets/images/character-1.png";

export const App = () => {
  const [playerPosition, setPlayerPosition] = useState({x: 32, y: 32});
  const levelMap = level.collisionMap;

  const cellSize = level.cellSize;
  const gridWidth = level.grid.width * cellSize;
  const gridHeight = level.grid.height * cellSize;

  const backgroundIndex = 0;
  const collisionIndex = 1;
  const animationIndex = 2;

  return (
    <div className="App">
      {/* background level */}
      {level.baseMap.map((block, index) => {
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
      })}

      {/* collision / player layer */}
      {/* collision blocks */}
      {levelMap.map((block, index) => {
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
      })}

      {/* player */}
      <Player
        width={cellSize}
        height={cellSize}
        playerIndex={1}
        fill="green"
        position={playerPosition}
        handlePositionChange={setPlayerPosition}
        moveDistance={cellSize}
        collisionMinMax={{
          min: { x: 0, y: 0 },
          max: { x: gridWidth - cellSize, y: gridHeight - cellSize },
        }}
        levelMap={levelMap}
      />

      <LevelGrid
        width={level.grid.width}
        height={level.grid.height}
        cellSize={cellSize}
        zIndex={collisionIndex}
        borderColor='white'
        showCoords={false}
      />

      <Timer />
    </div>
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
    <div data-testid='collision-block' style={styled}></div>
  )
}

export const Player = ({ width, height, playerIndex = 1, fill, position, handlePositionChange, moveDistance, collisionMinMax, levelMap }) => {
  const styled = {
    width: `${width}px`,
    height: `${height}px`,
    // backgroundColor: fill,
    backgroundImage: `url(${Hero})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: `${1}px ${1}px`,
    position: "absolute",
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: playerIndex,
    // borderRadius: "50%",
  }

  const findMapCollisions = (position) => {
    const collision = levelMap.find((block) => {
      return (
        position.x === block.x * level.cellSize && 
        position.y === block.y * level.cellSize
      );
    });
    return collision ? true : false;
  };

  const handleMove = ({key}) => {
    // right
    if(key === "ArrowRight" || key === "d") {
      const newPosition = { x: position.x + moveDistance, y: position.y };
      if (
        newPosition.x > collisionMinMax.max.x || findMapCollisions(newPosition)) {
        // console.log("Collision!");
        return;
      }
      // console.log("move right", newPosition);
      handlePositionChange(newPosition);
    }
    // left
    else if(key === "ArrowLeft" || key === "a") {
      const newPosition = { x: position.x - moveDistance, y: position.y };
      if (newPosition.x < collisionMinMax.min.x || findMapCollisions(newPosition)) {
        // console.log("Collision!");
        return;
      }
      // console.log("move left", newPosition);
      handlePositionChange(newPosition);
    }
    // down
    else if(key === "ArrowDown" || key === "s") {
      const newPosition = { x: position.x, y: position.y + moveDistance };
      if (newPosition.y > collisionMinMax.max.y || findMapCollisions(newPosition)) {
        // console.log("Collision!");
        return;
      }
      // console.log("move down", newPosition);
      handlePositionChange(newPosition);
    }
    // up
    else if(key === "ArrowUp" || key === "w") {
      const newPosition = { x: position.x, y: position.y - moveDistance };
      if (newPosition.y < collisionMinMax.min.y || findMapCollisions(newPosition)) {
        // console.log("Collision!");
        return;
      }
      // console.log("move up", newPosition);
      handlePositionChange(newPosition);
    }
  };

  useEventListener("keydown", (e) => {handleMove(e)});

  return (
    <div style={styled} data-testid="player"></div>
  )
}

function useEventListener(eventName, handler, element = window){
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if(!isSupported) return;

    const eventListener = event => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
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

