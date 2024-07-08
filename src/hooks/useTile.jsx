import { useCallback } from 'react';

export const useTile = (tileDetails) => {

  const tileLookUpById = useCallback((id) => {
    return tileDetails.tileKey.find((x) => x.id === id);
  },[tileDetails]);

  const tileLookUpByCoordinates = useCallback((x, y, levelTiles) => {
    return levelTiles.find((tiles) => tiles.x === x && tiles.y === y);
  },[]);

  const baseLookUpByCoordinates = useCallback((x, y, baseMap) => {
    return baseMap.find((tiles) => tiles.x === x && tiles.y === y && tiles.layer === "base");
  }, []);
  
  return { 
    tileLookUpById, 
    tileLookUpByCoordinates, 
    baseLookUpByCoordinates, 
  }
}