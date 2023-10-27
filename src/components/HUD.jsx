import React from 'react';

import hudIcons from '../assets/images/HUD-icons-spritesheet.png';
import './HUD.scss';

export const HUD = ({
  health = {current: 1, total: 1}, 
  magic= {current: 1, total: 1},
  scale = 1,
  dimension = 32
}) => {
  return (
    <section className="hud">
      <div className="hud__health" style={{display: 'grid', gridTemplateColumns: `100px repeat(10, ${scale * dimension}px)` }}>
        <h3>HEALTH</h3>
        {Array.from({length: health.total}).map((_, i) => {
          let x = i < health.current ? 0 : 2;
          return <HudIcon key={`health-${i}`} scale={scale} x={x} y={0} dimension={dimension} />
        })}
      </div>

      {/* <div className="hud__magic">
        <h3>MAGIC</h3>
        {Array.from({length: magic.total}).map((_, i) => {
          let x = i < magic.current ? 3 : 5;
          return <HudIcon key={`magic-${i}`} scale={scale} x={x} y={0} dimension={dimension} />
        })}
      </div> */}
    </section>
  ) 
};

export const HudIcon = ({
  scale = 1, 
  x = 0, 
  y = 0, 
  dimension
}) => {
  const xPosition = x * dimension * scale;
  const yPosition = y * dimension * scale;
  return (
    <div style={{ backgroundImage: `url(${hudIcons})`,
      backgroundPosition: `-${xPosition}px -${yPosition}px`,
      backgroundSize: 'cover',
      height: `${dimension * scale}px`, 
      width: `${dimension * scale}px`,}} 
    />
  )
}