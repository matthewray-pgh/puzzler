import { useState, useCallback} from 'react';
import { directions } from '../utils/enums';

export const usePlayer = (position, size, cellSize, tileSize) => {
  
  const [player, setPlayer] = useState({
    speed: 1.5,
    direction: directions.RIGHT,
    facing: directions.RIGHT,
    health: { total: 5, current: 5 },
    magic: { total: 1, current: 1 }, 
    position: { x: position.x, y: position.y },
    pausedPosition: { x: position.x, y: position.y },
  });

  const updatePlayerHealth = (damage) => {
    setPlayer(prevState => {
      return {...prevState, 
        health: { ...prevState.health, current: prevState.health.current - damage }
      }
    });
  };

  const updatePlayerMagic = (usage) => {
    setPlayer(prevState => {
      return {...prevState, 
        magic: { ...prevState.magic, current: prevState.magic.current - usage }
      }
    });
  };

  const updatePlayerPosition = (dx, dy) => {
    setPlayer(prevState => {
      return {...prevState, position: { x: dx, y: dy }}
    });
  };

  const updatePausedPosition = (x, y) => {
    setPlayer(prevState => {
      return {...prevState, pausedPosition: { x: x, y: y }}
    });
  };

  const [actions, setActions] = useState({
    isIdle: true,
    isMoving: false,
    isAttacking: false,
    isCasting: false,
    isDamaged: false,
    isDead: false,
  });

  const updateActions = (action, value) => {
    setActions(prevState => {
      return {...prevState, [action]: value}
    });
  };

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

  const render = (timestamp, ctx, flipImage, playerImage) => {
    let spriteSheetPosition = {x: 0, y: 0};

    const idleAnimationFrameTotal = 7;
    if(actions.isIdle){
      const deltaTime = timestamp - lastIdleAnimationFrameTime;
      if (deltaTime >= idleAnimationSpeed) {
        idleAnimationFrame = (idleAnimationFrame + 1) % idleAnimationFrameTotal;
        lastIdleAnimationFrameTime = timestamp;
      }
      spriteSheetPosition = {x: idleAnimationFrame * tileSize, y: 32};
    };

    const moveAnimationFrameTotal = 6;
    if(actions.isMoving){
      const deltaTime = timestamp - lastMoveAnimationFrameTime;
      if (deltaTime >= moveAnimationSpeed) {
        moveAnimationFrame = (moveAnimationFrame + 1) % moveAnimationFrameTotal; 
        lastMoveAnimationFrameTime = timestamp;
      }
      spriteSheetPosition = {x: moveAnimationFrame * tileSize, y: 64};
    };

    const damagedAnimationFrameTotal = 4;
    if(actions.isDamaged){
      const deltaTime = timestamp - lastDamagedAnimationFrameTime;
      if (deltaTime >= damagedAnimationSpeed) {
        damagedAnimationFrame = (damagedAnimationFrame + 1) % damagedAnimationFrameTotal; 
        lastDamagedAnimationFrameTime = timestamp;
      }
      spriteSheetPosition = {x: damagedAnimationFrame * tileSize, y: 96};
    };

    ctx.translate(player.position.x + size / 2, player.position.y + size / 2);
    if (flipImage) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      playerImage, 
      spriteSheetPosition.x, 
      spriteSheetPosition.y, 
      tileSize, 
      tileSize, 
      -size / 2, 
      -size / 2, 
      size,
      size
    );
  };

  const movementArea = (playerX, playerY, camera) => {
    return {
      x: playerX + (size / 3) - camera.x,
      y: playerY + (size / 2) - camera.y,
      width: size * 0.3,
      height: size * 0.45,
      lineWidth: 2,
      lineColor: 'fuchsia',
    };
  };

  const move = (dx, dy, collisionObjects, camera) => {
    const newPlayerX = player.position.x + dx;
    const newPlayerY = player.position.y + dy;

    const movementDetection = movementArea(player.position.x, player.position.y, camera);

    const isCollision = collisionObjects && collisionObjects.some((obj) => {
      return (
        movementDetection.x + dx + camera.x < obj.x + obj.width &&
        movementDetection.x + dx + movementDetection.width + camera.x > obj.x &&
        movementDetection.y + dy + camera.y < obj.y + obj.height &&
        movementDetection.y + dy + movementDetection.height + camera.y > obj.y
      );
    });

    if ( !isCollision && !actions.isDamaged) {
      updatePlayerPosition(newPlayerX, newPlayerY);
    }
  };

  const showMovementArea = (ctx, camera) => {
    const movementCollisionBox = movementArea(camera);
    ctx.strokeStyle = "fuchsia"; 
    ctx.lineWidth = 2; 
    ctx.strokeRect(movementCollisionBox.x, movementCollisionBox.y, movementCollisionBox.width, movementCollisionBox.height);
  }

  const damageArea = useCallback((camera) => {
    return {
      x: player.position.x + (size * 0.3) - camera.x,
      y: player.position.y + (size * 0.2) - camera.y,
      width: size * 0.4,
      height: size * 0.75,
    };
  }, [player.position, size]);

  const showDamageArea = (ctx, camera) => {
    const hitBox = damageArea(camera);
    ctx.strokeStyle = "aqua"; 
    ctx.lineWidth = 2; 
    ctx.strokeRect(hitBox.x, hitBox.y, hitBox.width, hitBox.height);
  }

  const onCollision = (mobs, camera) => {
    const hitBox = damageArea(camera);
    // Loop through each mob and check for collision with the player.
    let isPlayerCollidingWithMob = mobs.mobs.some((mob) => {
      if (
        hitBox.x + camera.x < mob.position.x * cellSize + mob.collisionBox.x + mob.collisionBox.width &&
        hitBox.x + hitBox.width + camera.x > mob.position.x * cellSize + mob.collisionBox.x &&
        hitBox.y + camera.y < mob.position.y * cellSize + mob.collisionBox.y + mob.collisionBox.height &&
        hitBox.y + hitBox.height + camera.y > mob.position.y * cellSize + mob.collisionBox.y
      ) {
        // Collision detected with this mob. You can handle it here (e.g., reduce player health).
        return true;
      }
      else {
        return false;
      }
    });
    updateActions('isDamaged', isPlayerCollidingWithMob);
  };

  // useEffect(() => {
  //   console.log('usePlayer - useEffect - player.position', player.position);
  // }, [player.position]);

  return {
    player,
    updatePlayerHealth,
    updatePlayerMagic,
    updatePlayerPosition,
    updatePausedPosition,
    actions,
    updateActions,
    render,
    move,
    movementArea,
    showMovementArea,
    onCollision,
    damageArea,
    showDamageArea,
  };
};