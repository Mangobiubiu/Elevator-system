export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN'
}

export enum ElevatorState {
    MOVING_UP = 'MOVING_UP',
    MOVING_DOWN = 'MOVING_DOWN',
    IDLE = 'IDLE'
}

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
    direction: Direction | null;  // null for internal requests
}