import React from 'react';
import Floor from './Floor';
import ElevatorShaft from './ElevatorShaft';
import { useElevator } from '../contexts/ElevatorContext';

const TOTAL_FLOORS = 6; // 0-5
const TOTAL_ELEVATORS = 5;

const Building: React.FC = () => {
  const { state } = useElevator();
  const floors = Array.from({ length: TOTAL_FLOORS }).map((_, i) => TOTAL_FLOORS - 1 - i);

  if (state.isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="building-container">
      <div className="flex h-6">
        <div className="flex-1 bg-gray-200 py-1"></div> {/* occupied by floor */}
        <div className="flex flex-[3]">
          {Array.from({ length: TOTAL_ELEVATORS }).map((_, i) => (
            <div key={i} className="w-1/5 text-center text-xs bg-gray-200 py-1">
              #{i + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-full">
        {/* Floor Area */}
        <div className="flex-1">
          {/* Floor - Render from top to bottom */}
          {floors.map(floor => (
            <Floor key={floor} floor={floor} />
          ))}
        </div>

        {/* Elevator Area */}
        <div className="flex flex-[3] relative">
          {Array.from({ length: TOTAL_ELEVATORS }).map((_, i) => (
            <ElevatorShaft
              key={i}
              elevator={state.elevators.find(e => e.id === i)!}
              totalFloors={TOTAL_FLOORS}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Building;
