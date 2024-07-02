import React from 'react';
import PropTypes from 'prop-types';

const History = ({ history }) => {
  return (
    <div className="history">
      <h2>History</h2>
      <ul>
        {history.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

History.propTypes = {
  history: PropTypes.array.isRequired,
};

export default History;
