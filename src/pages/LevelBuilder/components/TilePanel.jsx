import React, { useState, useMemo } from "react";

import '../LevelBuilder.scss';

import dungeonDetails from "../../../assets/dungeon.json"
import dungeonTilesSheet from "../../../assets/images/DungeonTiles.png";
import torchSheet from "../../../assets/images/torch-Sheet.png";
import arrow from "../../../assets/images/arrow.png";

import { tileLayer, tileState } from "../LevelBuilderConstants.js";

export const TilePanel = ({tileSelected, handleTileButtonClick}) => {
    const [showFloorList, setShowFloorList] = useState(false);
    const [showWallsList, setShowWallsList] = useState(false);
    const [showDoorwaysList, setShowDoorwaysList] = useState(false);
    const [showObjectsList, setShowObjectsList] = useState(false);
    const [showPrefabList, setPrefabList] = useState(false);
   
    const baseLayerTiles = useMemo(() => {
      return dungeonDetails.tileKey.filter((x) => x.layer === tileLayer.BASE)
    }, []);
  
    const collisionLayerTiles = useMemo(() => {
      return dungeonDetails.tileKey.filter((x) => x.layer === tileLayer.COLLISION)
    }, []);
  
    const doorwayTiles = useMemo(() => {
      return dungeonDetails.tileKey.filter((x) => x.state === tileState.STATIC)
    }, []);
  
    const closeAllList = () => {
      setShowFloorList(false);
      setShowWallsList(false);
      setShowDoorwaysList(false);
      setShowObjectsList(false);
      setPrefabList(false);
    };
  
    return (
      <div className="panel">
        <h3>TILES</h3>
  
        <div style={{padding: '10px'}}>
          <TileListHeader 
            title="Floors"
            showList={showFloorList}
            setShowList={setShowFloorList}
            resetAll={closeAllList}
          />
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
            resetAll={closeAllList}
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
            resetAll={closeAllList}
          />
          <TileButtonList
            tileSpriteSheet={dungeonTilesSheet}
            layerTiles={doorwayTiles}
            handleClick={handleTileButtonClick}
            tileSelected={tileSelected}
            showList={showDoorwaysList}
          />
  
          <TileListHeader 
            title="Details"
            showList={showObjectsList}
            setShowList={setShowObjectsList}
            resetAll={closeAllList}
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

          <TileListHeader 
            title="Prefabs"
            showList={showPrefabList}
            setShowList={setPrefabList}
            resetAll={closeAllList}
          />
          <div>
            {showPrefabList &&
            <TileButtonPrefab 
              prefab={{id: 'room', detail: 'dungeon room - rectangle'}}
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
    setShowList,
    resetAll,
  }) => {
  
    const handleClick = () => {
      const toggle = !showList;
      if (toggle) resetAll();
      setShowList(toggle);
    };
  
    return (
      <div className="panel__collapse-header" onClick={handleClick}>
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
        className={`admin__tile-button ${tile.id === tileSelected ? "admin__tile-button--selected" : null}`}
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

const TileButtonPrefab = ({
  prefab, 
  handleClick, 
  tileSelected
}) => {
  return (
    <button 
      className={`admin__tile-button ${prefab.id === tileSelected ? "admin__tile-button--selected" : null}`}
      onClick={() => handleClick(prefab.id)}
    >
      <span/>
      {prefab.detail}
    </button>
  );
};