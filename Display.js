import React from 'react';
import PropTypes from 'prop-types';

const Display = ({ input, result, error }) => {
  return (
    <div className="display">
      {error && <div className="error">{error}</div>}
      <div className="input">{input}</div>
      <div className="result">{result}</div>
    </div>
  );
};

Display.propTypes = {
  input: PropTypes.string.isRequired,
  result: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export default Display;
