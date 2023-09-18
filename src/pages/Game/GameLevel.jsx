import React, { useEffect, useRef } from 'react';
import './GameLevel.scss';

import level from "../../assets/levelOne.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import playerSpriteSheet from "../../assets/images/character-spritesheet.png";
import wallTorchSpriteSheet from "../../assets/images/torch-Sheet.png";

const TileSize = level.cellSize;

export const GameLevel = () => {
  const showCollisionBox = false;
  let collisionObjects = [];

  let playerPosition = { x: 600, y: 250 };
  const playerSpeed = 2.5;

  const playerSize = TileSize * 1.5 + (TileSize * 1.5 / 2);
  const cellSize = TileSize * 1.5;
  const gridWidth = level.grid.width * cellSize;
  const gridHeight = level.grid.height * cellSize;

  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);

  const player = {
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

  //idle animation variables
  let idleAnimationFrame = 0;
  const idleAnimationSpeed = 125; // Adjust this value for animation speed
  let lastIdleAnimationFrameTime = 0;

  //torch animation variables
  const torchFrameTotal = 7;
  let torchAnimationFrame = 0;
  const torchAnimationSpeed = 125; // Adjust this value for animation speed
  let lastTorchAnimationFrameTime = 0;

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

        let spriteSheetPosition = { x: 0, y: 0};
        spriteSheetPosition = renderPlayer(timestamp);

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

        let torchSpriteSheetPosition = renderAnimatedEnvironmentObjects(timestamp);
        ctx.drawImage(
          wallTorch, 
          torchSpriteSheetPosition.x, 
          torchSpriteSheetPosition.y, 
          TileSize, 
          TileSize, 
          144, 
          96, 
          cellSize,
          cellSize
        );

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
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          leftKeyPressed = true;
          player.isIdle = false;
          break;
        case 'ArrowRight':
        case 'd':
          rightKeyPressed = true;
          player.isIdle = false;
          break;
        case 'ArrowUp':
        case 'w':
          upKeyPressed = true;
          player.isIdle = false;
          break;
        case 'ArrowDown':
        case 's':
          downKeyPressed = true;
          player.isIdle = false;
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
          player.isIdle = true;
          break;
        case 'ArrowRight':
        case 'd':
          rightKeyPressed = false;
          player.isIdle = true;
          break;
        case 'ArrowUp':
        case 'w':
          upKeyPressed = false;
          player.isIdle = true;
          break;
        case 'ArrowDown':
        case 's':
          downKeyPressed = false;
          player.isIdle = true;
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

  const renderPlayer = (timestamp) => {
    const idleAnimationFrameTotal = 7;
    if(player.isIdle){
      const deltaTime = timestamp - lastIdleAnimationFrameTime;

      if (deltaTime >= idleAnimationSpeed) {
        // Update the animation frame
        idleAnimationFrame = (idleAnimationFrame + 1) % idleAnimationFrameTotal; // Assuming you have 4 frames
        lastIdleAnimationFrameTime = timestamp;
      }

      return {x: idleAnimationFrame * TileSize, y: 0};
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

  const renderAnimatedEnvironmentObjects = (timestamp) => {
    const deltaTime = timestamp - lastTorchAnimationFrameTime;

    if (deltaTime >= torchAnimationSpeed) {
      torchAnimationFrame = (torchAnimationFrame + 1) % torchFrameTotal;
      lastTorchAnimationFrameTime = timestamp;
    }

    return {x: torchAnimationFrame * TileSize, y: 0};
  }

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