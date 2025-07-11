import React, { useState } from 'react';

const ToggleButton = ({ initial = false, onToggle }) => {
  const [isOn, setIsOn] = useState(initial);

  const toggle = () => {
    setIsOn(!isOn);
    if (onToggle) {
      onToggle(!isOn);
    }
  };

  return (
    <button onClick={toggle} style={{ padding: '10px 20px', fontSize: '16px' }}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
};

export default ToggleButton;
