import React, { useEffect } from 'react';

import Hero from "../assets/images/character-1.png";

import { directions } from "../utils/enums";
import { usePlayer } from "../hooks/usePlayer";
import { useEventListener } from "../hooks/useEventListener";

export const Player = ({ width, height, playerIndex = 1, fill, collisionMinMax, level }) => {
  const {
    playerStats,
    movePlayer,
    stopPlayer,
    updatePlayerPosition,
    updatePlayerFacing,
  } = usePlayer();

  const styled = {
    display: "grid",
    width: `${width}px`,
    height: `${height}px`,
    backgroundImage: `url(${Hero})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    border: `1px solid ${fill}`,
    position: "absolute",
    transitionProperty: "top, left",
    transitionDuration: "300ms",
    top: `${playerStats.position.y}px`,
    left: `${playerStats.position.x}px`,
    zIndex: playerIndex,
    transform:
      playerStats.facing === directions.RIGHT ? `scaleX(-1)` : `scaleX(1)`,
  };

  const styledCollider = {
    width: `${width - 15}px`,
    height: `${height - 15}px`,
    border: `1px solid ${fill}`,
    borderRadius: "5px",
    justifySelf: "center",
    alignSelf: "end"
  };

  // gameloop
  useEffect(() => {
    const movementDelay = Math.round(1000 / level.player.speed);
    const gameInterval = setInterval(() => {}, movementDelay);

    return () => clearInterval(gameInterval);
  }, [level]);

  const handleOnCollision = (x, y) => {
    const collision = level.collisionMap.find((block) => {
      let el = document.getElementById(`collision-block-${block.x * level.cellSize}-${block.y * level.cellSize}`);
      let boundings = el.getBoundingClientRect();
      return (
        x + width > boundings.left &&
        x < boundings.right &&
        y + height > boundings.top &&
        y < boundings.bottom
      );
    });
    return collision ? true : false;
  };

  const handleMove = ({ key }) => {
    // right
    if (key === "ArrowRight" || key === "d") {
      movePlayer(directions.RIGHT);
      updatePlayerFacing(directions.RIGHT);
      const newPosition = {
        x: playerStats.position.x + playerStats.speed,
        y: playerStats.position.y,
      };
      if (
        newPosition.x > collisionMinMax.max.x ||
        handleOnCollision(newPosition.x, newPosition.y)
      ) {
        return;
      }
      updatePlayerPosition(newPosition.x, newPosition.y);
    }
    // left
    else if (key === "ArrowLeft" || key === "a") {
      movePlayer(directions.LEFT);
      updatePlayerFacing(directions.LEFT);
      const newPosition = {
        x: playerStats.position.x - playerStats.speed,
        y: playerStats.position.y,
      };
      if (
        newPosition.x < collisionMinMax.min.x ||
        handleOnCollision(newPosition.x, newPosition.y)
      ) {
        return;
      }
      updatePlayerPosition(newPosition.x, newPosition.y);
    }
    // down
    else if (key === "ArrowDown" || key === "s") {
      movePlayer(directions.DOWN);
      const newPosition = {
        x: playerStats.position.x,
        y: playerStats.position.y + playerStats.speed,
      };
      if (
        newPosition.y > collisionMinMax.max.y ||
        handleOnCollision(newPosition.x, newPosition.y)
      ) {
        return;
      }
      updatePlayerPosition(newPosition.x, newPosition.y);
    }
    // up
    else if (key === "ArrowUp" || key === "w") {
      movePlayer(directions.UP);
      const newPosition = {
        x: playerStats.position.x,
        y: playerStats.position.y - playerStats.speed,
      };
      if (
        newPosition.y < collisionMinMax.min.y ||
        handleOnCollision(newPosition.x, newPosition.y)
      ) {
        return;
      }
      updatePlayerPosition(newPosition.x, newPosition.y);
    }
  };

  const handleStopMoving = ({ key }) => {
    if (
      key === "ArrowRight" ||
      key === "d" ||
      key === "ArrowLeft" ||
      key === "a" ||
      key === "ArrowDown" ||
      key === "s" ||
      key === "ArrowUp" ||
      key === "w"
    ) {
      stopPlayer();
    }
  };

  useEventListener("keydown", (e) => {
    handleMove(e);
  });
  useEventListener("keyup", (e) => {
    handleStopMoving(e);
  });

  return (
    <div id="player" style={styled} data-testid="player">
      <div id="player-collider" style={styledCollider} data-testid="player-collider"></div>
    </div>
  );
}