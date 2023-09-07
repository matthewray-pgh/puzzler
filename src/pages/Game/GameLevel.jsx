import React, { useEffect, useRef } from 'react';
import './GameLevel.scss';

import level from "../../assets/levelOne.json";
import DungeonTiles from "../../assets/images/DungeonTiles.png";
import playerSpriteSheet from "../../assets/images/character-1.png";

const TileSize = level.cellSize;

export const GameLevel = () => {
  const showCollisionBox = false;
  let collisionObjects = [];

  let playerPosition = { x: 500, y: 225 };
  const playerSpeed = 2;

  const playerSize = TileSize * 1.5 + (TileSize * 1.5 / 2);
  const cellSize = TileSize * 1.5;
  const gridWidth = level.grid.width * cellSize;
  const gridHeight = level.grid.height * cellSize;

  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);

  useEffect(() => {
    //main collision canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    const playerImage = new Image();
    playerImage.src = playerSpriteSheet;

    //background canvas
    const backgroundCanvas = backgroundCanvasRef.current;
    const backgroundCtx = backgroundCanvas.getContext("2d");

    backgroundCtx.webkitImageSmoothingEnabled = false;
    backgroundCtx.mozImageSmoothingEnabled = false;
    backgroundCtx.imageSmoothingEnabled = false;

    const dungeonTiles = new Image();
    dungeonTiles.src = DungeonTiles;

    dungeonTiles.onload = () => {
      console.log("dungeonTiles.onload");
      renderBackgroundLayer(backgroundCtx, dungeonTiles, gridWidth, gridHeight);
      renderCollisionLayer(backgroundCtx, dungeonTiles);
      playerImage.onload = () => {
        console.log("playerImage.onload");
        // startGame();
      };
    };
    
    const startGame = () => {  

      let flipImage = false;
      const gameLoop = () => {
        ctx.clearRect(0, 0, gridWidth, gridHeight);

        ctx.save();
        ctx.translate(playerPosition.x + playerSize / 2, playerPosition.y + playerSize / 2);
        if (flipImage) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(playerImage, 0, 0, TileSize, TileSize, -playerSize / 2, -playerSize / 2, playerSize, playerSize);
        ctx.restore();

        //draw player collider box
        if(showCollisionBox) {
          ctx.strokeStyle = "red"; 
          ctx.lineWidth = 2; 
          ctx.strokeRect(
            playerPosition.x + playerSize / 4, 
            playerPosition.y + playerSize / 4, 
            playerSize * 0.5, 
            playerSize * 0.6);
        }

        const movePlayer = (dx, dy) => {
          const newPlayerX = playerPosition.x + dx;
          const newPlayerY = playerPosition.y + dy;

          const isCollision = collisionObjects.some((obj) => {
            return (
              newPlayerX + playerSize / 4 < obj.x + obj.width &&
              newPlayerX + playerSize * 0.75 > obj.x &&
              newPlayerY + playerSize / 4 < obj.y + obj.height &&
              newPlayerY + playerSize * 0.75 > obj.y
            );
          });

          if (!isCollision) {
            playerPosition.x = newPlayerX;
            playerPosition.y = newPlayerY;
          }
        };

        //update player position
        if (leftKeyPressed) {
          movePlayer(-playerSpeed, 0);
          flipImage = false;
        }
        if (rightKeyPressed) {
          movePlayer(playerSpeed, 0);
          flipImage = true;
        }
        if (upKeyPressed) {
          movePlayer(0, -playerSpeed);
        }
        if (downKeyPressed) {
          movePlayer(0, playerSpeed);
        }

        requestAnimationFrame(gameLoop);
      };

      gameLoop();
    };

    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };

    let leftKeyPressed = false;
    let rightKeyPressed = false;
    let upKeyPressed = false;
    let downKeyPressed = false;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          leftKeyPressed = true;
          break;
        case 'ArrowRight':
        case 'd':
          rightKeyPressed = true;
          break;
        case 'ArrowUp':
        case 'w':
          upKeyPressed = true;
          break;
        case 'ArrowDown':
        case 's':
          downKeyPressed = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          leftKeyPressed = false;
          break;
        case 'ArrowRight':
        case 'd':
          rightKeyPressed = false;
          break;
        case 'ArrowUp':
        case 'w':
          upKeyPressed = false;
          break;
        case 'ArrowDown':
        case 's':
          downKeyPressed = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    startGame();

    return cleanup;
  }, []);

  const renderBackgroundLayer = (ctx, spriteSheet, width, height) => {
    console.log("renderBackgroundLayer");
    ctx.clearRect(0, 0, width, height);

    level.baseMap.map((block, index) => {
      const x = block.x * cellSize;
      const y = block.y * cellSize;

      const tilePosition = level.dungeonTileKey.find((x) => x.id === block.tileKey);
      return ctx.drawImage(spriteSheet, tilePosition.x, tilePosition.y, TileSize, TileSize, x, y, cellSize, cellSize);
    });
  };

  const renderCollisionLayer = (ctx, spriteSheet) => {
    console.log("renderCollisionLayer");
    collisionObjects = [];

    level.collisionMap.map((block, index) => {
      const x = block.x * cellSize;
      const y = block.y * cellSize;
      
      const tilePosition = level.dungeonTileKey.find((x) => x.id === block.tileKey);
      ctx.drawImage(spriteSheet, tilePosition.x, tilePosition.y, TileSize, TileSize, x, y, cellSize, cellSize);
      if(showCollisionBox) {
        ctx.strokeStyle = "yellow"; 
        ctx.lineWidth = 2; 
        ctx.strokeRect(x, y, cellSize, cellSize);
      }      
      collisionObjects.push({ x, y, width: cellSize, height: cellSize });
      
    });
  };

  return (
    <div>
      <div className="menu">
        <div>My Game - Dungeon Explorer</div>
        <div className="menu__buttons">
          <button>Pause Game</button>
        </div>
      </div>
      <div className="level">
        <canvas className="gameWindow-collisions" ref={canvasRef} width={gridWidth} height={gridHeight} />
        <canvas className="gameWindow-background" ref={backgroundCanvasRef} width={gridWidth} height={gridHeight} />
      </div>
    </div>
    
  );
};