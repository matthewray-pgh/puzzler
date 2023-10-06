import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { Link } from 'react-router-dom';

import './Admin.scss';

import levelDetails from "../../assets/levelOne.json";
import dungeonTilesSheet from "../../assets/images/DungeonTiles.png";

const showCoordinates = false;

export const Admin = () => {
  const [outputJson, setOutputJson] = useState('output printed here....');
  const [level, setLevel] = useState({x: '', y: ''});
  const [backgroundTiles, setBackgroundTiles] = useState([]);
  const [current, setCurrent] = useState({x: '', y: ''});
  const [tileSelected, setTileSelected] = useState('');

  const buildMap = (x, y) => {
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
    if(tileSelected !== '') {
      const updateTileIndex = backgroundTiles.findIndex(tile => tile.x === x && tile.y === y);
      const newTileSet = [...backgroundTiles];
      newTileSet[updateTileIndex] = {x: x, y: y, id: tileSelected};;
      setBackgroundTiles(newTileSet);
    }
    setCurrent({x: x, y: y});
  },[backgroundTiles, tileSelected]);

  const generateMap = useCallback(() => {
    setBackgroundTiles(buildMap(level.x, level.y));
  }, [level]);

  const generateJson = useCallback(() => {
    const json = JSON.stringify(backgroundTiles);
    setOutputJson(json);
  }, [backgroundTiles]);

  const Tiles = useMemo(() => {
    return backgroundTiles.map((tile, i) => {
      const key = `${tile.x}-${tile.y}`;
      const tileDetail = levelDetails.dungeonTileKey.find(tileKey => tileKey.id === tile.id);
      return (
        <div 
          key={key} 
          className="tile"
          style={{
            backgroundImage: `url(${dungeonTilesSheet})`,
            backgroundPosition: `-${tileDetail.x}px -${tileDetail.y}px`,
            }}
          onClick={() => {handleTileClick(tile.x, tile.y)}}
        >
          {showCoordinates && `${tile.x},${tile.y}`}
        </div>
      )
    })
  }, [backgroundTiles, handleTileClick]);

  const handleTileButtonClick = (id) => {
    setTileSelected(id);
  }

  useEffect(() => {
    console.log('backgroundTiles', backgroundTiles);
  }, [backgroundTiles]);

  return (
    <div className="admin">
      <h1>Admin</h1>
      <Link to="/">Home</Link>

      <section className="admin__generate">
        <h2>Generate Game Level</h2>
        <section className="admin__generate--form">
          <div>
            <label htmlFor="x">Width[x]</label>
            <input 
              name="x" 
              type="text" 
              placeholder="Enter Width"
              onChange={(e) => handleInputChange(e)} 
              value={level.x} 
            />
          </div>
          <div>
            <label htmlFor="y">Height[y]</label>
            <input 
              name="y" 
              type="text" 
              placeholder="Enter Height" 
              onChange={(e) => handleInputChange(e)}
              value={level.y} 
            />
          </div>
          <button onClick={generateMap}>Generate Map</button>
          <button onClick={generateJson}>Generate Json</button>
        </section>

        <section className="admin__map--preview">
          <div className="panel">
            <h3>Edit Options </h3>

            <div style={{padding: '10px'}}>
              {levelDetails.dungeonTileKey.map((tile, i) => {
                return (
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
            <div style={{padding: '10px', display: 'grid', gridTemplateColumns: `repeat(${level.x}, 32px)`}}>
              {Tiles}
            </div>
            <div>{outputJson}</div>
          </div>
        </section>
      </section>
    </div>
  );
}