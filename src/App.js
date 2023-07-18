import React, { useState, useRef, useEffect } from 'react';
import './App.scss';

export const App = () => {

  const gridSize = 8;
  const cellSize = 100;

  const backgroundIndex = 0;
  const collisionIndex = 1;
  const animationIndex = 2;

  return (
    <div className="App">
      {/* background level */}
      <LevelGrid gridSize={gridSize} cellSize={cellSize} zIndex={backgroundIndex} />
      {/* collision / player layer */}
      <LevelGrid gridSize={gridSize} cellSize={cellSize} zIndex={collisionIndex} borderColor="red" />
      {/* animation / interaction layer */}
      <LevelGrid gridSize={gridSize} cellSize={cellSize} zIndex={animationIndex} borderColor="blue" />
      <Player width={cellSize} height={cellSize} fill="green" x={0} y={0} playerIndex={1} />
      <Timer />
    </div>
  );
}


export const LevelGrid = ({ gridSize, cellSize, zIndex, borderColor="white" }) => {
  return (
    <div style={{
        position: "fixed",
        width: `${gridSize * cellSize}px`,
        display: "grid", 
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        columnGap: "0",
        zIndex: zIndex,
      }}>
        {Array.from(Array(gridSize), (e, index) => {
          return Array.from(Array(gridSize), (e, i) => {
            return (
              <div
                className="cell"
                key={i}
                style={{ 
                  width: `${cellSize}px`, 
                  height: `${cellSize}px`,
                  border: `1px solid ${borderColor}`
                }}
              ></div>
            );
          })
        })
      }
    </div>
  )
};

export const Player = ({ width, height, fill, x, y, playerIndex = 1 }) => {
  const [position, setPosition] = useState({x: x, y: y});
  
  const styled = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: fill,
    position: "absolute",
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: playerIndex,
    borderRadius: "50%",
  }

  const handleMove = ({key}) => {
    if(key === "ArrowRight" || key === "d") {
      const newPosition = { x: position.x + width, y: position.y };
      console.log("move right", newPosition);
      setPosition(newPosition);
    }
    else if(key === "ArrowLeft" || key === "a") {
      const newPosition = { x: position.x - width, y: position.y };
      console.log("move left", newPosition);
      setPosition(newPosition);
    }
    else if(key === "ArrowDown" || key === "s") {
      const newPosition = { x: position.x, y: position.y + height };
      console.log("move down", newPosition);
      setPosition(newPosition);
    }
    else if(key === "ArrowUp" || key === "w") {
      const newPosition = { x: position.x, y: position.y - height };
      console.log("move up", newPosition);
      setPosition(newPosition);
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
    let displaySeconds = seconds - (minutes * 60);
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

