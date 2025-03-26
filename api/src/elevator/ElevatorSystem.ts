import { Direction, directions, ElevatorState, elevatorStates } from './types';
import Elevator from './Elevator';
import SharedRequests from './SharedRequests';

type DirectionKey = 'up' | 'down';

class ElevatorSystem {
  private elevators: Elevator[];
  private maxFloor: number;
  private sharedRequests: SharedRequests;
  private isRunning: boolean = false;

  constructor(numElevators: number = 5, maxFloor: number = 5) {
    // init elevators
    this.elevators = [];
    for (let i = 0; i < numElevators; i++) {
      this.elevators.push(new Elevator(i, maxFloor));
    }

    this.maxFloor = maxFloor;
    this.sharedRequests = SharedRequests.getInstance(maxFloor);
  }

  public async requestElevator(floor: number, direction: Direction): Promise<void> {
    if (floor < 0 || floor > this.maxFloor) {
      throw new Error(`Invalid floor number: ${floor}`);
    }

    const directionKey: DirectionKey = direction.toLowerCase() as DirectionKey;

    await this.sharedRequests.withLock(() => {
      // Skip if the request is already registered
      if (this.sharedRequests.externalRequests[floor][directionKey]) return;

      // Set request status
      this.sharedRequests.externalRequests[floor][directionKey] = true;

      // Reset assignment status
      this.sharedRequests.assignedRequests[floor][directionKey] = null;

      // Try to assign an elevator to the request
      this.assignElevator(floor, direction);
    });
  }

  public selectFloor(elevatorId: number, targetFloor: number): void {
    if (elevatorId < 0 || elevatorId >= this.elevators.length) {
      throw new Error(`Invalid elevator ID: ${elevatorId}`);
    }

    this.elevators[elevatorId].addTargetFloor(targetFloor);
  }

  // Assign an elevator to the request
  // This function should be called with lock
  private async assignElevator(floor: number, direction: Direction): Promise<void> {
    const directionKey = direction.toLowerCase() as 'up' | 'down';
    // Skip if the request is already assigned
    if (this.sharedRequests.assignedRequests[floor][directionKey] !== null) {
      return;
    }

    let bestElevator: number | null = null;
    let shortestDistance: number = Infinity;
    let elevatorState: ElevatorState | null = null;

    this.elevators.forEach((elevator, id) => {
      // Check if the elevator is eligible to handle the request
      // Check if the elevator is eligible to handle the request
      // 1. Idle elevator is eligible
      // 2. Elevator is eligible if the request is up and the elevator is moving up
      // 3. Elevator is eligible if the request is down at the top floor and the elevator is moving up
      // 4. Elevator is eligible if the request is down and the elevator is moving down
      // 5. Elevator is eligible if the request is up at the bottom floor and the elevator is moving down
      // 6. All of those elevators should not already have a external target for this floor

      const haveExternalTarget = elevator.targetFloors.some(
        target => target.floor === floor && target.direction
      );

      const stoppingAtCurrentFloor = elevator.currentFloor === floor && elevator.willStop;

      const isEligible =
        !haveExternalTarget &&
        !stoppingAtCurrentFloor &&
        (elevator.state === elevatorStates.IDLE ||
          (elevator.state === elevatorStates.MOVING_UP &&
            direction === directions.UP &&
            elevator.currentFloor < floor) ||
          (elevator.state === elevatorStates.MOVING_UP &&
            direction === directions.DOWN &&
            floor === this.maxFloor) ||
          (elevator.state === elevatorStates.MOVING_DOWN &&
            direction === directions.DOWN &&
            elevator.currentFloor > floor) ||
          (elevator.state === elevatorStates.MOVING_DOWN &&
            direction === directions.UP &&
            floor === 0));

      if (isEligible) {
        const distance = elevator.calculateDistance(floor);
        // Shorttest distance is priority, if the distance is the same, choose the idle elevator
        if (
          distance === shortestDistance &&
          elevator.state === elevatorStates.IDLE &&
          elevatorState !== elevatorStates.IDLE
        ) {
          bestElevator = id;
          elevatorState = elevator.state;
        }
        if (distance < shortestDistance) {
          shortestDistance = distance;
          bestElevator = id;
          elevatorState = elevator.state;
        }
      }
    });

    if (bestElevator !== null) {
      this.elevators[bestElevator].addTargetFloor(floor, direction);
      this.sharedRequests.assignedRequests[floor][directionKey] = bestElevator;
    }
  }

  public async tick(): Promise<void> {
    await this.sharedRequests.withLock(() => {
      // Handle unassigned requests
      for (let floor = 0; floor <= this.maxFloor; floor++) {
        if (
          this.sharedRequests.externalRequests[floor].up &&
          this.sharedRequests.assignedRequests[floor].up === null
        ) {
          this.assignElevator(floor, directions.UP);
        }
        if (
          this.sharedRequests.externalRequests[floor].down &&
          this.sharedRequests.assignedRequests[floor].down === null
        ) {
          this.assignElevator(floor, directions.DOWN);
        }
      }
    });
  }

  public getElevators(): Elevator[] {
    return this.elevators;
  }

  public getSharedRequests(): SharedRequests {
    return this.sharedRequests;
  }

  public async init(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start periodic tick
    const tickInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(tickInterval);
        return;
      }
      await this.tick();
    }, 500); // Run tick every 0.5 seconds

    // Start all elevators concurrently
    this.elevators.forEach(elevator => {
      // Use setTimeout to ensure each elevator runs in its own "thread"
      setTimeout(() => {
        if (!this.isRunning) {
          return;
        }
        elevator.operate().catch(error => {
          console.error(`Error in elevator ${elevator.id} operation:`, error);
        });
      }, 0);
    });
  }

  public reset(): void {
    // Reset all elevators to initial state
    this.elevators.forEach(elevator => {
      elevator.currentFloor = 0;
      elevator.state = elevatorStates.IDLE;
      elevator.targetFloors = [];
      elevator.willStop = false;
      elevator.isOpeningDoor = false;
    });

    // Reset shared requests
    this.sharedRequests.reset();
  }
}

export default ElevatorSystem;
