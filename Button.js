import React from 'react';


const Button = ({ label, handleClick, className }) => {
  return (
    <div className={`button ${className}`} onClick={() => handleClick(label)}>
      <button>{label}</button>
    </div>
  );
};

export default Button;
