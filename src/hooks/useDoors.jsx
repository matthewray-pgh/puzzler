import dungeonDoor from '../assets/images/doorways-spritesheet.png';

export const useDoor = (cellSize, tileSize, doorSize, data) => {
    const doorMasterImage = new Image();
    doorMasterImage.src = dungeonDoor;

    const woodenDoors = data.map((d, i) => {
        return {
            id: `${i}-${d.x}-${d.y}`,
            sprite: dungeonDoor,
            open: {
                animation: {
                    frameTotal: 9,
                    frame: 3,
                    speed: 200,
                    lastFrameTime: 0,
                }
            },
            close: {
                animation: {
                    frameTotal: 9,
                    frame: 9,
                    speed: 1000,
                    lastFrameTime: 0
                }
            },
            collisionBox: {
                x: 0,
                y: 0,
                width: doorSize,
                height: doorSize,
            },
            interactionBox: {
                x: 0,
                y: 0,
                width: doorSize,
                height: doorSize,
            },
            position: { x: d.x, y: d.y },
            state: {
                isOpened: false,
                isOpening: false,
                isClosed: true,
                isClosing: false,
                isLocked: false,
            },
            message: "Open door?",
        };
    });

    const updateAnimationFrame = (door, timestamp) => {
        const animation = door.state.isOpening ? door.open.animation : door.close.animation;
        const deltaTime = timestamp - animation.lastFrameTime;

        if (deltaTime >= animation.speed) {
            if (animation.frame < animation.frameTotal - 1) { // Check if not at the last frame
                animation.frame += 1;
            }
            animation.lastFrameTime = timestamp;
        }

        const frameIndex = Math.min(animation.frame, animation.frameTotal - 1); // Ensure frame index does not exceed total frames
        return {
            x: frameIndex * tileSize,
            y: 0
        };
    };

    const render = (ctx, timestamp, showCollision, showInteraction) => {
        woodenDoors.forEach(door => {
            let staticTilePosition = door.state.isClosed ? 3 : 9;
            let { x, y } = (door.state.isOpening || door.state.isClosing) ?
                updateAnimationFrame(door, timestamp) :
                { x: staticTilePosition * tileSize, y: 0 };

            ctx.drawImage(
                doorMasterImage,
                x,
                y,
                tileSize,
                tileSize,
                door.position.x * cellSize,
                door.position.y * cellSize,
                doorSize,
                doorSize
            );

            if (showCollision) {
                ctx.strokeStyle = "fuchsia";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    door.position.x * cellSize + door.collisionBox.x,
                    door.position.y * cellSize + door.collisionBox.y,
                    door.collisionBox.width,
                    door.collisionBox.height
                );
            }

            if (showInteraction) {
                ctx.strokeStyle = "aqua";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    door.position.x * cellSize + door.interactionBox.x,
                    door.position.y * cellSize + door.interactionBox.y,
                    door.interactionBox.width,
                    door.interactionBox.height
                );
            }
        });
    };

    const toggleDoor = (id) => {
        woodenDoors.forEach(door => {
            if (door.id === id) {
                door.state.isOpened = !door.state.isOpened;
                door.state.isClosed = !door.state.isClosed;
                door.message = door.state.isOpened ? "Close door?" : "Open door?";
            }
        });
    };

    const toggleLock = (id) => {
        woodenDoors.forEach(door => {
            if (door.id === id) {
                door.state.isLocked = !door.state.isLocked;
            }
        });
    };

    return { woodenDoors, render, toggleDoor, toggleLock };
};
