import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { Link } from 'react-router-dom';

import './LevelBuilder.scss';

import levelDetails from "../../assets/levelOne.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";

const pixelsPerTile = 32;

export const LevelBuilder = () => {
  const [outputJson, setOutputJson] = useState('');
  const [level, setLevel] = useState({x: '', y: '', zoomSize: 1});
  const [levelTiles, setLevelTiles] = useState([]);
  const [current, setCurrent] = useState({x: '', y: ''});
  const [tileSelected, setTileSelected] = useState('');

  const buildMap = (x, y) => {
    //check if levelTiles is empty
    let map = [];
    Array.from({length: y}).map((_, i) => {
      return (
        Array.from({length: x}).map((_, j) => {
          return (
            map.push({x: i, y: j, id:(i + j) % 2 === 0 ? 'c1' : 'c2'})
          )
        })
      )
    })
    return map;
  }

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setLevel({...level, [name]: value});
  };

  const handleTileClick = useCallback((x, y) => {
    if(tileSelected === 'reset') {
      const updateTileIndex = levelTiles.findIndex(tile => tile.x === x && tile.y === y);
      const newTileSet = [...levelTiles];
      newTileSet[updateTileIndex] = {x: x, y: y, id: ''};
      setLevelTiles(newTileSet);
    }
    else if (tileSelected !== '') {
      const updateTileIndex = levelTiles.findIndex(tile => tile.x === x && tile.y === y);
      const newTileSet = [...levelTiles];
      newTileSet[updateTileIndex] = {x: x, y: y, id: tileSelected};
      setLevelTiles(newTileSet);
    }
    setCurrent({x: x, y: y});
  },[levelTiles, tileSelected]);

  const generateMap = useCallback(() => {
    setLevelTiles(buildMap(level.x, level.y));
  }, [level]);

  const generateJson = useCallback(() => {
    const json = JSON.stringify(levelTiles);
    setOutputJson(json);
  }, [levelTiles]);
  
  const Tiles = useMemo(() => {
    let longPressTimer;
    let longPressStart = {x: '', y: ''};
    let longPressEnd = {x: '', y: ''};
    
    const handleMouseDown = (x, y) => {
      setCurrent({x: x, y: y});
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
              newTileSet[updateTileIndex] = { x: newX, y: longPressStart.y, id: tileSelected };
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
              newTileSet[updateTileIndex] = { x: longPressStart.x, y: newY, id: tileSelected };
            }
          }
          setLevelTiles(newTileSet);
        }
      }
      clearTimeout(longPressTimer);
    };

    return levelTiles.map((tile, i) => {
      const key = `${tile.x}-${tile.y}`;
      const tileDetail = levelDetails.dungeonTileKey.find(tileKey => tileKey.id === tile.id);
      return (
        <div 
          key={key} 
          style={{
            backgroundImage: tileDetail && `url(${dungeonTilesSheet})`,
            backgroundPosition: tileDetail && `-${tileDetail.x / pixelsPerTile * 100}% -${tileDetail.y / pixelsPerTile * 100}%`,
            backgroundSize: '600% 400%',
            height: `${pixelsPerTile}px`,
            width: `${pixelsPerTile}px`,
            transform: `scale(${level.zoomSize})`,
          }}
          onClick={() => {handleTileClick(tile.x, tile.y)}}
          onMouseUp={() => handleMouseUp(tile.x, tile.y)}
          onMouseDown={(e) => handleMouseDown(tile.x, tile.y)}
        >
        </div>
      )
    })
  }, [levelTiles, handleTileClick, level.zoomSize, tileSelected]);

  const handleTileButtonClick = (id) => {
    if(id === tileSelected) {
      setTileSelected('');
      return;
    }
    setTileSelected(id);
  };

  return (
    <div className="admin">
      <h1>Level Builder</h1>
      <Link to="/">Home</Link>

      <section className="admin__generate">
        <h2>Generate Game Level</h2>

        <section className="admin__generate--form">
          <div>
            <label htmlFor="x">Width [x]</label>
            <input 
              name="x" 
              type="text" 
              placeholder="Enter Width"
              onChange={(e) => handleInputChange(e)} 
              value={level.x} 
            />
          </div>
          <div>
            <label htmlFor="y">Height [y]</label>
            <input 
              name="y" 
              type="text" 
              placeholder="Enter Height" 
              onChange={(e) => handleInputChange(e)}
              value={level.y} 
            />
          </div>
          <div>
            <label htmlFor="zoomSize">Zoom [pixel size]</label>
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
          <button onClick={generateMap}>Generate Map</button>
          <button onClick={generateJson}>Save Level [Output Json]</button>
          <button onClick={() => {console.log("load level - json")}}>Load Level [Input Json]</button>
        </section>

        <section className="admin__map--preview">
          <div className="panel">
            <h3>Edit Options </h3>

            <div style={{padding: '10px'}}>
              <button 
                className={'reset' === tileSelected ? "current-image-button" : "image-button"}
                onClick={() => handleTileButtonClick('reset')}>
                  <div style={{border: '3px solid #fff', height: '26px', width: '26px'}}></div>
                  clear cell
              </button>
              {levelDetails.dungeonTileKey.map((tile, i) => {
                return (
                  tile.detail &&
                  <button 
                    key={i} 
                    className={tile.id === tileSelected ? "current-image-button" : "image-button"}
                    onClick={() => handleTileButtonClick(tile.id)}
                  >
                    <div style={{
                      backgroundImage: `url(${dungeonTilesSheet})`,
                      backgroundPosition: `-${tile.x}px -${tile.y}px`,
                      height: '32px',
                      width: '32px',
                    }}></div>
                    {tile.detail}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel">
            <h3>Map: </h3>
            <div>Selected: {`[x:${current.x}, y:${current.y}]`}</div>
            <div id="map" style={{
              margin: '30px', 
              height: `${level.zoomSize * pixelsPerTile * level.y}px`,
              width: `${level.zoomSize * pixelsPerTile * level.x}px`,
              display: 'grid', 
              gridTemplateColumns: `repeat(${level.x}, ${pixelsPerTile * level.zoomSize}px)`,
            }}>
              {Tiles}
            </div>
            <div>{outputJson}</div>
          </div>
        </section>
      </section>
    </div>
  );
}