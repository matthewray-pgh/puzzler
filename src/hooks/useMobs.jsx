import PropTypes from 'prop-types';
import ghoulMaster from '../assets/images/ghoul-master.png';

export const useMob = (cellSize, tileSize, mobSize, mobsData) => {
  const mobs = mobsData.map(data => {
    const mob = {
      name: data.name,

      sprite: ghoulMaster,
      idle: {
        animation: {
          frameTotal: 6,
          frame: 0,
          speed: 175,
          lastFrameTime: 0
        },
      },
      collisionBox: {
        x: mobSize * 0.3,
        y: mobSize * 0.15,
        width: mobSize * 0.4,
        height: mobSize * 0.7,
      },
      position: {x: data.waypoints[0].x, y: data.waypoints[0].y},
      waypoints: data.waypoints,
      movementSpeed: 0.02,
      flipImage: false,
    };

    return mob;
  });

  const render = (ctx, timestamp, showCollisionBox) => {
    const ghoulMasterImage = new Image();
    ghoulMasterImage.src = ghoulMaster;

    mobs.forEach(mob => {
      const animationFramePositions = (timestamp) => {
        const deltaTime = timestamp - mob.idle.animation.lastFrameTime;
        if (deltaTime >= mob.idle.animation.speed) {
          mob.idle.animation.frame = (mob.idle.animation.frame + 1) % mob.idle.animation.frameTotal;
          mob.idle.animation.lastFrameTime = timestamp;
        }
        return {x: mob.idle.animation.frame * tileSize, y: 32};
      };

      const {x, y} = animationFramePositions(timestamp);

      if(mob.flipImage){
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          ghoulMasterImage, 
          x, 
          y, 
          tileSize, 
          tileSize, 
          -mob.position.x * cellSize - mobSize, 
          mob.position.y * cellSize, 
          mobSize,
          mobSize
        );
        ctx.restore();
      } else {
        ctx.drawImage(
          ghoulMasterImage, 
          x, 
          y, 
          tileSize, 
          tileSize, 
          mob.position.x * cellSize, 
          mob.position.y * cellSize, 
          mobSize,
          mobSize
        );
      }

      //collision box
      if(showCollisionBox){
        ctx.strokeStyle = "aqua";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          mob.position.x * cellSize + mob.collisionBox.x,
          mob.position.y * cellSize + mob.collisionBox.y,
          mob.collisionBox.width,
          mob.collisionBox.height
        );
      }
    });
  }

  const move = () => {
    mobs.forEach(mob => {
      mob.flipImage = false;

      // Inside your game loop
      if (mob.waypoints.length > 0) {
        const waypoint = mob.waypoints[0];
        const dx = waypoint.x - mob.position.x;
        const dy = waypoint.y - mob.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > mob.movementSpeed) {
          const ratio = mob.movementSpeed / distance;
          mob.position.x += dx * ratio;
          mob.position.y += dy * ratio;
          if (dx > 0) {
            mob.flipImage = true;
          }
        } else {
          // Mob has reached the current waypoint, move it to end of list
          let currentWaypoint = mob.waypoints.shift();
          mob.waypoints.push(currentWaypoint);
        }
      }
    });
  }

  return { mobs, render, move }
};

useMob.propTypes = {
  cellSize: PropTypes.number.isRequired,
  tileSize: PropTypes.number.isRequired,
  mobSize: PropTypes.number.isRequired,
  mobs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    waypoints: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
  })).isRequired,
};