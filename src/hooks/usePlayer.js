import { useState } from 'react';
import { directions } from '../utils/enums';

export const usePlayer = (positionX, positionY, moveSpeed) => {
  const [playerStats, setPlayerStats] = useState({
    speed: moveSpeed,
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
  const [playerPosX, setPlayerPosX] = useState(positionX);
  const [playerPosY, setPlayerPosY] = useState(positionY);

  const movePlayer = (deltaX, deltaY) => {
    setPlayerPosX(prevX => prevX + deltaX);
    setPlayerPosY(prevY => prevY + deltaY);
  }

  const stopPlayer = () => {
    setPlayerStats(prev => {
      return {...prev, moving: false};
    });
  }

  const attackPlayer = (direction) => {
    setPlayerStats(prev => {
      return {...prev, attackDirection: direction, attacking: true};
    });
  }

  const stopAttack = () => {
    setPlayerStats(prev => {
      return {...prev, attacking: false};
    });
  }

  const updatePlayerHealth = (health) => {
    setPlayerStats(prev => {
      return {...prev, health};
    });
  }

  const updatePlayerExperience = (experience) => {
    setPlayerStats(prev => {
      return {...prev, experience};
    });
  }

  const updatePlayerLevel = (level) => {
    setPlayerStats(prev => {
      return {...prev, level};
    });
  }

  const updatePlayerGold = (gold) => {
    setPlayerStats(prev => {
      return {...prev, gold};
    });
  }

  const updatePlayerDirection = (direction) => {
    setPlayerStats(prev => {
      return {...prev, direction};
    });
  }

  const updatePlayerFacing = (facing) => {
    setPlayerStats(prev => {
      return {...prev, facing};
    });
  }

  return {
    playerPosX,
    playerPosY,
    playerStats,
    movePlayer,
    stopPlayer,
    attackPlayer,
    stopAttack,
    updatePlayerHealth,
    updatePlayerExperience,
    updatePlayerLevel,
    updatePlayerGold,
    updatePlayerDirection,
    updatePlayerFacing,
  };
};