import { Direction, directions } from '@/types/elevator';
import React from 'react';

interface FloorButtonProps {
  direction: Direction;
  isActivated?: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const FloorButton: React.FC<FloorButtonProps> = ({
  direction,
  isActivated = false,
  isDisabled,
  onClick,
}) => {
  const buttonClasses = `
    floor-button
    ${direction === directions.UP ? 'floor-button-up' : 'floor-button-down'}
    ${isActivated ? 'floor-button-active' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <button className={buttonClasses} onClick={handleClick} disabled={isDisabled}>
      {direction === directions.UP ? '▲' : '▼'}
    </button>
  );
};

export default FloorButton;
