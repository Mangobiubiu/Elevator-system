import React from 'react';
import FloorButton from './FloorButton';
import { directions } from '../types/elevator';
import { useElevator } from '../contexts/ElevatorContext';

interface FloorProps {
  floor: number;
}

const Floor: React.FC<FloorProps> = ({ floor }) => {
  const { state, callElevator } = useElevator();

  // Check if there is an elevator stopping at this floor
  const isElevatorStopping = state.elevators.some(
    elevator => elevator.currentFloor === floor && elevator.isOpeningDoor
  );

  const handleCallUp = () => {
    callElevator(floor, directions.UP);
  };

  const handleCallDown = () => {
    callElevator(floor, directions.DOWN);
  };

  const isUpPressed = state.externalRequests[floor].up;
  const isDownPressed = state.externalRequests[floor].down;

  return (
    <div className="floor flex items-center">
      <div className="w-12 text-center font-bold">{floor}</div>
      <div className="w-full flex items-center justify-evenly">
        <div className="flex flex-col gap-2">
          {floor < 5 && (
            <FloorButton
              direction={directions.UP}
              isActivated={isUpPressed}
              onClick={handleCallUp}
            />
          )}

          {floor > 0 && (
            <FloorButton
              direction={directions.DOWN}
              isActivated={isDownPressed}
              onClick={handleCallDown}
            />
          )}
        </div>

        <div
          className={`w-4 h-4 rounded-full transition-colors duration-300 ${
            isElevatorStopping ? 'bg-yellow-400' : 'bg-gray-300'
          }`}
        />
      </div>
    </div>
  );
};

export default Floor;
