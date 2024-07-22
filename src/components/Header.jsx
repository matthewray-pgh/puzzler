import React from 'react';
import { Link } from 'react-router-dom';

import { useWindowSize } from '../hooks';
import './Header.scss';

export const Header = ({title, menuOptions}) => {

  const { isMobile } = useWindowSize();

  const menuStyle = {
    'display': 'grid',
    'gridTemplateColumns': `2fr repeat(${menuOptions.length}, 1fr)`,
    'alignItems': 'center'
  };

  return (
    <div className="header" style={menuStyle}>
      <div className="header__title">{title}</div>
      {menuOptions.map((options, index) => {
        if(isMobile && options.label !== "Level Builder") {
          return <Link key={`${index}-${options.label}`} to={options.link}>{options.label}</Link>
        }
        else {
          return null;
        }
        }
      )}
    </div>
  );
}