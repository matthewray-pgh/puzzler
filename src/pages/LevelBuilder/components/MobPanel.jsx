import React from 'react';

import '../LevelBuilder.scss';

import mobDetails from '../../../assets/mobs.json';
import ghoulSheet from "../../../assets/images/ghoul-master.png"

export const MobPanel = ({
  mobSelected,
  handleMobButtonClick
}) => {
  const mobSpriteSheet = (spriteSheetFileName) => {
    switch(spriteSheetFileName){
      case 'ghoul-master.png':
        return ghoulSheet;
      default:
        return null;
    }
  };

  return (
    <div className="panel">
      <h3>MOBS</h3>

      {mobDetails.mobs.map(mob => (
        <MobButton
          key={mob.id}
          mob={mob}
          mobSpriteSheet={mobSpriteSheet(mob.spriteSheet)}
          handleClick={handleMobButtonClick}
          mobSelected={mobSelected}
        />
      ))}
    </div>
  );
};

const MobButton = ({
  mob, 
  mobSpriteSheet, 
  handleClick, 
  mobSelected=null
}) => {
  
  return (
    <button className={`admin__tile-button ${mob.id === mobSelected ? "admin__tile-button--selected" : null}`} 
      onClick={() => handleClick(mob.id)}>
      <div style={{
        backgroundImage: `url(${mobSpriteSheet})`,
        backgroundPosition: `-${mob.x}px -${mob.y}px`,
        height: '32px',
        width: '32px',
      }}></div>
      {mob.name}
    </button>
  );
};