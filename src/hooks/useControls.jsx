import { useState, useEffect, useCallback } from "react";

export const useControls = ({ canvasRef }) => {
  const [leftKeyPressed, setLeftKeyPressed] = useState(false);
  const [rightKeyPressed, setRightKeyPressed] = useState(false);
  const [upKeyPressed, setUpKeyPressed] = useState(false);
  const [downKeyPressed, setDownKeyPressed] = useState(false);
  const [mouseClicked, setMouseClicked] = useState(false);
  const [keysPressed, setKeysPressed] = useState([]);

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        setLeftKeyPressed(true);
        setKeysPressed((prevState) => [...prevState, event.key]);
        break;
      case "ArrowRight":
      case "d":
        setRightKeyPressed(true);
        setKeysPressed((prevState) => [...prevState, event.key]);
        break;
      case "ArrowUp":
      case "w":
        setUpKeyPressed(true);
        setKeysPressed((prevState) => [...prevState, event.key]);
        break;
      case "ArrowDown":
      case "s":
        setDownKeyPressed(true);
        setKeysPressed((prevState) => [...prevState, event.key]);
        break;
      default:
        break;
    }
  },[]);

  const handleKeyUp = useCallback((event) => {
    setKeysPressed((prevState) => prevState.filter((x) => x !== event.key));
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        setLeftKeyPressed(false);
        break;
      case "ArrowRight":
      case "d":
        setRightKeyPressed(false);
        break;
      case "ArrowUp":
      case "w":
        setUpKeyPressed(false);
        break;
      case "ArrowDown":
      case "s":
        setDownKeyPressed(false);
        break;
      default:
        break;
    }
  },[]);

  const handleMouseDown = useCallback(() => {
    setMouseClicked(true);
    setUpKeyPressed(false);
    setDownKeyPressed(false);
    setLeftKeyPressed(false);
    setRightKeyPressed(false);
  },[]);

  const handleMouseUp = useCallback(() => {
    setMouseClicked(false);
  },[]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousedown", handleMouseDown);

    const handleKeyDownEvent = (event) => handleKeyDown(event);
    const handleKeyUpEvent = (event) => handleKeyUp(event);

    window.addEventListener("keydown", handleKeyDownEvent);
    window.addEventListener("keyup", handleKeyUpEvent);

    return () => {
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousedown", handleMouseDown);

      window.removeEventListener("keydown", handleKeyDownEvent);
      window.removeEventListener("keyup", handleKeyUpEvent);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, canvasRef]);

  return {
    leftKeyPressed,
    rightKeyPressed,
    upKeyPressed,
    downKeyPressed,
    keysPressed,
    mouseClicked,
  }
}