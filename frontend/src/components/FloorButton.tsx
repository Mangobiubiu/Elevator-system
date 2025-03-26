import { Direction, directions } from '@/types/elevator';
import React from 'react';

interface FloorButtonProps {
  direction: Direction;
  isActivated?: boolean;
  onClick: () => void;
}

const FloorButton: React.FC<FloorButtonProps> = ({ direction, isActivated = false, onClick }) => {
  const buttonClasses = `
    floor-button
    ${direction === directions.UP ? 'floor-button-up' : 'floor-button-down'}
    ${isActivated ? 'floor-button-active' : ''}
  `;

  const handleClick = () => {
    onClick();
  };

  return (
    <button className={buttonClasses} onClick={handleClick}>
      {direction === directions.UP ? '▲' : '▼'}
    </button>
  );
};

export default FloorButton;
