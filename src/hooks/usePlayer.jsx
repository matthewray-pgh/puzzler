import { useState, useCallback} from 'react';
import { directions } from '../utils/enums';

export const usePlayer = (position, size, cellSize, tileSize) => {
  
  const [player, setPlayer] = useState({
    speed: 2.5,
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

  const render = (timestamp, ctx, flipImage, playerImage) => {
    let spriteSheetPosition = {x: 0, y: 0};

    const getSpriteAnimationPosition = (
      lastAnimationFrameTime = 0, 
      animationSpeed = 150, 
      animationFrame = 0, 
      animationFrameTotal, 
      yTilePosition
    ) => {
      const deltaTime = timestamp - lastAnimationFrameTime;
      if (deltaTime >= animationSpeed) {
        animationFrame = (animationFrame + 1) % animationFrameTotal;
        lastAnimationFrameTime = timestamp;
      }
      return {x: animationFrame * tileSize, y: yTilePosition};
    };

    if(actions.isIdle){
      spriteSheetPosition = getSpriteAnimationPosition(0, 200, 0, 7, 32);
    };

    if(actions.isMoving){
      spriteSheetPosition = getSpriteAnimationPosition(0, 125, 0, 6, 64);
    };

    if(actions.isDamaged){
      spriteSheetPosition = getSpriteAnimationPosition(0, 100, 0, 4, 96);
    };

    if(actions.isAttacking){
      spriteSheetPosition = getSpriteAnimationPosition(0, 100, 0, 3, 128)
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