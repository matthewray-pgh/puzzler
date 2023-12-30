import React from 'react';
import { Link } from 'react-router-dom';

import './Header.scss';

export const Header = ({title, menuOptions}) => {

  const menuStyle = {
    'display': 'grid',
    'gridTemplateColumns': `2fr repeat(${menuOptions.length}, 1fr)`,
    'alignItems': 'center'
  };

  return (
    <div className="header" style={menuStyle}>
      <div className="header__title">{title}</div>
      {menuOptions.map((options, index) => {
        return <Link key={`${index}-${options.label}`} to={options.link}>{options.label}</Link>
        }
      )}
    </div>
  );
}