import React, { useEffect, useState, useRef, useMemo } from 'react';
import './GameLevel.scss';

import level from "../../assets/levelOne.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import playerMasterSheet from "../../assets/images/character-master.png"

import { useEnvironmentObject } from "../../hooks/useEnvironmentObject";
import { useMob } from "../../hooks/useMobs";

import { HUD } from "../../components/HUD";

const TileSize = level.cellSize;
const cameraDimensions = {width: 15, height: 9};
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
  const scale = 2;
  const playerSize = TileSize * scale + (TileSize * scale / 2);
  const cellSize = TileSize * scale;
  const gridWidth = cameraDimensions.width * cellSize;
  const gridHeight = cameraDimensions.height * cellSize;
  const levelWidth = level.level.width * cellSize;
  const levelHeight = level.level.height * cellSize;

  const [keysPressed, setKeysPressed] = useState([]);

  let collisionObjects = [];

  let playerPosition = { x: 1 * cellSize, y: 3 * cellSize };
  const playerSpeed = 2.5;

  const [playerHealth, setPlayerHealth] = useState({ total: 3, current: 3 });
  const [playerMagic, setPlayerMagic] = useState({ total: 1, current: 1 });

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
      isDashing: false,
      isDodging: false,
      isBlocking: false,
      isStunned: false,
    };
  }, []);

  const camera = { 
    x: 0, 
    y: 0,
    width: gridWidth,
    height: gridHeight
  };

  const [display, setDisplay] = useState({
    level: 1, 
    x: playerPosition.x, 
    y: playerPosition.y,
    camera: camera
  });

  const canvasRef = useRef(null);

  //idle animation variables
  let idleAnimationFrame = 0;
  const idleAnimationSpeed = 200; // Adjust this value for animation speed, Higher is slower
  let lastIdleAnimationFrameTime = 0;

  //move animation variables
  let moveAnimationFrame = 0;
  const moveAnimationSpeed = 125; // Adjust this value for animation speed, HIgher is slower
  let lastMoveAnimationFrameTime = 0;

  const { renderTorch } = useEnvironmentObject(cellSize, TileSize);

  const mobs = [];
  const ghoul = useMob(cellSize, TileSize, playerSize, [{x: 1, y: 0.5}, {x: 8.75, y: 0.5}, {x: 8, y: 6.5}, {x: 1.5, y: 6.5}]);
  mobs.push(ghoul);
  // const ghoul2 = useMob(cellSize, TileSize, playerSize, [{x: 11, y: 1}, {x: 11.5, y: 8.25}, {x: 14.75, y: 8}, {x: 14.25, y: 1.75}]);
  // mobs.push(ghoul2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    const playerImage = new Image();
    playerImage.src = playerMasterSheet;

    const dungeonTiles = new Image();
    dungeonTiles.src = dungeonTilesSheet;
    
    const startGame = () => {  
      let flipImage = false;

      const gameLoop = (timestamp) => {
        updateCamera(cellSize);

        ctx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.save();        
        ctx.translate(-camera.x, -camera.y);

        renderBackgroundLayer(ctx, dungeonTiles, camera.width, camera.height);
        renderCollisionLayer(ctx, dungeonTiles);
        showGridOverlay && renderGridOverlay(ctx);

        //render torches
        renderTorch(ctx, timestamp, 3, 2);
        renderTorch(ctx, timestamp, 7, 2);
        renderTorch(ctx, timestamp, 3, 6);
        renderTorch(ctx, timestamp, 7, 6);

        //render mobs 
        ghoul.moveMob();
        ghoul.renderGhoul(ctx, timestamp, showCollisionBox);

        // ghoul2.moveMob();
        // ghoul2.renderGhoul(ctx, timestamp, showCollisionBox);

        //render player
        renderPlayer(timestamp, ctx, flipImage, playerImage);

        ctx.restore();

        //draw player collider box
        const movementCollisionBox = {
          x: playerPosition.x + (playerSize / 3) - camera.x,
          y: playerPosition.y + (playerSize / 2) - camera.y,
          width: playerSize * 0.3,
          height: cellSize * 0.65,
        };

        const hitBox = {
          x: playerPosition.x + (playerSize * 0.3) - camera.x,
          y: playerPosition.y + (playerSize * 0.2) - camera.y,
          width: playerSize * 0.4,
          height: playerSize * 0.75,
        };

        if(showCollisionBox) {
          //movement
          ctx.strokeStyle = "fuchsia"; 
          ctx.lineWidth = 2; 
          ctx.strokeRect(movementCollisionBox.x, movementCollisionBox.y, movementCollisionBox.width, movementCollisionBox.height);
          //hit
          ctx.strokeStyle = "aqua"; 
          ctx.lineWidth = 2; 
          ctx.strokeRect(hitBox.x, hitBox.y, hitBox.width, hitBox.height);
        }

        const movePlayer = (dx, dy) => {
          const newPlayerX = playerPosition.x + dx;
          const newPlayerY = playerPosition.y + dy;

          const isCollision = collisionObjects.some((obj) => {
            return (
              movementCollisionBox.x + dx + camera.x < obj.x + obj.width &&
              movementCollisionBox.x + dx + movementCollisionBox.width + camera.x > obj.x &&
              movementCollisionBox.y + dy + camera.y < obj.y + obj.height &&
              movementCollisionBox.y + dy + movementCollisionBox.height + camera.y > obj.y
            );
          });

          if (!isCollision) {
            playerPosition.x = newPlayerX;
            playerPosition.y = newPlayerY;
            setDisplay((prevState) => ({...prevState, x: playerPosition.x, y: playerPosition.y}));
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

        checkCollisions(hitBox);
        
        requestAnimationFrame(gameLoop);
      };

      gameLoop();
    };

    const checkCollisions = (playerCollisionBox) => {
      // Loop through each mob and check for collision with the player.
      mobs.forEach((mob) => {
        //console.log('mob:x', mob.mob.position.x * cellSize + mob.mob.collisionBox.x, 'y', mob.mob.position.y * cellSize + mob.mob.collisionBox.y);
        //console.log('player:x', playerCollisionBox.x, 'y', playerCollisionBox.y);
        if (
          playerCollisionBox.x + camera.x < mob.mob.position.x * cellSize + mob.mob.collisionBox.x + mob.mob.collisionBox.width &&
          playerCollisionBox.x + playerCollisionBox.width + camera.x > mob.mob.position.x * cellSize + mob.mob.collisionBox.x &&
          playerCollisionBox.y + camera.y < mob.mob.position.y * cellSize + mob.mob.collisionBox.y + mob.mob.collisionBox.height &&
          playerCollisionBox.y + playerCollisionBox.height + camera.y > mob.mob.position.y * cellSize + mob.mob.collisionBox.y
        ) {
          // Collision detected with this mob. You can handle it here (e.g., reduce player health).
          console.log('collision detected with mob!!!');
          player.isHit = true;
          if(player.isHit){
            setPlayerHealth((prevState) => ({...prevState, current: prevState.current - 1}));
          };
        }
      });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const updateCamera = (cellSize) => {
    const position = {
      x: playerPosition.x - gridWidth / 2,
      y: playerPosition.y - gridHeight / 2
    };

    camera.x = position.x < 0 ? 0 : position.x;
    camera.y = position.y < 0 ? 0 : position.y;

    if(position.x + camera.width > level.level.width * cellSize) {
      camera.x = level.level.width * cellSize - camera.width;
    }
    if(position.y + camera.height > level.level.height * cellSize) {
      camera.y = level.level.height * cellSize - camera.height;
    }

    setDisplay((prevState) => ({...prevState, camera: camera}));
  };

  const renderPlayer = (timestamp, ctx, flipImage, playerImage) => {
    let spriteSheetPosition = {x: 0, y: 0};
    const idleAnimationFrameTotal = 7;
    if(player.isIdle){
      const deltaTime = timestamp - lastIdleAnimationFrameTime;

      if (deltaTime >= idleAnimationSpeed) {
        // Update the animation frame
        idleAnimationFrame = (idleAnimationFrame + 1) % idleAnimationFrameTotal;
        lastIdleAnimationFrameTime = timestamp;
      }

      spriteSheetPosition = {x: idleAnimationFrame * TileSize, y: 32};
    };

    const moveAnimationFrameTotal = 6;
    if(player.isMoving){
      const deltaTime = timestamp - lastMoveAnimationFrameTime;

      if (deltaTime >= moveAnimationSpeed) {
        // Update the animation frame
        moveAnimationFrame = (moveAnimationFrame + 1) % moveAnimationFrameTotal; 
        lastMoveAnimationFrameTime = timestamp;
      }

      spriteSheetPosition = {x: moveAnimationFrame * TileSize, y: 64};
    };

    ctx.translate(playerPosition.x + playerSize / 2, playerPosition.y + playerSize / 2);
    if (flipImage) {
      ctx.scale(-1, 1);
    }

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
  }

  const renderBackgroundLayer = (ctx, spriteSheet) => {
    level.baseMap.map((block, index) => {
      const x = block.x * cellSize;
      const y = block.y * cellSize;

      const tilePosition = level.dungeonTileKey.find((x) => x.id === block.tileKey);
      return ctx.drawImage(spriteSheet, tilePosition.x, tilePosition.y, TileSize, TileSize, x, y, cellSize, cellSize);
    });
  };

  const renderCollisionLayer = (ctx, spriteSheet) => {
    collisionObjects = [];
    // eslint-disable-next-line array-callback-return
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

  const renderGridOverlay = (ctx) => {
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.font = "14px Arial";

    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= levelWidth; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, levelHeight);
    }
    for (let y = 0; y <= levelHeight; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(levelWidth, y);
    }

    for (let x = 0; x < levelWidth; x += cellSize) {
      for (let y = 0; y < levelHeight; y += cellSize) {
        // Display the x and y coordinates at the center of each block
        ctx.fillText(`x:${x/cellSize}`, x + cellSize / 2 - 20, y + 15);
        ctx.fillText(`y:${y/cellSize}`, x + cellSize / 2 - 20, y + 30);
      }
    }
    ctx.stroke();
  }

  return (
    <div className="game-level">
      <div className="menu">
        <div className="menu__title">Dungeon Explorer</div>
        <div className="menu__buttons">
          <button>Menu</button>
        </div>
      </div>
      <div className="details">
        {/* <div>{`Player x:${display.x} y:${display.y}`}</div> */}
        {/* <div>{`Player x:${display.x / 32} y:${display.y / 32}`}</div> */}
        {/* <div>Health: {display.health}</div> */}
        {/* <div>Mana: {display.mana}</div> */}
        {/* <div>Experience: {display.experience}</div> */}
        {/* <div>{`Camera x:${display.camera.x} y:${display.camera.y}`}</div> */}
        {/* <div>{`Width:${gridWidth} Height:${gridHeight}`}</div> */}
      </div>
      <div className="hud">
        <HUD health={playerHealth} magic={playerMagic}/>
      </div>
      <div className="level" style={{width: gridWidth, height: gridHeight}}>
        <canvas className="gameWindow" ref={canvasRef} width={gridWidth} height={gridHeight} />
      </div>
    </div>
  );
};