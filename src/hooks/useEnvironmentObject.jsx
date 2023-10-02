 import wallTorchSpriteSheet from "../assets/images/torch-Sheet.png";

 export const useEnvironmentObject = (cellSize, tileSize) => {

  const torch = {
    sprite: wallTorchSpriteSheet,
    animation: {
      frameTotal: 7,
      frame: 0,
      speed: 125,
      lastFrameTime: 0
    }
  };

  const renderTorch = (ctx, timestamp, xPosition, yPosition) => {
    const wallTorch = new Image();
    wallTorch.src = torch.sprite;

    const renderObjects = (timestamp) => {
      const deltaTime = timestamp - torch.animation.lastFrameTime;
      if (deltaTime >= torch.animation.speed) {
        torch.animation.frame = (torch.animation.frame + 1) % torch.animation.frameTotal;
        torch.animation.lastFrameTime = timestamp;
      }
      return {x: torch.animation.frame * tileSize, y: 0};
    };

    const {x, y} = renderObjects(timestamp);

    ctx.drawImage(
      wallTorch, 
      x, 
      y, 
      tileSize, 
      tileSize, 
      xPosition * cellSize, 
      yPosition * cellSize, 
      cellSize,
      cellSize
    );
  };

  return { renderTorch }
};