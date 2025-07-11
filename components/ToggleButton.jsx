import React, { useState } from 'react';
import './ToggleButton.css';

const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => {
    setIsOn(!isOn);
  };

  return (
    <button
      className={isOn ? 'toggle-button-on' : 'toggle-button-off'}
      onClick={toggle}
    >
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
};

export default ToggleButton;
