import React, { useEffect, useState } from 'react';
import ElevatorControlPanel from './ElevatorControlPanel';
import { Elevator as ElevatorType, ElevatorState, elevatorStates } from '../types/elevator';

interface ElevatorCarProps {
  elevator: ElevatorType;
  position: number;
}

const ElevatorCar: React.FC<ElevatorCarProps> = ({ elevator, position }) => {
  const [doorsOpen, setDoorsOpen] = useState(false);

  // Listen to the changes of isOpeningDoor to control elevator doors
  useEffect(() => {
    if (elevator.isOpeningDoor) {
      setDoorsOpen(true);
    } else {
      setDoorsOpen(false);
    }
  }, [elevator.isOpeningDoor]);

  const getStateColor = (state: ElevatorState) => {
    switch (state) {
      case elevatorStates.MOVING_UP:
        return 'text-green-500';
      case elevatorStates.MOVING_DOWN:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStateIcon = (state: ElevatorState) => {
    switch (state) {
      case elevatorStates.MOVING_UP:
        return '↑';
      case elevatorStates.MOVING_DOWN:
        return '↓';
      default:
        return '•';
    }
  };

  return (
    <div
      className="elevator w-full"
      style={{
        transform: `translateY(${position}px)`,
        transition: 'transform 1s ease-in-out',
        top: '0',
      }}
    >
      <div className="elevator-display h-1/4 flex justify-center items-center gap-4">
        <div className="text-lg font-bold w-[10px]">{elevator.currentFloor}</div>
        <div className={`${getStateColor(elevator.state)} w-[10px]`}>
          {getStateIcon(elevator.state)}
        </div>
      </div>

      <div className="elevator-body relative h-3/4 flex items-center justify-center">
        {/* Elevator doors - positioned behind the panel */}
        <div className="absolute inset-0 h-full flex justify-between">
          <div
            className="elevator-door"
            style={{
              width: doorsOpen ? '0%' : '50%',
              transition: 'width 0.5s ease-in-out',
            }}
          />
          <div
            className="elevator-door"
            style={{
              width: doorsOpen ? '0%' : '50%',
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </div>

        {/* Control Panel - positioned in front of the doors */}
        <div className="relative z-10 w-full">
          <ElevatorControlPanel
            elevatorId={elevator.id}
            currentFloor={elevator.currentFloor}
            targetFloors={elevator.targetFloors}
          />
        </div>
      </div>
    </div>
  );
};

export default ElevatorCar;
