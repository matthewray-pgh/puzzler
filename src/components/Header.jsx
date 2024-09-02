import React from 'react';
import { Link } from 'react-router-dom';

import './Header.scss';

export const Header = ({title}) => {

  return (
    <div className="header">
      <div className="header__title">{title}</div>
      <div className="header__exit-link">
        <Link to="/">Exit</Link>
      </div>
    </div>
  );
}