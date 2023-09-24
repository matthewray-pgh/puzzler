import React, { useEffect, useState, useRef, useMemo } from 'react';
import './GameLevel.scss';

import level from "../../assets/levelOne.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import playerMasterSheet from "../../assets/images/character-master.png"
import wallTorchSpriteSheet from "../../assets/images/torch-Sheet.png";

import { useEnvironmentObject } from "../../hooks/useEnvironmentObject";

const TileSize = level.cellSize;

// grate
// skull stone
// spider web
// spike trap
// arrow shooter
// acid sprayer
// sliding spike wall / block
// pressure plate
// lever / switch

// chest
// door
// stairs
// dirty water
// fire
// candle(s)
// cauldron
// vines
// mossy stone
// barrel
// crate
// pottery

export const GameLevel = () => {
  //development tools
  const showGridOverlay = false;
  const showCollisionBox = false;

  const [keysPressed, setKeysPressed] = useState([]);

  let collisionObjects = [];

  let playerPosition = { x: 600, y: 250 };
  const playerSpeed = 2.25;

  const playerSize = TileSize * 1.5 + (TileSize * 1.5 / 2);
  const cellSize = TileSize * 1.5;
  const gridWidth = level.grid.width * cellSize;
  const gridHeight = level.grid.height * cellSize;

  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);

  const player = useMemo(() => {
    return {
      isIdle: true,
      isMoving: false,
      isAttacking: false,
      isDead: false,
      isHit: false,
      isJumping: false,
      isFalling: false,
      isCrouching: false,
      isClimbing: false,
      isSwimming: false,
      isDashing: false,
      isDodging: false,
      isBlocking: false,
      isStunned: false,
    };
  }, []);

  //idle animation variables
  let idleAnimationFrame = 0;
  const idleAnimationSpeed = 200; // Adjust this value for animation speed, Higher is slower
  let lastIdleAnimationFrameTime = 0;

  //move animation variables
  let moveAnimationFrame = 0;
  const moveAnimationSpeed = 135; // Adjust this value for animation speed, HIgher is slower
  let lastMoveAnimationFrameTime = 0;

  const { renderTorch } = useEnvironmentObject(cellSize, TileSize);

  useEffect(() => {
    //main collision canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    const playerImage = new Image();
    playerImage.src = playerMasterSheet;

    //background canvas
    const backgroundCanvas = backgroundCanvasRef.current;
    const backgroundCtx = backgroundCanvas.getContext("2d");

    backgroundCtx.webkitImageSmoothingEnabled = false;
    backgroundCtx.mozImageSmoothingEnabled = false;
    backgroundCtx.imageSmoothingEnabled = false;

    const wallTorch = new Image();
    wallTorch.src = wallTorchSpriteSheet;

    const dungeonTiles = new Image();
    dungeonTiles.src = dungeonTilesSheet;

    dungeonTiles.onload = () => {
      renderBackgroundLayer(backgroundCtx, dungeonTiles, gridWidth, gridHeight);
      renderCollisionLayer(backgroundCtx, dungeonTiles);
      playerImage.onload = () => {
        // startGame();
      };
    };
    
    const startGame = () => {  
      let flipImage = false;

      const gameLoop = (timestamp) => {
        ctx.clearRect(0, 0, gridWidth, gridHeight);

        ctx.save();
        ctx.translate(playerPosition.x + playerSize / 2, playerPosition.y + playerSize / 2);
        if (flipImage) {
          ctx.scale(-1, 1);
        }

        let spriteSheetPosition = renderPlayer(timestamp);
        ctx.drawImage(
          playerImage, 
          spriteSheetPosition.x, 
          spriteSheetPosition.y, 
          TileSize, 
          TileSize, 
          -playerSize / 2, 
          -playerSize / 2, 
          playerSize,
          playerSize
        );
        ctx.restore();

        //render torches
        renderTorch(ctx, timestamp, 144, 96);
        renderTorch(ctx, timestamp, 336, 96);
        renderTorch(ctx, timestamp, 144, 242);
        renderTorch(ctx, timestamp, 336, 242);
        renderTorch(ctx, timestamp, 144, 384);
        renderTorch(ctx, timestamp, 336, 384);

        //draw player collider box
        const movementCollisionBox = {
          x: playerPosition.x + playerSize / 3,
          y: playerPosition.y + playerSize / 2,
          width: playerSize * 0.3,
          height: cellSize * 0.6,
        };

        const hitBox = {
          x: playerPosition.x + playerSize * 0.3,
          y: playerPosition.y + playerSize * 0.2,
          width: playerSize * 0.4,
          height: playerSize * 0.7,
        };

        if(showCollisionBox) {
          ctx.strokeStyle = "red"; 
          ctx.lineWidth = 2; 
          ctx.strokeRect(movementCollisionBox.x, movementCollisionBox.y, movementCollisionBox.width, movementCollisionBox.height);

          ctx.strokeStyle = "blue"; 
          ctx.lineWidth = 2; 
          ctx.strokeRect(hitBox.x, hitBox.y, hitBox.width, hitBox.height);
        }

        const movePlayer = (dx, dy) => {
          const newPlayerX = playerPosition.x + dx;
          const newPlayerY = playerPosition.y + dy;

          const isCollision = collisionObjects.some((obj) => {
            return (
              movementCollisionBox.x + dx < obj.x + obj.width &&
              movementCollisionBox.x + dx + movementCollisionBox.width > obj.x &&
              movementCollisionBox.y + dy < obj.y + obj.height &&
              movementCollisionBox.y + dy + movementCollisionBox.height > obj.y
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
      const playerIsMoving = () => {
        setKeysPressed((prevState) => [...prevState, event.key]);
        player.isIdle = false;
        player.isMoving = true;
      };
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          leftKeyPressed = true;
          playerIsMoving();
          break;
        case 'ArrowRight':
        case 'd':
          rightKeyPressed = true;
          playerIsMoving();
          break;
        case 'ArrowUp':
        case 'w':
          upKeyPressed = true;
          playerIsMoving();
          break;
        case 'ArrowDown':
        case 's':
          downKeyPressed = true;
          playerIsMoving();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      setKeysPressed((prevState) => prevState.filter((x) => x !== event.key));
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

  useEffect(() => {
    if(keysPressed.length === 0) {
      player.isIdle = true;
      player.isMoving = false;
    } else {
      player.isIdle = false;
      player.isMoving = true;
    }
  }, [keysPressed, player]);

  const renderPlayer = (timestamp) => {
    const idleAnimationFrameTotal = 7;
    if(player.isIdle){
      const deltaTime = timestamp - lastIdleAnimationFrameTime;

      if (deltaTime >= idleAnimationSpeed) {
        // Update the animation frame
        idleAnimationFrame = (idleAnimationFrame + 1) % idleAnimationFrameTotal;
        lastIdleAnimationFrameTime = timestamp;
      }

      return {x: idleAnimationFrame * TileSize, y: 32};
    };

    const moveAnimationFrameTotal = 6;
    if(player.isMoving){
      const deltaTime = timestamp - lastMoveAnimationFrameTime;

      if (deltaTime >= moveAnimationSpeed) {
        // Update the animation frame
        moveAnimationFrame = (moveAnimationFrame + 1) % moveAnimationFrameTotal; 
        lastMoveAnimationFrameTime = timestamp;
      }

      return {x: moveAnimationFrame * TileSize, y: 64};
    };

    return {x: 0, y: 0}
  }

  const renderBackgroundLayer = (ctx, spriteSheet, width, height) => {
    ctx.clearRect(0, 0, width, height);

    level.baseMap.map((block, index) => {
      const x = block.x * cellSize;
      const y = block.y * cellSize;

      const tilePosition = level.dungeonTileKey.find((x) => x.id === block.tileKey);
      return ctx.drawImage(spriteSheet, tilePosition.x, tilePosition.y, TileSize, TileSize, x, y, cellSize, cellSize);
    });
  };

  const renderCollisionLayer = (ctx, spriteSheet) => {
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
        {showGridOverlay && <GridOverlay width={gridWidth} height={gridHeight} cellSize={cellSize} tileSize={TileSize} />}
      </div>
    </div>
  );
};

const GridOverlay = ({ width, height, cellSize, tileSize }) => {
  return (
    <div className="grid-overlay" data-testid="grid-overlay" 
      style={{ width: width, height: height, display: 'grid', 
        gridTemplateColumns: `repeat(${width / cellSize}, 1fr)`}}>
      {Array.from(Array(width / cellSize).keys()).map((x) => (
        <div key={x} className="grid-overlay__column">
          {Array.from(Array(height / cellSize).keys()).map((y) => (
            <div key={y} className="grid-overlay__row" style={{height: cellSize - 2}}>
              <div>{`${x}, ${y}`}</div>
              <div>{`${x * tileSize}, ${y * tileSize}`}</div>
              <div>{`${x * cellSize}, ${y * cellSize}`}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};