import { useEffect, useState } from "react";

export const useControls = () => {
  const [leftKeyPressed, setLeftKeyPressed] = useState(false);
  //let leftKeyPressed = false;
  let rightKeyPressed = false;
  let upKeyPressed = false;
  let downKeyPressed = false;

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        // leftKeyPressed = true;
        setLeftKeyPressed(true);
        break;
      case "ArrowRight":
      case "d":
        rightKeyPressed = true;
        break;
      case "ArrowUp":
      case "w":
        upKeyPressed = true;
        break;
      case "ArrowDown":
      case "s":
        downKeyPressed = true;
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event) => {
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        //leftKeyPressed = false;
        setLeftKeyPressed(false);
        break;
      case "ArrowRight":
      case "d":
        rightKeyPressed = false;
        break;
      case "ArrowUp":
      case "w":
        upKeyPressed = false;
        break;
      case "ArrowDown":
      case "s":
        downKeyPressed = false;
        break;
      default:
        break;
    }
  };

  return {
    handleKeyDown,
    handleKeyUp,
    leftKeyPressed,
    rightKeyPressed,
    upKeyPressed,
    downKeyPressed
  }
}