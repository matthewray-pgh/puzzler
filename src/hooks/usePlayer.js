import { useState } from 'react';
import { directions } from '../utils/enums';

export const usePlayer = () => {
  const [playerStats, setPlayerStats] = useState({
    position: {x: 32, y: 32},
    speed: 8,
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

  const movePlayer = (direction) => {
    setPlayerStats(prev => {
      return {...prev, direction, moving: true};
    });
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

  const updatePlayerPosition = (x, y) => {
    setPlayerStats(prev => {
      return {...prev, position: {x, y}};
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
    playerStats,
    movePlayer,
    stopPlayer,
    attackPlayer,
    stopAttack,
    updatePlayerPosition,
    updatePlayerHealth,
    updatePlayerExperience,
    updatePlayerLevel,
    updatePlayerGold,
    updatePlayerDirection,
    updatePlayerFacing,
  };
};