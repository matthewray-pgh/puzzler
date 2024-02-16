import React, {useState, useCallback, useMemo} from 'react';

import { Header } from '../../components/Header.jsx';
import './LevelBuilder.scss';

import dungeonDetails from "../../assets/dungeon.json"
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";
import torchSheet from "../../assets/images/torch-Sheet.png";
import arrow from "../../assets/images/arrow.png";

import { tileLayer, tileState } from "./LevelBuilderConstants.js";
import { useTile } from "../../hooks/useTile";

const pixelsPerTile = 32;

export const LevelBuilder = () => {
  const [outputJson, setOutputJson] = useState('');
  const [level, setLevel] = useState({x: '', y: '', zoomSize: 1});
  const [levelTiles, setLevelTiles] = useState([]);
  
  const [tileSelected, setTileSelected] = useState('');

  const [baseMap, setBaseMap] = useState([]);
  const [collisionMap, setCollisionMap] = useState([]);
  const [objectsMap, setObjectsMap] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { tileLookUpById, baseLookUpByCoordinates } = useTile(dungeonDetails);

  // generates base map based on initial width and height
  const buildMap = (x, y) => {
    //check if levelTiles is empty
    let map = [];
    Array.from({length: y}).map((_, i) => {
      return (
        Array.from({length: x}).map((_, j) => {
          return (
            map.push({x: i, y: j, 
              tileKey:(i + j) % 2 === 0 ? 'c1' : 'c2', 
              layer: tileLayer.BASE
            })
          )
        })
      )
    })
    setBaseMap(map);
    return map;
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setLevel({...level, [name]: value});
  };

  const handleTileClick = useCallback((x, y) => {
    //get tile details
    const tileDetails = tileLookUpById(tileSelected);
    const updateTileIndex = levelTiles.findIndex(tile => tile.x === x && tile.y === y);
    if(tileSelected === 'reset') {
      const previousTile = baseLookUpByCoordinates(x, y, baseMap);
      const newTileSet = [...levelTiles];
      newTileSet[updateTileIndex] = {x: x, y: y, tileKey: previousTile.id, layer: tileLayer.BASE};
      setLevelTiles(newTileSet);
    }
    else if (tileSelected !== '') {
      const newTile = {x: x, y: y, tileKey: tileSelected, layer: tileDetails.layer};
      const newTileSet = [...levelTiles];
      newTileSet[updateTileIndex] = newTile;
      setLevelTiles(newTileSet);
    }
    // eslint-disable-next-line
  },[baseLookUpByCoordinates, levelTiles, tileLookUpById, tileSelected]);

  const generateMap = useCallback(() => {
    if(levelTiles.length > 0) {
      setShowConfirm(true);
    } else {
      setLevelTiles(buildMap(level.x, level.y));
    }
  }, [levelTiles, level]);

  const generateJson = useCallback(() => {
    // level type
    const type = "dungeon.json";
    // level details
    const details = {
      width: parseInt(level.x), 
      height: parseInt(level.y)
    };

    //filter tiles with no tileKey
    const filteredTiles = levelTiles.filter(obj => obj.tileKey !== undefined);
    
    //generate base map
    const base = filteredTiles.map((tile) => {
      let baseTile = tile;
      if(tile.layer !== "base") {
        baseTile = baseLookUpByCoordinates(tile.x, tile.y, baseMap);
      }
      return {x: tile.x, y: tile.y, tileKey: baseTile.tileKey};
    });

    //generate collision map
    const collision = filteredTiles.filter((tile) => tile.layer === tileLayer.MAIN).map((tile) => { 
      return {x: tile.x, y: tile.y, tileKey: tile.tileKey}});
    const json = {
      mapType: type,
      level: details, 
      baseMap: base, 
      collisionMap: collision
    };

    // create json file and download
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'dungeon-map.json';
    link.click();
    // eslint-disable-next-line
  }, [level, baseLookUpByCoordinates, levelTiles]);
  
  const Tiles = useMemo(() => {
    let longPressTimer;
    let longPressStart = {x: '', y: ''};
    let longPressEnd = {x: '', y: ''};
    
    const handleMouseDown = (x, y) => {
      longPressTimer = setTimeout(() => {
        longPressStart = {x: x, y: y};
      }, 500);
    };

    const handleMouseUp = (x, y) => {
      if(longPressStart.x !== '' && longPressStart.y !== '') {
        longPressEnd = {x: x, y: y};

        let diffX = longPressEnd.x - longPressStart.x;
        let diffY = longPressEnd.y - longPressStart.y;

        if (diffX !== 0) {
          const newTileSet = [...levelTiles];
          for (let i = 0; i <= Math.abs(diffX); i++) {
            const newX = longPressStart.x + (diffX > 0 ? i : -i);
            const startY = longPressStart.y;
            const updateTileIndex = newTileSet.findIndex((tile) => tile.x === newX && tile.y === startY);
            if (updateTileIndex !== -1) {
              newTileSet[updateTileIndex] = { x: newX, y: longPressStart.y, tileKey: tileSelected, layer: tileLayer.MAIN };
            }
          }
          setLevelTiles(newTileSet);
        }

        if (diffY !== 0) {
          const newTileSet = [...levelTiles];
          for (let i = 0; i <= Math.abs(diffY); i++) {
            const newY = longPressStart.y + (diffY > 0 ? i : -i);
            const startX = longPressStart.x;
            const updateTileIndex = newTileSet.findIndex((tile) => tile.y === newY && tile.x === startX);
            if (updateTileIndex !== -1) {
              const tileDetails = tileLookUpById(tileSelected);
              newTileSet[updateTileIndex] = { x: longPressStart.x, y: newY, tileKey: tileSelected, layer: tileDetails.layer };
            }
          }
          setLevelTiles(newTileSet);
        }
      }
      clearTimeout(longPressTimer);
    };

    return levelTiles.map((tile, i) => {
      const key = `${tile.x}-${tile.y}-${i}`;
      let tileDetail = dungeonDetails.dungeonTileKey.find(tileKey => tileKey.id === tile.tileKey);
      if(!tileDetail) {
        tileDetail = dungeonDetails.doorwayKey.find(tileKey => tileKey.id === tile.tileKey);
      }
      return (
        <div 
          key={key} 
          style={{
            backgroundImage: tileDetail && `url(${dungeonTilesSheet})`,
            backgroundPosition: tileDetail && `-${tileDetail.x / pixelsPerTile * 100}% -${tileDetail.y / pixelsPerTile * 100}%`,
            backgroundSize: `${dungeonDetails.spriteSheetSize.x}% ${dungeonDetails.spriteSheetSize.y}%`,
            height: `${pixelsPerTile}px`,
            width: `${pixelsPerTile}px`,
            transform: `scale(${level.zoomSize})`,
          }}
          onClick={() => handleTileClick(tile.x, tile.y)}
          onMouseUp={() => handleMouseUp(tile.x, tile.y)}
          onMouseDown={(e) => handleMouseDown(tile.x, tile.y)}
        >
        </div>
      )
    })
  }, [levelTiles, tileSelected, tileLookUpById, level.zoomSize, handleTileClick]);

  const handleTileButtonClick = (id) => {
    if(id === tileSelected) {
      setTileSelected('');
      return;
    }
    setTileSelected(id);
  };

  const resetMap = useCallback(() => {
    setLevel({x: '', y: '', zoomSize: 1});
    setBaseMap([]); 
    setCollisionMap([]); 
    setLevelTiles([]); 
    setOutputJson([]);
  }, []);

  const handleMapCreate = (width, height, base, collision) => {
    setBaseMap(base ? JSON.parse(base) : []);
    setLevel({...level, x: width, y: height });
    let newLevel = [];
    if(base && base.length > 0) {
      newLevel = [...JSON.parse(base)];
      if(collision && collision.length > 0) {
        const collisionMap = JSON.parse(collision);
        collisionMap.forEach((tile) => {
          const updateTileIndex = newLevel.findIndex((x) => x.x === tile.x && x.y === tile.y);
          if(updateTileIndex !== -1) {
            newLevel[updateTileIndex] = {x: tile.x, y: tile.y, tileKey: tile.tileKey};
          }
        });
      }
      setLevelTiles(newLevel);
      return;
    }
    setLevelTiles(buildMap(width, height));
    setShowUploadModal(false);
  };

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

      <section className="admin__generate">
        <section className="admin__generate--form">
          <div>
            <label htmlFor="x" className="admin__label">Width [x]</label>
            <input 
              name="x" 
              type="number" 
              placeholder="Enter Width"
              className="admin__input"
              onChange={(e) => handleInputChange(e)} 
              value={level.x} 
            />
          </div>
          <div>
            <label htmlFor="y" className="admin__label">Height [y]</label>
            <input 
              name="y" 
              type="number" 
              placeholder="Enter Height" 
              className="admin__input"
              onChange={(e) => handleInputChange(e)}
              value={level.y} 
            />
          </div>
          <div>
            <label htmlFor="zoomSize" className="admin__label">Zoom [pixel size]</label>
            <select 
              name="zoomSize" 
              onChange={(e) => handleInputChange(e)}
              value={level.zoomSize}
            >
              <option value={1}>32</option>
              <option value={2}>64</option>
              <option value={3}>96</option>
            </select>
          </div>
          <button className="admin__button" onClick={generateMap}>Generate Map</button>
          <button className="admin__button" onClick={generateJson}>Save Level</button>
          <button className="admin__button"onClick={()=>{setShowUploadModal(true)}}>Upload Level</button>
          <span></span>
          <button className="admin__button" onClick={resetMap}>Reset Map</button>
        </section>

        <section className="admin__map--preview">
          
          <TilePanel 
            tileSelected={tileSelected}
            handleTileButtonClick={handleTileButtonClick}
          />
          
          <div className="panel">
            <div className="panel__map-container">
              <div id="map" className="panel__map" style={{
                margin: '30px', 
                height: `${level.zoomSize * pixelsPerTile * level.y}px`,
                width: `${level.zoomSize * pixelsPerTile * level.x}px`,
                display: 'grid', 
                gridTemplateColumns: `repeat(${level.x}, ${pixelsPerTile * level.zoomSize}px)`,
              }}>
                {Tiles}
              </div>
              {/* <div id="map__objects" className="panel__map" style={{
                margin: '30px', 
                height: `${level.zoomSize * pixelsPerTile * level.y}px`,
                width: `${level.zoomSize * pixelsPerTile * level.x}px`,
                display: 'grid', 
                gridTemplateColumns: `repeat(${level.x}, ${pixelsPerTile * level.zoomSize}px)`,
              }}>
              </div> */}
            </div>
            <div>{outputJson}</div>
          </div>
        </section>
      </section>
    </div>
    <GenerateConfirm showConfirm={showConfirm} setShowConfirm={setShowConfirm} generateJson={generateJson}/>
    <UploadLevelFormModal 
      showUploadModal={showUploadModal} 
      setShowUploadModal={setShowUploadModal}
      handleMapCreate={handleMapCreate}
    />
    </>
  );
};

const TilePanel = ({tileSelected, handleTileButtonClick}) => {
  const [showFloorList, setShowFloorList] = useState(false);
  const [showWallsList, setShowWallsList] = useState(false);
  const [showDoorwaysList, setShowDoorwaysList] = useState(false);
  const [showObjectsList, setShowObjectsList] = useState(false);

  const baseLayerTiles = useMemo(() => {
    return dungeonDetails.dungeonTileKey.filter((x) => x.layer === tileLayer.BASE)
  }, []);

  const collisionLayerTiles = useMemo(() => {
    return dungeonDetails.dungeonTileKey.filter((x) => x.layer === tileLayer.MAIN)
  }, []);

  const doorwayTiles = useMemo(() => {
    return dungeonDetails.doorwayKey.filter((x) => x.state === tileState.STATIC)
  }, []);

  return (
    <div className="panel">
      <h3>TILES</h3>

      <div style={{padding: '10px'}}>
        <button 
          className={`admin__button ${'reset' === tileSelected ? "current-image-button" : "image-button"}`}
          onClick={() => handleTileButtonClick('reset')}>
            <div style={{border: '3px solid #fff', height: '26px', width: '26px'}}></div>
            clear cell
        </button>

        <div className="panel__collapse-header" onClick={() => {
            setShowFloorList(!showFloorList)
          }} >
          <h3 className="panel__collapse-header--title">Floor</h3>
          <div className="panel__collapse-header--icon">
            <img src={arrow} alt="arrow" 
              className={showFloorList ? "panel__collapse-header--icon-up" : "panel__collapse-header--icon-down"}/>
          </div>
        </div>
        <TileButtonList 
          tileSpriteSheet={dungeonTilesSheet}
          layerTiles={baseLayerTiles}
          handleClick={handleTileButtonClick}
          tileSelected={tileSelected}
          showList={showFloorList}
        />

        <TileListHeader 
          title="Walls"
          showList={showWallsList}
          setShowList={setShowWallsList}
        />
        <TileButtonList 
          tileSpriteSheet={dungeonTilesSheet}
          layerTiles={collisionLayerTiles}
          handleClick={handleTileButtonClick}
          tileSelected={tileSelected}
          showList={showWallsList}
        />

        <TileListHeader
          title="Doorways"
          showList={showDoorwaysList}
          setShowList={setShowDoorwaysList}
        />
        <TileButtonList
          tileSpriteSheet={dungeonTilesSheet}
          layerTiles={doorwayTiles}
          handleClick={handleTileButtonClick}
          tileSelected={tileSelected}
          showList={showDoorwaysList}
        />

        <TileListHeader 
          title="Objects"
          showList={showObjectsList}
          setShowList={setShowObjectsList}
        />
        <div>
          {showObjectsList &&
          <TileButton 
            tile={{id: 'torch', x: 0, y: 0, detail: 'Torch'}}
            tileSpriteSheet={torchSheet}
            handleClick={handleTileButtonClick}
            tileSelected={tileSelected}
          />}
        </div>
      </div>
    </div>
  );
};


const TileListHeader = ({
  title, 
  showList, 
  setShowList
}) => {
  return (
    <div className="panel__collapse-header" onClick={() => {
      setShowList(!showList)
    }} >
    <h3 className="panel__collapse-header--title">{title}</h3>
    <div className="panel__collapse-header--icon">
      <img src={arrow} alt="arrow" 
        className={showList ? "panel__collapse-header--icon-up" : "panel__collapse-header--icon-down"}/>
    </div>
  </div>
)};

const TileButtonList = ({
  tileSpriteSheet, 
  layerTiles, 
  handleClick, 
  tileSelected, 
  showList
}) => {
  return (
    showList &&
    layerTiles.map((tile, i) => {
      return (
        tile.detail &&
        <TileButton 
          key={i}
          tile={tile}
          tileSpriteSheet={tileSpriteSheet}
          handleClick={handleClick}
          tileSelected={tileSelected}
        />
      )
    })
  );
};

const TileButton = ({
  tile, 
  tileSpriteSheet, 
  handleClick, 
  tileSelected
}) => {
  return (
    <button 
      className={`admin__button ${tile.id === tileSelected ? "current-image-button" : "image-button"}`}
      onClick={() => handleClick(tile.id)}
    >
      <div style={{
        backgroundImage: `url(${tileSpriteSheet})`,
        backgroundPosition: `-${tile.x}px -${tile.y}px`,
        height: '32px',
        width: '32px',
      }}></div>
      {tile.detail}
    </button>
  );
};

const GenerateConfirm = ({showConfirm, setShowConfirm, generateJson}) => {
  const handleConfirm = () => {
    setShowConfirm(false);
    generateJson();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };
  return (
    <div className={`${showConfirm ? 'modal' : 'hide'}`}>
      <div className="modal__content">
        <div className="modal__content--message">Are you sure you want to generate a new map?</div>
        <div className="modal__content--button-panel">
          <button className="admin__button" onClick={() => handleConfirm()}>Confirm</button>
          <button className="admin__button" onClick={() => handleCancel()}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const UploadLevelFormModal = ({showUploadModal, setShowUploadModal, handleMapCreate}) => {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [baseMap, setBaseMap] = useState([]);
  const [collisionMap, setCollisionMap] = useState([]);

  const resetForm = () => {
    setWidth('');
    setHeight('');
    setBaseMap([]);
    setCollisionMap([]);
    setShowUploadModal(false);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const json = JSON.parse(text);
      setWidth(json.level.width);
      setHeight(json.level.height);
      setBaseMap(JSON.stringify(json.baseMap));
      setCollisionMap(JSON.stringify(json.collisionMap));
    };
    reader.readAsText(file);
  }

  const handleUploadClick = () => {
    handleMapCreate(width, height, baseMap, collisionMap);
    resetForm();
  };

  const handleCancelClick = () => {
    resetForm();
  };

  return (
    <div className={`${showUploadModal ? 'modal' : 'hide'}`}>
      <div className="modal__content">
        <div className="modal__content--title">Upload Level</div>
 
        <section className="admin__upload-form" >
          <div className="admin__upload-form--side-by-side">
            <div>
              <label htmlFor="width" className="admin__label">Width</label>
              <input 
                name="width" 
                type="text" 
                placeholder="Enter Width"
                className="admin__input"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="height" className="admin__label">Height</label>
              <input 
                name="height" 
                type="text" 
                placeholder="Enter Height"
                className="admin__input"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          <label htmlFor="baseMap" className="admin__label">Base Map JSON</label>
          <textarea
            name="baseMap"
            placeholder="Enter Base Map JSON"
            className="admin__input"
            value={baseMap}
            onChange={(e) => setBaseMap(e.target.value)}
          />

          <label htmlFor="collisionMap" className="admin__label">Collision Map JSON</label>
          <textarea
            name="collisionMap"
            placeholder="Enter Collision Map JSON"
            className="admin__input"
            value={collisionMap}
            onChange={(e) => setCollisionMap(e.target.value)}
          />

          <div>
            <div className="modal__divider-text">OR</div>

            <label htmlFor="uploadFile" className="admin__label">Upload JSON File</label>
            <input 
              type="file" 
              accept="application/json"  
              className="admin__input"
              onChange={(e) => handleFileChange(e)}
            />
          </div>
        </section>

        <div className="modal__content--button-panel">
          <button className="admin__button" onClick={handleUploadClick}>Upload</button>
          <button className="admin__button" onClick={handleCancelClick}>Cancel</button>
        </div>
      </div>
    </div>
  );
};