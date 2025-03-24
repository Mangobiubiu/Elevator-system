import React from 'react';
import ElevatorCar from './ElevatorCar.tsx';
import { Elevator } from '../types/elevator';

interface ElevatorShaftProps {
  elevator: Elevator;
  totalFloors: number;
}

const ElevatorShaft: React.FC<ElevatorShaftProps> = ({ elevator, totalFloors }) => {
  // Floor Height (px)
  const FLOOR_HEIGHT = 128;

  // Calculate Elevator Vertical Position (distance to the top)
  const elevatorPosition = (totalFloors - 1 - elevator.currentFloor) * FLOOR_HEIGHT;

  return (
    <div className="elevator-shaft w-1/5 relative h-full">
      <div className="relative h-full">
        {/* Floor Divider */}
        {Array.from({ length: totalFloors }).map((_, i) => (
          <div key={i} className="floor-divider" />
        ))}

        {/* Elevator Car */}
        <ElevatorCar elevator={elevator} position={elevatorPosition} />
      </div>
    </div>
  );
};

export default ElevatorShaft;
