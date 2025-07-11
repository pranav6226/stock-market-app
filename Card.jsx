import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ title }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Card;
