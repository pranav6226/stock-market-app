import React from 'react';
import { Spin } from 'antd';

const Spinner = ({ size = 'large', tip = 'Loading...' }) => {
  return <Spin size={size} tip={tip} />;
};

export default Spinner;
