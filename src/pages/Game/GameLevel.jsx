import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Header } from '../../components/Header';
import './GameLevel.scss';

import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import dungeonDetails from "../../assets/dungeon.json";
import playerMasterSheet from "../../assets/images/character-master.png"

import { directions } from '../../utils/enums';
import { useControls } from '../../hooks/useControls';
import { usePlayer } from '../../hooks/usePlayer';
import { useEnvironmentObject } from "../../hooks/useEnvironmentObject";
import { useMob } from "../../hooks/useMobs";
import { useTile } from "../../hooks/useTile";

import { HUD } from "../../components/HUD";

export const GameLevel = () => {
  //params from url
  const { fileName } = useParams();
  const [levelDetails, setLevelDetails] = useState({
    level: {
      width: 0,
      height: 0
    },
    doorway: [],
    baseMap: [],
    collisionMap: [],
    collisionObjects: [],
    mobs: [],
    torches: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevelData = async (fileName) => {
      setIsLoading(true);
      import(`../../assets/${fileName}.json`)
        .then((data) => {
          const collisionObjects = data.default.collisionMap.map((block, index) => {
            const y = block.x * cellSize;
            const x = block.y * cellSize;
            let tile = tileLookUpById(block.tileKey);
            return { 
              x, 
              y, 
              width: cellSize, 
              height: cellSize, 
              id: tile.id, 
              interact: tile.interact ? true : false, 
              interactDetails: tile.interact ? tile.interact : null 
            };
          });
          const loadedLevelDetails = {
            ...data.default,
            collisionObjects
          };
          setLevelDetails(loadedLevelDetails);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error loading levelDetails:', error);
          setIsLoading(false);
        });
    };

    fetchLevelData(fileName);
  }, [fileName]);
  
  //development tools
  const showGridOverlay = false;
  const showCollisionBox = true;

  //canvas
  const canvasRef = useRef(null);

  //game ui
  const [gameMessage, setGameMessage] = useState(null);
  
  //user input controls
  const { leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed, mouseClicked } = useControls({canvasRef});
  const controlsRef = useRef({ leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed, mouseClicked });
  useEffect(() => {
    controlsRef.current = { leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed, mouseClicked };
  }, [leftKeyPressed, rightKeyPressed, upKeyPressed, downKeyPressed, keysPressed, mouseClicked]);

  //game display and level rendering
  const TileSize = dungeonDetails.cellSize;
  const cameraDimensions = {width: 15, height: 9};
  const scale = 2; //TODO: needs automated based on screen size
  
  const cellSize = TileSize * scale;
  const gridWidth = cameraDimensions.width * cellSize;
  const gridHeight = cameraDimensions.height * cellSize;
  const levelWidth = levelDetails.level.width * cellSize;
  const levelHeight = levelDetails.level.height * cellSize;

  //player values
  const playerSize = TileSize * scale + (TileSize * scale / 2);
  //transpose from file for render
  const playerStartPosition = useMemo(() => {
    return { 
      x: levelDetails.start ? levelDetails.start.y : 1,
      y: levelDetails.start ? levelDetails.start.x : 2
    }
  }, [levelDetails]);
  let isPlayerAttacking = false;

  //TODO: start position not loading from json file
  //console.log('playerStartPosition', playerStartPosition);

  const [interactObjects, setInteractObjects] = useState([]);

  //player variables
  //TODO: continue porting logic to usePlayer hook
  const startingPositionOffset = {x: -0.25, y: 0.5};
  let initialPosition = { 
    x: (playerStartPosition.x + startingPositionOffset.x) * cellSize, 
    y: (playerStartPosition.y + startingPositionOffset.y) * cellSize 
  };
  const { 
    player, 
    actions, 
    updatePlayerHealth, 
    updatePlayerPosition,
    updatePlayerFlipImage,
    updatePlayerFacing,
    updateActions,
  } = usePlayer(initialPosition, playerSize, cellSize, TileSize);

  const playerRef = useRef({ player, actions });
  useEffect(() => {
    playerRef.current = { player, actions };
  }, [player, actions]);

  let playerPosition = { x: -0.25 * cellSize, y: 2.5 * cellSize };
  let playerFacing = directions.RIGHT;

  const [playerIsDamaged, setPlayerIsDamaged] = useState(false);

  //camera
  const camera = { 
    x: 0, 
    y: 0,
    width: gridWidth,
    height: gridHeight
  };

  const { tileLookUpById } = useTile(dungeonDetails);

  //idle animation variables
  let idleAnimationFrame = 0;
  const idleAnimationSpeed = 190; // Adjust this value for animation speed, Higher is slower
  let lastIdleAnimationFrameTime = 0;

  //move animation variables
  let moveAnimationFrame = 0;
  const moveAnimationSpeed = 125; // Adjust this value for animation speed, HIgher is slower
  let lastMoveAnimationFrameTime = 0;

  //damaged animation variables
  let damagedAnimationFrame = 0;
  const damagedAnimationSpeed = 100; // Adjust this value for animation speed, HIgher is slower
  let lastDamagedAnimationFrameTime = 0;

  //attack animation variables
  let attackAnimationFrame = 0;
  const attakedAnimationSpeed = 150; // Adjust this value for animation speed, HIgher is slower
  let lastAttackedAnimationFrameTime = 0;

  const { renderTorch } = useEnvironmentObject(cellSize, TileSize);

  const mobsData = levelDetails.mobs ?? [];
  const mobs = useMob(cellSize, TileSize, playerSize, mobsData);

  useEffect(() => {
    if(isLoading) return;
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
      let flipImage = playerFacing === directions.RIGHT ? true : false;

      const gameLoop = (timestamp) => {
        updateCamera(cellSize);

        ctx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.save();        
        ctx.translate(-camera.x, -camera.y);

        renderBackgroundLayer(ctx, dungeonTiles);
        renderCollisionLayer(ctx, dungeonTiles);
        showGridOverlay && renderGridOverlay(ctx);

        //render torches
        if(levelDetails.torches && levelDetails.torches.length > 0){
          levelDetails.torches.map((torch, i) => {
            return renderTorch(ctx, timestamp, torch.x, torch.y);
          });
        }

        //render mobs 
        if(levelDetails.mobs && levelDetails.mobs.length > 0){
          mobs.render(ctx, timestamp, showCollisionBox);
          mobs.move();
        }
        //render player
        playerPosition.x = playerRef.current.player.position.x;
        playerPosition.y = playerRef.current.player.position.y;
        //eslint-disable-next-line
        playerFacing = playerRef.current.player.facing;
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

        const interactionDetection = {
          x: playerRef.current.player.position.x - camera.x,
          y: playerRef.current.player.position.y - camera.y,
          width: playerSize,
          height: playerSize + (playerSize * 0.2),
        };

        const attackHorizontalDetectOffset = playerSize * 0.5;
        const attackDetectionX = (direction) => {
          const basePosition = playerPosition.x + (playerSize / 3) - camera.x;
          if(direction === directions.LEFT) 
            return basePosition - attackHorizontalDetectOffset;
          else if(direction === directions.RIGHT)
            return basePosition + attackHorizontalDetectOffset;
          else 
            return basePosition;
        };
        const attackVerticalDetectOffset = playerSize * 0.65;
        const attackDetectionY = (direction) => {
          const basePosition = playerPosition.y + (playerSize / 2) - camera.y;
          if(direction === directions.UP) 
            return basePosition - attackVerticalDetectOffset;
          else if(direction === directions.DOWN)
            return basePosition + attackVerticalDetectOffset;
          else 
            return basePosition;
        };
        const attackDetection = {
          x: attackDetectionX(playerRef.current.player.facing),
          y: attackDetectionY(playerRef.current.player.facing),
          width: playerSize * 0.25,
          height: playerSize * 0.25,
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
          //interaction
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
          ctx.strokeRect(interactionDetection.x, interactionDetection.y, interactionDetection.width, interactionDetection.height);
          //attack
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(attackDetection.x, attackDetection.y, attackDetection.width, attackDetection.height);
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

          if (!isCollision && !playerRef.current.actions.isHit) {
            playerPosition.x = newPlayerX;
            playerPosition.y = newPlayerY;
            updatePlayerPosition(newPlayerX, newPlayerY);
          }
        };

        //update player position
        if (controlsRef.current.leftKeyPressed) {
          playerFacing = directions.LEFT;
          movePlayer(-player.speed, 0, levelDetails.collisionObjects, camera);
          flipImage = false;
        }
        if (controlsRef.current.rightKeyPressed) {
          playerFacing = directions.RIGHT;
          movePlayer(player.speed, 0, levelDetails.collisionObjects, camera);
          flipImage = true;
        }
        if (controlsRef.current.upKeyPressed) {
          playerFacing = directions.UP;
          movePlayer(0, -player.speed, levelDetails.collisionObjects, camera);
        }
        if (controlsRef.current.downKeyPressed) {
          playerFacing = directions.DOWN;
          movePlayer(0, player.speed, levelDetails.collisionObjects, camera);
        }
        updatePlayerFacing(playerFacing);

        checkCollisions(damageDetection);
        checkInteractions(interactionDetection);
        checkPlayerAttacking(attackDetection);

        updatePlayerPosition(playerPosition.x, playerPosition.y);
        updatePlayerFlipImage(flipImage);
        
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

    const checkInteractions = (playerInteractBox) => {
      const iObjects = levelDetails.collisionObjects.filter((obj) => {
        return (
          obj.interact &&
          playerInteractBox.x + camera.x < obj.x + obj.width &&
          playerInteractBox.x + playerInteractBox.width + camera.x > obj.x &&
          playerInteractBox.y + camera.y < obj.y + obj.height &&
          playerInteractBox.y + playerInteractBox.height + camera.y > obj.y
        );
      });
      if(iObjects.length > 0){
        setInteractObjects(iObjects)
      }
      else{
        setInteractObjects([]);
      }
    };

    const checkPlayerAttacking = (playerAttackBox) => {
      if(controlsRef.current.mouseClicked && !isPlayerAttacking){
        // Loop through each mob and check for collision with the playerActions.
        mobs.mobs.some((mob) => {
          if (
            playerAttackBox.x + camera.x < mob.position.x * cellSize + mob.collisionBox.x + mob.collisionBox.width &&
            playerAttackBox.x + playerAttackBox.width + camera.x > mob.position.x * cellSize + mob.collisionBox.x &&
            playerAttackBox.y + camera.y < mob.position.y * cellSize + mob.collisionBox.y + mob.collisionBox.height &&
            playerAttackBox.y + playerAttackBox.height + camera.y > mob.position.y * cellSize + mob.collisionBox.y
          ) {
            isPlayerAttacking = true;
            console.log('mob', mob.name, mob.health, playerRef.current.player.attack.damage);
            // Collision detected with this mob. You can handle it here (e.g., reduce player health).
            mob.health -= playerRef.current.player.attack.damage;
            mob.state.isDamaged = true;

            //remove mob
            const mobIndex = mobs.mobs.findIndex(m => m.name === mob.name);
            if(mob.health <= 0){
              mobs.mobs.splice(mobIndex, 1);
            }

            setTimeout(() => {
              isPlayerAttacking = false; // Reset attacking state after cooldown
            }, playerRef.current.player.attack.cooldown);

            setTimeout(() => {
              mob.state.isDamaged = false; // Reset damaged state after cooldown
            }, mob.damageCooldown);
          }
        });
      }
    };

    const cleanup = () => {};

    startGame();

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelDetails, isLoading]);

  //set GameMessage when state object has items in it
  useEffect(() => {
    if(interactObjects.length > 0){
      setGameMessage(interactObjects[0].interactDetails.message);
    } else {
      setGameMessage(null);
    }
  }, [interactObjects]);

  //key pressed actions
  useEffect(() => {
    if(keysPressed.length === 0) {
      updateActions('isIdle', true);
      updateActions('isMoving', false);
      updateActions('isInteracting', false);
    } else {
      if(keysPressed.includes('e')){
        updateActions('isInteracting', true);
        handleInteractions();
        setGameMessage(null);
      }
      else {
        updateActions('isIdle', false);
        updateActions('isMoving', true);
        updateActions('isInteracting', false);
      }
    }

    if(mouseClicked){
      updateActions('isAttacking', true);
      updateActions('isMoving', false);
      updateActions('isIdle', false);
      updateActions('isInteracting', false);
    } 

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysPressed, mouseClicked]);

  const handleInteractions = () => {
    if(interactObjects.length > 0){
      //TODO: remove change to base layer and replace with non-collise collision prop
      let updatedCollisionMap = levelDetails.collisionMap;
      const updateBaseMap = [...levelDetails.baseMap];

      const { x, y, id, interactDetails } = interactObjects[0];
      //transpose
      const newX = y / cellSize;
      const newY = x / cellSize;

      //update collisoinMap
      let collisionRemovalIndex = updatedCollisionMap.findIndex(obj => {
        return obj.tileKey === id && obj.x === newX && obj.y === newY;
      });
      updatedCollisionMap.splice(collisionRemovalIndex, 1);

      //update collisionObjects
      const updatedColiisionObject = updatedCollisionMap.map((block, index) => {
        const y = block.x * cellSize;
        const x = block.y * cellSize;
        let tile = tileLookUpById(block.tileKey);
        return { 
          x, 
          y, 
          width: cellSize, 
          height: cellSize, 
          id: tile.id, 
          interact: tile.interact ? true : false, 
          interactDetails: tile.interact ? tile.interact : null 
        };
      })

      //update baseMap
      const newBaseLevel = updateBaseMap.filter(obj => !(obj.x === newX && obj.y === newY ));
      newBaseLevel.push({ x: newX, y: newY, tileKey: interactDetails.tile });

      setLevelDetails(prevState => ({
        ...prevState,
        collisionMap: updatedCollisionMap,
        collisionObjects: updatedColiisionObject,
        baseMap: newBaseLevel
      }));
    }
  }

  const updateCamera = (cellSize) => {
    const position = {
      x: playerPosition.x - gridWidth / 2,
      y: playerPosition.y - gridHeight / 2
    };

    camera.x = position.x < 0 ? 0 : position.x;
    camera.y = position.y < 0 ? 0 : position.y;

    if(position.x + camera.width > levelDetails.level.width * cellSize) {
      camera.x = levelDetails.level.width * cellSize - camera.width;
    }
    if(position.y + camera.height > levelDetails.level.height * cellSize) {
      camera.y = levelDetails.level.height * cellSize - camera.height;
    }
  };

  useEffect(() => {
    if(playerIsDamaged) {
      updatePlayerHealth(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIsDamaged]);

  const renderPlayer = (timestamp, ctx, flipImage, playerImage) => {
    let spriteSheetPosition = {x: 0, y: 0};
    //idle
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

    //moving
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

    //hit
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

    //attacking
    const attackAnimationFrameTotal = 3;
    if(playerRef.current.actions.isAttacking){
      const deltaTime = timestamp - lastAttackedAnimationFrameTime;

      if (deltaTime >= attakedAnimationSpeed) {
        // Update the animation frame
        attackAnimationFrame = (attackAnimationFrame + 1) % attackAnimationFrameTotal; 
        lastAttackedAnimationFrameTime = timestamp;
        if(attackAnimationFrame === 0){
          updateActions('isAttacking', false);
        }
      }

      spriteSheetPosition = {x: attackAnimationFrame * TileSize, y: 128};
    };

    //interacting
    if(playerRef.current.actions.isInteracting){
      //TODO: add player interaction animation
    }

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
  };

  const renderBackgroundLayer = (ctx, spriteSheet) => {
    if(!levelDetails.baseMap || (levelDetails.baseMap && levelDetails.baseMap.length <= 0)) return;
    levelDetails.baseMap.map((block, index) => {
      //transpose x annd y for rendering
      const y = block.x * cellSize;
      const x = block.y * cellSize;
      let tile = tileLookUpById(block.tileKey);
      return ctx.drawImage(spriteSheet, tile.x, tile.y, TileSize, TileSize, x, y, cellSize, cellSize);
    });
  };

  const renderCollisionLayer = (ctx, spriteSheet) => {
    if(!levelDetails.collisionMap || (levelDetails.collisionMap && levelDetails.collisionMap.length === 0)) return;
    // eslint-disable-next-line array-callback-return
    levelDetails.collisionMap.map((block, index) => {
      const y = block.x * cellSize;
      const x = block.y * cellSize;
      let tile = tileLookUpById(block.tileKey);
      ctx.drawImage(spriteSheet, tile.x, tile.y, TileSize, TileSize, x, y, cellSize, cellSize);
      if(showCollisionBox) {
        ctx.strokeStyle = "yellow"; 
        ctx.lineWidth = 2; 
        ctx.strokeRect(x, y, cellSize, cellSize);
      }      
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
  };

  return (
    <div className="gameLevel">
      <Header 
        title="Dungeon Explorer"
        menuOptions={[
          { label:"Level Select", link:"/levelSelect" },
          { label:"Game Stats", link:"/stats" },
          { label:"Level Builder", link:"/levelBuilder" }
        ]}
      />
      
      <div className="gameLevel__main" style={{width: gridWidth}}>
        <div className="gameLevel__hud">
          <HUD health={player.health} magic={player.magic}/>
        </div>
        {gameMessage && <div className="gameLevel__message" style={{width: gridWidth}}>
          {gameMessage}
        </div>}
        <canvas className="gameLevel__window" ref={canvasRef} width={gridWidth} height={gridHeight} />
      </div>
      <div className="gameLevel__statusMessage">
        {player.health <= 0 && <span>GAME OVER</span>}
      </div>
    </div>
  );
};