import { useElevator } from '@/contexts/ElevatorContext';
import React from 'react';

interface ElevatorControlPanelProps {
  elevatorId: number;
  currentFloor: number;
  targetFloors: number[];
}

const ElevatorControlPanel: React.FC<ElevatorControlPanelProps> = ({
  elevatorId,
  targetFloors,
}) => {
  const TOTAL_FLOORS = 6; // 0-5

  const { selectFloor } = useElevator();

  const handleFloorSelect = (floor: number) => {
    selectFloor(elevatorId, floor);
  };

  return (
    <div className="controls-panel">
      {Array.from({ length: TOTAL_FLOORS }).map((_, i) => {
        const floor = i;
        const isTargetFloor = targetFloors.includes(floor);

        return (
          <button
            key={floor}
            className={`
              panel-button text-xs
              ${isTargetFloor ? 'bg-yellow-500 text-white' : 'bg-white hover:bg-yellow-300'}
            `}
            onClick={() => handleFloorSelect(floor)}
          >
            {floor}
          </button>
        );
      })}
    </div>
  );
};

export default ElevatorControlPanel;
