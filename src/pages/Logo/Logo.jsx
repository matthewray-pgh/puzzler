import React from "react";

import { useWindowSize } from '../../hooks';
import { BrandLogo } from "../../assets/icon/BrandLogo";

import "./Logo.scss";

export const Logo = () => {
  const { isMobile } = useWindowSize();
  const logoDimensions = isMobile ? { width: 60, height: 50 } : { width: 100, height: 80 };
  return (
    <div className="logo">
      <div className="logo__branding">
        <span className="logo__title">lone bridge games</span>
        <BrandLogo 
          width={logoDimensions.width} 
          height={logoDimensions.height} 
        />
      </div>
    </div>
  );
}