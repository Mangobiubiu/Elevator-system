import React from 'react';
import { useElevator } from '../contexts/ElevatorContext';

const ResetButton: React.FC = () => {
  const { reset } = useElevator();

  return (
    <button
      onClick={() => reset()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
    >
      Reset System
    </button>
  );
};

export default ResetButton;
