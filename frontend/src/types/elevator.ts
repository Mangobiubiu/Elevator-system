export const elevatorStates = {
  MOVING_UP: 'MOVING_UP',
  MOVING_DOWN: 'MOVING_DOWN',
  IDLE: 'IDLE'
} as const;
export type ElevatorState = typeof elevatorStates[keyof typeof elevatorStates];

export const directions = {
  UP: 'up',
  DOWN: 'down'
} as const;
export type Direction = typeof directions[keyof typeof directions];

export interface Elevator {
  id: number;
  currentFloor: number;
  state: ElevatorState;
  targetFloors: number[];
  isOpeningDoor: boolean;
}

export interface ExternalRequests {
  [floor: number]: {
    up: boolean;
    down: boolean;
  };
}
