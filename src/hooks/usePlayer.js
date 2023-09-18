import { useState } from 'react';
import { directions } from '../utils/enums';

export const usePlayer = (position, size, cellSize) => {
  const [playerStats, setPlayerStats] = useState({
    speed: 2,
    direction: directions.RIGHT,
    facing: directions.RIGHT,
    animation: 'idle',
    step: 0,
    moving: false,
    attacking: false,
    attackStep: 0,
    attackDirection: 'down',
    attackAnimation: 'idle',
    attackSpeed: 1,
    attackDamage: 1,
    attackRange: 1,
    attackCooldown: 1,
    attackCooldownTimer: 0,
    health: 10,
    maxHealth: 10,
    experience: 0,
    level: 1,
    gold: 0,
    inventory: [],
    equipped: {
      weapon: null,
      armor: null,
      accessory: null
    }
  });

  const [player, setPlayer] = useState({
    isIdle: true,
    isMoving: false,
    isAttacking: false,
    isDead: false,
    isJumping: false,
    isFalling: false,
    isCrouching: false,
    isDashing: false,
    isHurt: false,
  });

  const [hitbox, setHitbox] = useState({
    x: position.x + size * 0.3,
    y: position.y + size * 0.2,
    width: size * 0.4,
    height: size * 0.7,
  });

  const [movementBox, setMovementBox] = useState( {
    x: position.x + size / 3,
    y: position.y + size / 2,
    width: size * 0.3,
    height: cellSize * 0.6,
  });


  return {
    playerStats,
    hitbox,
    movementBox,
  };
};