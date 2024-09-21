import React, {useState, useCallback, useRef, useEffect } from 'react';

import { Header } from '../../components/Header.jsx';
import './LevelBuilder.scss';

import dungeonDetails from "../../assets/dungeon.json"
import mobDetails from "../../assets/mobs.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import torchSheet from "../../assets/images/torch-Sheet.png";
import ghoulSheet from "../../assets/images/ghoul-master.png";

import { tileLayer } from "./LevelBuilderConstants.js";
import { useTile } from "../../hooks/useTile";

import { ConfigurationsModal } from './components/ConfigurationsModal.jsx';
import { TilePanel } from './components/TilePanel.jsx'
import { MobPanel } from './components/MobPanel.jsx';

const pixelsPerTile = 32;

const tools = { 
  ERASER: 'eraser', 
  ADD_TILE: 'add-tile', 
  ADD_MOB: 'add-mob', 
  ADD_OBJECT: 'add-object'
};

export const LevelBuilder = () => {
  
  const workAreaRef = useRef(null);
  const [drawDimensions, setDrawDimensions] = useState({x: 10, y: 10});
  const [level, setLevel] = useState({x: 0, y: 0, zoomSize: 1});
  const [levelTiles, setLevelTiles] = useState([]);
  const [map, setMap] = useState({x: 0, y: 0});

  const [toolSelected, setToolSelected] = useState(tools.ADD_TILE);
  const [tileSelected, setTileSelected] = useState(null);
  const [mobSelected, setMobSelected] = useState(null);
  const [objectSelected, setObjectSelected] = useState(null);

  const [baseMap, setBaseMap] = useState([]);
  const [collisionMap, setCollisionMap] = useState([]);
  const [objectsMap, setObjectsMap] = useState([]);
  const [mobMap, setMobMap] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showBase, setShowBase] = useState(true);
  const [showCollision, setShowCollision] = useState(true);
  const [showObject, setShowObject] = useState(true);
  const [showMobs, setShowMobs] = useState(true);

  const { baseLookUpByCoordinates } = useTile(dungeonDetails);

  const initializeEditorDimensions = () => {
    const element = workAreaRef.current;
    let dimensions = {x: 0, y: 0};
    dimensions.x = Math.floor(element.getBoundingClientRect().width / pixelsPerTile) - 1;
    dimensions.y = Math.floor(element.getBoundingClientRect().height / pixelsPerTile) - 1;
    setMap({x:0, y:0})
    setDrawDimensions(dimensions);
    setLevel({x: dimensions.x, y: dimensions.y, zoomSize: 1});
  };
  
  useEffect(() => {
    initializeEditorDimensions();
  }, []);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setDrawDimensions({...drawDimensions, [name]: parseInt(value)});
  };

  const downloadJson = useCallback(() => {
    // level type
    const type = "dungeon.json";
    // level details
    const details = {
      width: parseInt(map.x), 
      height: parseInt(map.y)
    };

    const json = {
      mapType: type,
      level: {width: details.width + 2, height: details.height + 2},
      start: {x: 3, y: 3}, //TODO: make this configurable in tools
      baseMap: baseMap, 
      collisionMap: collisionMap,
      objectsMap: objectsMap,
      mobs: mobMap
    };

    // create json file and download
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'dungeon-map.json';
    link.click();
  }, [map, baseMap, collisionMap, objectsMap, mobMap]);

  const handleTileButtonClick = (id) => {
    if(id === tileSelected) {
      setTileSelected('');
      return;
    }
    setTileSelected(id);
    setMobSelected(null);
  };

  const handleMobButtonClick = (id) => {
    if(id === mobSelected) {
      setMobSelected(null);
      return;
    }
    setMobSelected(id);
    setTileSelected(null);
  }

  const resetMap = useCallback(() => {
    initializeEditorDimensions();
    
    setBaseMap([]); 
    setCollisionMap([]); 
    setObjectsMap([]);
    setMobMap([]);
    setLevelTiles([]); 
  }, []);

  const handleSaveClick = () => {
    downloadJson();
  };

  const handleResetClick = () => {
    resetMap();
  };

  const handleUpdateGridClick = () => {
    if(drawDimensions.x > 0 && drawDimensions.y > 0){
      updateLevelDimension(drawDimensions.x, drawDimensions.y);
    }
    else {
      setDrawDimensions({x: level.x, y: level.y});
    }
  };

  const handleResetDimensionClick = () => {
    setDrawDimensions({x: level.x, y: level.y});
  };

  const updateLevelDimension = (x, y) => {
    setLevel((prev) => ({...prev, x: x, y: y}));
  };

  const updateEditorMap = (x, y, base, collision, objects) => {
    setBaseMap(base);
    setCollisionMap(collision);
    setObjectsMap(objects);
    setLevelTiles([...base, ...collision, ...objects]);
    setMap({x: x, y: y});

    setLevel({
      x: level.x > x ? level.x : x, 
      y: level.y > y ? level.y : y,
      zoomSize: 1});
    setDrawDimensions({
      x: level.x > x ? level.x : x, 
      y: level.y > y ? level.y : y,
    });
  };

  useEffect(() => {
    if(toolSelected === tools.ERASER) {
      setTileSelected('reset');
    }

    if(toolSelected === tools.ADD_TILE) {
      setMobSelected(null);
    }

    if(toolSelected === tools.ADD_MOB) {
      setTileSelected(null);
      
    }

    if(toolSelected === tools.ADD_OBJECT) {
      setTileSelected(null);
      setMobSelected(null);
    }
  }, [toolSelected]);

  return (
    <>
    <div className="admin">
      <Header 
        title="Level Builder"
        menuOptions={[
          { label:"Level Select", link:"/levelSelect" },
          { label:"Game Stats", link:"/stats" }
        ]}
      />

      <section className="admin__controls">
        <div className="admin__controls--header-title">
          Controls
        </div>
        <div className="admin__controls--grid-form">
          <h3>Grid Dimensions</h3>
          <div className="admin__grid-form--inputs">
            <div>
              <label htmlFor="x">Width</label>
              <input 
                name="x" 
                type="number" 
                placeholder="Enter Width"
                className="admin__input"
                value={drawDimensions.x}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div>
              <label htmlFor="y">Height</label>
              <input 
                name="y" 
                type="number" 
                placeholder="Enter Height"
                className="admin__input"
                value={drawDimensions.y}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <button className="admin__button" onClick={() => handleResetDimensionClick()}>Reset Grid</button>
            <button className="admin__button" 
              onClick={() => handleUpdateGridClick()}
              disabled={level.x === drawDimensions.x && level.y === drawDimensions.y}>
                Update Grid
            </button>
          </div>
        </div>

        <div className="admin__controls--show">
          <h3>Show Controls</h3>
          <div className="admin__controls--display-option">
            <input 
              type="checkbox" 
              name="showCoordinates" 
              checked={showCoordinates}
              onChange={(e) => setShowCoordinates(!showCoordinates)}
              className="admin__checkbox" 
            />
            <label htmlFor="showCoordinates" className="admin__checkbox--label">Show Coordinates</label>
          </div>
          <div className="admin__controls--display-option">
            <input 
              type="checkbox" 
              name="showGrid" 
              checked={showGrid}
              onChange={(e) => setShowGrid(!showGrid)}
              className="admin__checkbox" 
            />
            <label htmlFor="showGrid" className="admin__checkbox--label">Show Grid</label>
          </div>
          <div className="admin__controls--display-option">
            <input 
              type="checkbox" 
              name="showBase" 
              checked={showBase} 
              onChange={(e) => setShowBase(!showBase)}
              className="admin__checkbox" 
            />
            <label htmlFor="showBase" className="admin__checkbox--label">Show Base</label>
          </div>
          <div className="admin__controls--display-option">
            <input 
              type="checkbox" 
              name="showCollision" 
              checked={showCollision}
              onChange={(e) => setShowCollision(!showCollision)}
              className="admin__checkbox" 
            />
            <label htmlFor="showCollision" className="admin__checkbox--label">Show Collision</label>
          </div>
          <div className="admin__controls--display-option">
            <input 
              type="checkbox" 
              name="showObject"
              checked={showObject}
              onChange={(e) => setShowObject(!showObject)}
              className="admin__checkbox" 
            />
            <label htmlFor="showObject" className="admin__checkbox--label">Show Object</label>
          </div>
          <div className="admin__controls--display-option">
            <input 
              type="checkbox" 
              name="showMobs"
              checked={showMobs}
              onChange={(e) => setShowMobs(!showMobs)}
              className="admin__checkbox" 
            />
            <label htmlFor="showMobs" className="admin__checkbox--label">Show Mobs</label>
          </div>
        </div>

        <div className="admin__controls--tools">
          <h3>Map Tools</h3>
          <div>
            <input 
              type="radio"
              name="tool"
              value={tools.ADD_TILE}
              checked={toolSelected === tools.ADD_TILE}
              onChange={(e) => setToolSelected(e.target.value)}
              className="admin__checkbox" 
            />
            <label htmlFor="tool" className="admin__checkbox--label">Add Tile</label>
          </div>
          <div>
            <input
              type="radio"
              name="tool"
              value={tools.ADD_MOB}
              checked={toolSelected === tools.ADD_MOB}
              onChange={(e) => setToolSelected(e.target.value)}
              className="admin__checkbox" 
            />
            <label htmlFor="tool" className="admin__checkbox--label">Add Mob</label>
          </div>
          <div>
            <input
              type="radio"
              name="tool"
              value={tools.ADD_OBJECT}
              checked={toolSelected === tools.ADD_OBJECT}
              onChange={(e) => setToolSelected(e.target.value)}
              className="admin__checkbox" 
            />
            <label htmlFor="tool" className="admin__checkbox--label">Add Item(s)</label>
          </div>
          <div>
            <input
              type="radio"
              name="tool"
              value={tools.ERASER}
              checked={toolSelected === tools.ERASER}
              onChange={(e) => setToolSelected(e.target.value)}
              className="admin__checkbox" 
            />
            <label htmlFor="tool" className="admin__checkbox--label">Erase</label>
          </div>
        </div>

        <div className="admin__controls--buttons">
          <button className="admin__button" onClick={() => {setShowUploadModal(true)}}>Upload</button>
          <button className="admin__button" onClick={handleResetClick}>Reset Editor</button>
          <button className="admin__button" onClick={handleSaveClick}>Save</button>
        </div>
      </section>

      <section className="admin__generate">
        <section className="admin__map--preview">
          
          <section className="admin__sidebar">
            {toolSelected === tools.ADD_TILE &&
            <TilePanel 
              tileSelected={tileSelected}
              handleTileButtonClick={handleTileButtonClick}
            />}

            {toolSelected === tools.ADD_MOB &&
            <MobPanel 
              mobSelected={mobSelected}
              handleMobButtonClick={handleMobButtonClick}
            />}

            {toolSelected === tools.ERASER &&
            <div className="panel">
              <h3>ERASER</h3>
              <p>Click on a tile to remove it from the map</p>
            </div>}

            {toolSelected === tools.ADD_OBJECT &&
            <div className="panel">
              <h3>ADD OBJECT</h3>
              <p>This feature is currently Under Development</p>
            </div>}

          </section>
          
          <div id="workArea" className="panel" ref={workAreaRef}>
            <section className="admin__map-details" >
              <div id="admin-map-details-dimensions"
                className="admin__map-details--dimensions">
                Grid Dimensions [x]:{level.x} [y]:{level.y}
              </div>

              <div id="admin-map-details-map"
                className="admin__map-details--dimensions">
                Map Dimensions [x]:{map.x} [y]:{map.y}
              </div>
            </section>

            <div className="panel__map-container">
              {level.x <= 0 || level.y <= 0 ? "...loading" :
                <>
                  <WorkspaceLayer
                    layerName="base"
                    pixelsPerTile={pixelsPerTile} 
                    level={level}
                    tiles={baseMap}
                    showLayer={showBase}
                  />   
                  <WorkspaceLayer
                    layerName="collision"
                    pixelsPerTile={pixelsPerTile} 
                    level={level}
                    tiles={collisionMap}
                    showLayer={showCollision}
                  /> 
                  <WorkspaceLayer
                    layerName="objects"
                    pixelsPerTile={pixelsPerTile} 
                    level={level}
                    tiles={objectsMap}
                    showLayer={showObject}
                  /> 
                  <RenderLayer
                    layerName="mobs"
                    items={mobMap}
                    showLayer={showMobs}
                    itemDetails={mobDetails}
                    level={level}
                    pixelsPerTile={pixelsPerTile}
                  />
                  <InteractionLayer
                    level={level} 
                    pixelsPerTile={pixelsPerTile} 
                    tileSelected={tileSelected}
                    mobSelected={mobSelected}
                    toolSelected={toolSelected}
                    baseMap={baseMap}
                    setBaseMap={setBaseMap}
                    collisionMap={collisionMap}
                    setCollisionMap={setCollisionMap}
                    objectsMap={objectsMap}
                    setObjectsMap={setObjectsMap}
                    mobMap={mobMap}
                    setMobMap={setMobMap}
                    showGrid={showGrid}
                    showCoordinates={showCoordinates}
                    setMap={setMap}
                  />  
                </>
              }
            </div>
          </div>
        </section>
      </section>
    </div>

    <ConfigurationsModal 
      showUploadModal={showUploadModal} 
      setShowUploadModal={setShowUploadModal}
      updateLevelDimension={updateLevelDimension}
      updateEditorMap={updateEditorMap}
    />
    </>
  );
};

const WorkspaceLayer = ({
  layerName,
  level, 
  pixelsPerTile, 
  tiles=[],
  showLayer=true,
}) => {
  return (
    showLayer &&
    <div id={`layer-${layerName}`} className="workspace__layer">
      <div style={{
        display: 'grid', 
        gridTemplateColumns: `repeat(${level.x}, ${pixelsPerTile * level.zoomSize}px)`,
        }}>
          {[...Array(level.y)].map((_, i) => {
            return (
              [...Array(level.x)].map((_, j) => {
                let tileExist = tiles.find((tile) => tile.x === j && tile.y === i);
                if(tileExist) {
                  let tileDetail = dungeonDetails.tileKey.find(tileKey => tileKey.id === tileExist.tileKey);
                  if(!tileDetail) {
                    tileDetail = dungeonDetails.tileKey.find(tileKey => tileKey.id === tileExist.tileKey);
                  }
                  return (
                    <div key={j}
                      style={{
                        backgroundImage: tileDetail && `url(${dungeonTilesSheet})`,
                        backgroundPosition: tileDetail && `-${tileDetail.x / pixelsPerTile * 100}% -${tileDetail.y / pixelsPerTile * 100}%`,
                        backgroundSize: `${dungeonDetails.spriteSheetSize.x}% ${dungeonDetails.spriteSheetSize.y}%`,
                        height: `${pixelsPerTile}px`,
                        width: `${pixelsPerTile}px`,
                        transform: `scale(${level.zoomSize})`,
                      }}
                    >
                    </div>
                  )
                }
                else {
                  return (
                  <div key={j}
                    className='workspace__cell'
                    style={{
                      height: `${pixelsPerTile - 2}px`,
                      width: `${pixelsPerTile - 2}px`,
                      transform: `scale(${level.zoomSize})`,
                    }}>
                  </div>
                )
              }
            })
          )
          })} 
      </div>
    </div>
  )
};

const RenderLayer = ({
  layerName,
  items = [],
  showLayer=true,
  itemDetails,
  level,
  pixelsPerTile,
}) => {
  return (
    showLayer && 
    <div id={`layer-${layerName}`} className="workspace__layer">
      <div style={{
        display: 'grid', 
        gridTemplateColumns: `repeat(${level.x}, ${pixelsPerTile * level.zoomSize}px)`,
        }}>
          {[...Array(level.y)].map((_, i) => {
            return (
              [...Array(level.x)].map((_, j) => {
                let itemExists = items.find((item) => item.x === j && item.y === i);
                if(itemExists) {
                  let details = itemDetails.mobs.find(mob => mob.id === itemExists.id);
                  if(!details) {
                    details = itemDetails.mobs.find(mob => mob.id === itemExists.id);
                  }
                  return (
                    <div key={j}
                      style={{
                        backgroundImage: details && `url(${ghoulSheet})`,
                        backgroundPosition: details && `-${details.x / pixelsPerTile * 100}% -${details.y / pixelsPerTile * 100}%`,
                        // backgroundSize: `${details.spriteSheetSize.x}% ${details.spriteSheetSize.y}%`,
                        height: `${pixelsPerTile}px`,
                        width: `${pixelsPerTile}px`,
                        transform: `scale(${level.zoomSize * 1.5})`,
                      }}
                    ></div>
                )}
                else {
                  return (
                    <div key={j}
                      className='workspace__cell'
                      style={{
                        height: `${pixelsPerTile - 2}px`,
                        width: `${pixelsPerTile - 2}px`,
                        transform: `scale(${level.zoomSize})`,
                      }}>
                    </div>
                )}
              })
            )})}
      </div>
    </div>
  )
};

const InteractionLayer = ({
  level, 
  pixelsPerTile, 
  tileSelected,
  mobSelected,
  toolSelected,
  baseMap,
  setBaseMap,
  collisionMap,
  setCollisionMap,
  objectsMap,
  setObjectsMap,
  mobMap, 
  setMobMap,
  showGrid=true,
  showCoordinates=false,
  setMap,
}) => {
  const [highlightedTiles, setHighlightedTiles] = useState([]);
  const [longPressStart, setLongPressStart] = useState({ x: '', y: '' });

  let longPressTimer;

  const updateMaxValues = (data) => {
    const maxDataX = Math.max(...data.map(item => item.x));
    const maxDataY = Math.max(...data.map(item => item.y));

    const maxBaseX = Math.max(...baseMap.map(item => item.x));
    const maxBaseY = Math.max(...baseMap.map(item => item.y));

    const maxCollisionX = Math.max(...collisionMap.map(item => item.x));
    const maxCollisionY = Math.max(...collisionMap.map(item => item.y));

    const maxObjectsX = Math.max(...objectsMap.map(item => item.x));
    const maxObjectsY = Math.max(...objectsMap.map(item => item.y));

    const maxX = Math.max(maxDataX, maxBaseX, maxCollisionX, maxObjectsX);
    const maxY = Math.max(maxDataY, maxBaseY, maxCollisionY, maxObjectsY);

    setMap({x: maxX, y: maxY});
  }

  const updateTileset = (prevTileset, x, y, tileKey) => {
    const tileIndex = prevTileset.findIndex(tile => tile.x === x && tile.y === y);
    if(tileIndex !== -1) {
      const newTileset = [...prevTileset];
      newTileset[tileIndex] = {x: x, y: y, tileKey: tileKey};
      updateMaxValues(newTileset);
      return newTileset;
    }
    else {
      updateMaxValues([...prevTileset, {x: x, y: y, tileKey: tileKey}]);
      return [...prevTileset, {x: x, y: y, tileKey: tileKey}];
    }
  };

  const updateMobset = (prevMobset, x, y, id) => {
    const mobIndex = prevMobset.findIndex(mob => mob.x === x && mob.y === y);
    const details = mobDetails.mobs.find(mob => mob.id === id);

    if(mobIndex !== -1) {
      const newMobset = [...prevMobset];
      newMobset[mobIndex] = {...details, name:`${details.name}-${Math.floor(Math.random() * 10)}` , x: x, y: y};
      return newMobset;
    }
    else {
      return [...prevMobset, {...details, x: x, y: y}];
    }
  };

  const resetTileset = (prevTileset, x, y) => {
    const tileIndex = prevTileset.findIndex(tile => tile.x === x && tile.y === y);
    if(tileIndex !== -1) {
      const newTileset = [...prevTileset];
      newTileset.splice(tileIndex, 1);
      updateMaxValues(newTileset);
      return newTileset;
    }
    updateMaxValues(prevTileset);
    return prevTileset;
  };
  
  const handleMouseDown = (x, y) => {
    longPressTimer = setTimeout(() => {
      setLongPressStart({x: x, y: y});
      setHighlightedTiles([{ x: x, y: y }]);
    }, 250);
  };

  const handleClick = (x, y) => {
    clearTimeout(longPressTimer);
    setHighlightedTiles([]);
    setLongPressStart({x: '', y: ''});

    if(toolSelected === tools.ADD_MOB) {
      if(mobSelected === null) {
        return;
      }
      setMobMap(updateMobset(mobMap, x, y, mobSelected));
      return;
    }

    if(tileSelected === '' || tileSelected === null) {
      return;
    }

    if(toolSelected === tools.ERASER) {
      // check if mob exists
      const mobIndex = mobMap.findIndex(mob => mob.x === x && mob.y === y);
      if(mobIndex !== -1) {
        const newMobMap = [...mobMap];
        newMobMap.splice(mobIndex, 1);
        setMobMap(newMobMap);
        return;
      }

      // check if object exists
      const objectIndex = objectsMap.findIndex(tile => tile.x === x && tile.y === y);
      if(objectIndex !== -1) {
        setObjectsMap(resetTileset(objectsMap, x, y));
        return;
      }

      // check if collision tile exists
      const collisionIndex = collisionMap.findIndex(tile => tile.x === x && tile.y === y);
      if(collisionIndex !== -1) {
        setCollisionMap(resetTileset(collisionMap, x, y));
        return;
      }

      // check if base tile exists
      const baseIndex = baseMap.findIndex(tile => tile.x === x && tile.y === y);
      if(baseIndex !== -1) {
        setBaseMap(resetTileset(baseMap, x, y));
        return;
      }
    }
    
    if (tileSelected !== '') {
      let newBaseMap = baseMap;
      let newCollisionMap = collisionMap;
      let newObjectsMap = objectsMap;
      const tileDetails = dungeonDetails.tileKey.find(tileKey => tileKey.id === tileSelected);

      if(!tileDetails) {
        console.error('Doorways and Details not working yet');
        return;
      };
      
      switch (tileDetails.layer) {
        case tileLayer.BASE:
          newBaseMap = updateTileset(baseMap, x, y, tileSelected);
          break;
        case tileLayer.COLLISION:
          newCollisionMap = updateTileset(collisionMap, x, y, tileSelected);
          break;
        case tileLayer.OBJECTS:
          newObjectsMap = updateTileset(objectsMap, x, y, tileSelected);
          break;
        default:
          break;
      }

      setBaseMap(newBaseMap);
      setCollisionMap(newCollisionMap);
      setObjectsMap(newObjectsMap);
    }
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer);

    if(tileSelected === '' || tileSelected === null) {
      return;
    }

    if(highlightedTiles.length > 0) {
      // add bulk tile updates here
      let newBaseMap = baseMap;
      let newCollisionMap = collisionMap;
      let newObjectsMap = objectsMap;

      if(tileSelected === 'reset') {
        highlightedTiles.forEach((tile) => {
          //remove all mobs from selected area
          const mobIndex = mobMap.findIndex(mob => mob.x === tile.x && mob.y === tile.y);
          if(mobIndex !== -1) {
            const newMobMap = [...mobMap];
            newMobMap.splice(mobIndex, 1);
            setMobMap(newMobMap);
          }
          //remove all objects from selected area
          const objectIndex = objectsMap.findIndex(obj => obj.x === tile.x && obj.y === tile.y);
          if(objectIndex !== -1) {
            const newObjectsMap = [...objectsMap];
            newObjectsMap.splice(objectIndex, 1);
            setObjectsMap(newObjectsMap);
          }
          //remove all collision tiles from selected area
          newBaseMap = resetTileset(newBaseMap, tile.x, tile.y);;
          newCollisionMap = resetTileset(newCollisionMap, tile.x, tile.y);
          newObjectsMap = resetTileset(newObjectsMap, tile.x, tile.y);
        });
      }
      else if(tileSelected === 'room') {
        //overwrite anything existing in selected area
        highlightedTiles.forEach((tile) => {
          newBaseMap = resetTileset(newBaseMap, tile.x, tile.y);;
          newCollisionMap = resetTileset(newCollisionMap, tile.x, tile.y);
          newObjectsMap = resetTileset(newObjectsMap, tile.x, tile.y);
        });

        // create room
        const minX = Math.min(...highlightedTiles.map(tile => tile.x));
        const maxX = Math.max(...highlightedTiles.map(tile => tile.x));
        const minY = Math.min(...highlightedTiles.map(tile => tile.y));
        const maxY = Math.max(...highlightedTiles.map(tile => tile.y));

        highlightedTiles.forEach((tile, i) => {
          if(tile.x === minX && tile.y === minY) {
            newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, "a0");
          }
          else if(tile.x === maxX && tile.y === minY) {
            newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, "a4");
          }
          else if(tile.x === minX && tile.y === maxY) {
            newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, "d0");
          }
          else if(tile.x === maxX && tile.y === maxY) {
            newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, "d4");
          }
          else if((tile.x === minX || tile.x === maxX ) && (tile.y !== minY && tile.y !== maxY)) {
            newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, "b0");
          }
          else if((tile.y === minY || tile.y === maxY ) && (tile.x !== minX && tile.x !== maxX)) {
            newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, "a1");
          }
          else {
            const tileId = (tile.x + tile.y) % 2 === 0 ? "c2" : "c1";
            newBaseMap = updateTileset(newBaseMap, tile.x, tile.y, tileId);
          }
        });
      }
      else if (tileSelected !== '') {
        highlightedTiles.forEach((tile) => {
          const tileDetails = dungeonDetails.tileKey.find(tileKey => tileKey.id === tileSelected);

          switch (tileDetails.layer) {
            case tileLayer.BASE:
              newBaseMap = updateTileset(newBaseMap, tile.x, tile.y, tileSelected);
              break;
            case tileLayer.COLLISION:
              newCollisionMap = updateTileset(newCollisionMap, tile.x, tile.y, tileSelected);
              break;
            case tileLayer.OBJECTS:
              newObjectsMap = updateTileset(newObjectsMap, tile.x, tile.y, tileSelected);
              break;
            default:
              break;
          }
        });
      }
      setBaseMap(newBaseMap);
      setCollisionMap(newCollisionMap);
      setObjectsMap(newObjectsMap);
    }
    
    setHighlightedTiles([]);
    setLongPressStart({x: '', y: ''});
  };

  const handleMouseEnter = (x, y) => {
    if(longPressStart.x !== '' && longPressStart.y !== '') {
      const startX = longPressStart.x;
      const startY = longPressStart.y;
      const endX = x;
      const endY = y;

      // Calculate highlighted tiles based on drag
      const newHighlightedTiles = [];
      for (let i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) {
        for (let j = Math.min(startX, endX); j <= Math.max(startX, endX); j++) {
          newHighlightedTiles.push({ x: j, y: i });
        }
      }
      setHighlightedTiles(newHighlightedTiles);
    }
  };

  return (
    <div id="layer-interaction" className="workspace__layer">
      <div style={{
        display: 'grid', 
        gridTemplateColumns: `repeat(${level.x}, ${pixelsPerTile * level.zoomSize}px)`,
        }}>
          {[...Array(level.y)].map((_, i) => {
            return (
              [...Array(level.x)].map((_, j) => {
                return (
                <div key={j} 
                  className="workspace__cell--interaction"
                  style={{
                    height: `${pixelsPerTile - 2}px`,
                    width: `${pixelsPerTile - 2}px`,
                    transform: `scale(${level.zoomSize})`,
                    backgroundColor: highlightedTiles.find((tile) => tile.x === j && tile.y === i) 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'transparent',
                    borderColor: showGrid ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                  }}
                  onClick={() => handleClick(j, i)}  
                  onMouseUp={() => handleMouseUp()}
                  onMouseDown={(e) => handleMouseDown(j, i)}
                  onMouseEnter={() => handleMouseEnter(j, i)}
                >
                  {showCoordinates && 
                    <div>{`(${i}, ${j})`}</div>
                  }
                </div>
              )
            })
          )
          })}
      </div>
    </div>
  )
};