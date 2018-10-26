import React from 'react';
import Tilt from 'react-tilt';
import './Logo.css';
import brain from './brain.png';


const Logo = () => {
  return (
    <div className='ma4 mt0'>
      <Tilt className="Tilt br2 shadow-2" options={{ max : 50 }} style={{ height: 100, width: 100 }} >
        <div className="Tilt-inner pa3"> 
          <img style={{paddingTop: '3px'}} src={brain} alt="logo"/> 
        </div>
      </Tilt>
    </div>
  );
}

export default Logo;