import React, { useEffect, useState, useRef } from 'react';
import './GameLevel.scss';

import level from "../../assets/levelOne.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import playerMasterSheet from "../../assets/images/character-master.png"

import { useControls } from '../../hooks/useControls';
import { usePlayer } from '../../hooks/usePlayer';
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
  
  //user input controls
  const { leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed } = useControls();
  const controlsRef = useRef({ leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed });
  useEffect(() => {
    controlsRef.current = { leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed };
  }, [leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed]);

  //game display and level rendering
  const scale = 2; //TODO: needs automated based on screen size
  const playerSize = TileSize * scale + (TileSize * scale / 2);
  const cellSize = TileSize * scale;
  const gridWidth = cameraDimensions.width * cellSize;
  const gridHeight = cameraDimensions.height * cellSize;
  const levelWidth = level.level.width * cellSize;
  const levelHeight = level.level.height * cellSize;

  let collisionObjects = [];

  //player variables
  //TODO: continue porting logic to usePlayer hook
  let initialPosition = { x: -0.25 * cellSize, y: 3.5 * cellSize };
  const { 
    player, 
    actions, 
    updatePlayerHealth, 
    updatePlayerPosition,
    updateActions,
  } = usePlayer(initialPosition, playerSize, cellSize, TileSize);
  const playerRef = useRef({ player, actions });
  useEffect(() => {
    playerRef.current = { player, actions };
  }, [player, actions]);

  let playerPosition = { x: -0.25 * cellSize, y: 3.5 * cellSize };
  let playerFacing = true; //true == flipImage || facing right

  const [playerIsDamaged, setPlayerIsDamaged] = useState(false);

  //camera
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

  //damaged animation variables
  let damagedAnimationFrame = 0;
  const damagedAnimationSpeed = 100; // Adjust this value for animation speed, HIgher is slower
  let lastDamagedAnimationFrameTime = 0;

  const { renderTorch } = useEnvironmentObject(cellSize, TileSize);

  const mobsData = [
    { name: "ghoul1", waypoints: [{x: 1, y: 0.5}, {x: 8.75, y: 0.5}, {x: 8, y: 6.5}, {x: 1.5, y: 6.5}] },
    { name: "ghoul2", waypoints: [{x: 11, y: 1}, {x: 11.5, y: 8.25}, {x: 14.75, y: 8}, {x: 14.25, y: 1.75}] },
    { name: "ghoul3", waypoints: [{x: 1, y: 9}, {x: 8, y: 9}] }
  ];
  const mobs = useMob(cellSize, TileSize, playerSize, mobsData);

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
      let flipImage = playerFacing;

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
        mobs.render(ctx, timestamp, showCollisionBox);
        mobs.move();

        //render player
        renderPlayer(timestamp, ctx, flipImage, playerImage);

        ctx.restore();

        //draw player collider box
        const movementDetection = {
          x: playerPosition.x + (playerSize / 3) - camera.x,
          y: playerPosition.y + (playerSize / 2) - camera.y,
          width: playerSize * 0.3,
          height: playerSize * 0.45,
        };

        const damageDetection = {
          x: playerPosition.x + (playerSize * 0.3) - camera.x,
          y: playerPosition.y + (playerSize * 0.2) - camera.y,
          width: playerSize * 0.4,
          height: playerSize * 0.75,
        };

        if(showCollisionBox) {
          //hit
          ctx.strokeStyle = "aqua"; 
          ctx.lineWidth = 2; 
          ctx.strokeRect(damageDetection.x, damageDetection.y, damageDetection.width, damageDetection.height);
          //movement detection
          ctx.strokeStyle = "fuchsia";
          ctx.lineWidth = 2;
          ctx.strokeRect(movementDetection.x, movementDetection.y, movementDetection.width, movementDetection.height);
        }

        const movePlayer = (dx, dy, collisionObjects, camera) => {
          const newPlayerX = playerPosition.x + dx;
          const newPlayerY = playerPosition.y + dy;

          const isCollision = collisionObjects.some((obj) => {
            return (
              movementDetection.x + dx + camera.x < obj.x + obj.width &&
              movementDetection.x + dx + movementDetection.width + camera.x > obj.x &&
              movementDetection.y + dy + camera.y < obj.y + obj.height &&
              movementDetection.y + dy + movementDetection.height + camera.y > obj.y
            );
          });

          // console.log("x:", playerPosition.x, playerRef.current.player.position.x);
          // console.log("y:", playerPosition.y, playerRef.current.player.position.y);

          if (!isCollision && !playerRef.current.actions.isHit) {
            playerPosition.x = newPlayerX;
            playerPosition.y = newPlayerY;
            updatePlayerPosition(newPlayerX, newPlayerY);
            setDisplay((prevState) => ({...prevState, x: playerPosition.x, y: playerPosition.y}));
          }
        };

        //update player position
        if (controlsRef.current.leftKeyPressed) {
          movePlayer(-player.speed, 0, collisionObjects, camera);
          flipImage = false;
        }
        if (controlsRef.current.rightKeyPressed) {
          movePlayer(player.speed, 0, collisionObjects, camera);
          flipImage = true;
        }
        if (controlsRef.current.upKeyPressed) {
          movePlayer(0, -player.speed, collisionObjects, camera);
        }
        if (controlsRef.current.downKeyPressed) {
          movePlayer(0, player.speed, collisionObjects, camera);
        }

        checkCollisions(damageDetection);
        
        requestAnimationFrame(gameLoop);
      };

      gameLoop();
    };

    const checkCollisions = (playerCollisionBox) => {
      // Loop through each mob and check for collision with the playerActions.
      let isPlayerCollidingWithMob = mobs.mobs.some((mob) => {
        if (
          playerCollisionBox.x + camera.x < mob.position.x * cellSize + mob.collisionBox.x + mob.collisionBox.width &&
          playerCollisionBox.x + playerCollisionBox.width + camera.x > mob.position.x * cellSize + mob.collisionBox.x &&
          playerCollisionBox.y + camera.y < mob.position.y * cellSize + mob.collisionBox.y + mob.collisionBox.height &&
          playerCollisionBox.y + playerCollisionBox.height + camera.y > mob.position.y * cellSize + mob.collisionBox.y
        ) {
          // Collision detected with this mob. You can handle it here (e.g., reduce player health).
          return true;
        }
        else {
          return false;
        }
      });
      playerRef.current.actions.isHit = isPlayerCollidingWithMob;
      setPlayerIsDamaged(isPlayerCollidingWithMob);
    };

    const cleanup = () => {};

    startGame();

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(keysPressed.length === 0) {
      updateActions('isIdle', true);
      updateActions('isMoving', false);
    } else {
      updateActions('isIdle', false);
      updateActions('isMoving', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysPressed]);

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

  useEffect(() => {
    if(playerIsDamaged) {
      updatePlayerHealth(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIsDamaged]);

  const renderPlayer = (timestamp, ctx, flipImage, playerImage) => {
    let spriteSheetPosition = {x: 0, y: 0};
    const idleAnimationFrameTotal = 7;
    if(playerRef.current.actions.isIdle){
      const deltaTime = timestamp - lastIdleAnimationFrameTime;

      if (deltaTime >= idleAnimationSpeed) {
        // Update the animation frame
        idleAnimationFrame = (idleAnimationFrame + 1) % idleAnimationFrameTotal;
        lastIdleAnimationFrameTime = timestamp;
      }

      spriteSheetPosition = {x: idleAnimationFrame * TileSize, y: 32};
    };

    const moveAnimationFrameTotal = 6;
    if(playerRef.current.actions.isMoving){
      const deltaTime = timestamp - lastMoveAnimationFrameTime;

      if (deltaTime >= moveAnimationSpeed) {
        // Update the animation frame
        moveAnimationFrame = (moveAnimationFrame + 1) % moveAnimationFrameTotal; 
        lastMoveAnimationFrameTime = timestamp;
      }

      spriteSheetPosition = {x: moveAnimationFrame * TileSize, y: 64};
    };

    const damagedAnimationFrameTotal = 4;
    if(playerRef.current.actions.isHit){
      const deltaTime = timestamp - lastDamagedAnimationFrameTime;

      if (deltaTime >= damagedAnimationSpeed) {
        // Update the animation frame
        damagedAnimationFrame = (damagedAnimationFrame + 1) % damagedAnimationFrameTotal; 
        lastDamagedAnimationFrameTime = timestamp;
      }

      spriteSheetPosition = {x: damagedAnimationFrame * TileSize, y: 96};
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
        <HUD health={player.health} magic={player.magic}/>
      </div>
      <div className="level" style={{width: gridWidth, height: gridHeight}}>
        <canvas className="gameWindow" ref={canvasRef} width={gridWidth} height={gridHeight} />
      </div>
    </div>
  );
};