export const directions = {
  UP: 'up',
  DOWN: 'down',
} as const;
export type Direction = (typeof directions)[keyof typeof directions];

export const elevatorStates = {
  MOVING_UP: 'MOVING_UP',
  MOVING_DOWN: 'MOVING_DOWN',
  IDLE: 'IDLE',
} as const;
export type ElevatorState = (typeof elevatorStates)[keyof typeof elevatorStates];

export interface ElevatorRequest {
  floor: number;
  direction: Direction;
}

export interface FloorRequest {
  up: boolean;
  down: boolean;
}

export interface FloorAssignment {
  up: number | null;
  down: number | null;
}

export interface TargetFloor {
  floor: number;
  direction: Direction | null; // null for internal requests
}
