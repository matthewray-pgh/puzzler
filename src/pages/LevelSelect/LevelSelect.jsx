import React from 'react';
import './LevelSelect.scss';

import { Link } from 'react-router-dom';
import { Header } from '../../components/Header.jsx';

export const LevelSelect = () => {

  const levels = [
    {id: 1, image: null, file: 'levelOne'}, 
    {id: 2, image: null, file: 'levelTwo'},
    {id: 3, image: null, file: 'levelThree'},
  ];

  return (
    <div className="level-select">
      <Header 
        title="Level Select"
        menuOptions={[
          { label:"Game Stats", link:"/stats" },
          { label:"Level Builder", link:"/levelBuilder" }
        ]}
      />
      <section className="level-select__levels"> 
        {levels.map((level) => {
          return (
            <Link to={`/game/${level.file}`} className="level-select__level" key={`${level.id}-${level.file}`}>
            <div className="level-select__level-image">
                <img src={level.image} alt={`Level ${level.id}`} />
              </div>
              <div className="level-select__level-label">
                LEVEL {level.id}
              </div>
            </Link>
          );
        }
        )}
      </section>
    </div>
  );
}