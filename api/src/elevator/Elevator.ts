import { elevatorStates, ElevatorState, Direction, TargetFloor, directions } from './types';
import SharedRequests from './SharedRequests';

class Elevator {
  constructor(
    public readonly id: number,
    private maxFloor: number = 5,
    private moveSpeed: number = 2, // Simulate 2s to move to the next floor
    private stopTime: number = 4 // Simulate 4s to stop at the floor, then move to the next state
  ) {
    this.currentFloor = 0;
    this.state = elevatorStates.IDLE;
    this.targetFloors = []; // Will never include both up and down for the same floor
    this.sharedRequests = SharedRequests.getInstance();
  }

  public currentFloor: number;
  public state: ElevatorState;
  public targetFloors: TargetFloor[];
  public willStop: boolean = false; // Elevator will stop at
  public isOpeningDoor: boolean = false; // Elevator is opening the door
  private sharedRequests: SharedRequests;

  private isTargetReachable(target: TargetFloor): boolean {
    return target.floor === this.currentFloor && !target.direction;
  }

  public addTargetFloor(floor: number, direction: Direction | null = null): void {
    if (floor < 0 || floor > this.maxFloor) {
      throw new Error(`Invalid floor number: ${floor}`);
    }

    if (
      !this.targetFloors.some(
        (target: TargetFloor) => target.floor === floor && target.direction === direction
      )
    ) {
      console.log(
        `📋 Elevator ${this.id} added target floor: ${floor}${direction ? ` (${direction})` : ''}`
      );
      this.targetFloors.push({ floor, direction });
    }
  }

  private updateState(): void {
    const nextTarget = this.getNextTargetFloor(this.targetFloors);

    if (!nextTarget) {
      this.state = elevatorStates.IDLE;
      return;
    }

    // If the next target is the current floor and is the only target, the elevator will idle
    if (nextTarget.floor === this.currentFloor && this.targetFloors.length === 1) {
      this.state = elevatorStates.IDLE;
      return;
    }

    if (nextTarget.floor > this.currentFloor) {
      this.state = elevatorStates.MOVING_UP;
    }
    if (nextTarget.floor < this.currentFloor) {
      this.state = elevatorStates.MOVING_DOWN;
    }
  }

  private getNextTargetFloor(targetFloors: TargetFloor[]): TargetFloor | null {
    if (targetFloors.length === 0) return null;

    if (this.state === elevatorStates.MOVING_UP) {
      // First handle floors above current floor in the same direction
      const upwardTargets = targetFloors.filter(
        target =>
          target.floor >= this.currentFloor &&
          (!target.direction || target.direction === directions.UP)
      );
      if (upwardTargets.length > 0) {
        return upwardTargets.reduce((prev, curr) => (prev.floor < curr.floor ? prev : curr));
      }
    }

    if (this.state === elevatorStates.MOVING_DOWN) {
      // First handle floors below current floor in the same direction
      const downwardTargets = targetFloors.filter(
        target =>
          target.floor <= this.currentFloor &&
          (!target.direction || target.direction === directions.DOWN)
      );
      if (downwardTargets.length > 0) {
        return downwardTargets.reduce((prev, curr) => (prev.floor > curr.floor ? prev : curr));
      }
    }

    return targetFloors[0];
  }

  public calculateDistance(floor: number): number {
    if (this.state === elevatorStates.IDLE) {
      return Math.abs(this.currentFloor - floor);
    }

    if (this.state === elevatorStates.MOVING_UP) {
      if (floor >= this.currentFloor) {
        return floor - this.currentFloor;
      }
      // Need to go to the highest target floor first, then return
      const maxTarget = Math.max(...this.targetFloors.map(t => t.floor));
      return maxTarget - this.currentFloor + (maxTarget - floor);
    } else {
      if (floor <= this.currentFloor) {
        return this.currentFloor - floor;
      }
      // Need to go to the lowest target floor first, then return
      const minTarget = Math.min(...this.targetFloors.map(t => t.floor));
      return this.currentFloor - minTarget + (floor - minTarget);
    }
  }

  private clearExternalRequest(floor: number, direction: Direction): void {
    this.sharedRequests.externalRequests[floor][direction] = false;
    this.sharedRequests.assignedRequests[floor][direction] = null;
  }

  private removeExternalTargetFloor(
    floor: number,
    direction: Direction,
    targetFloors: TargetFloor[]
  ): TargetFloor[] {
    return targetFloors.filter(target => target.floor !== floor || target.direction !== direction);
  }

  private clearFloorRequest(floor: number, direction: Direction): void {
    this.clearExternalRequest(floor, direction);
    this.targetFloors = this.removeExternalTargetFloor(floor, direction, this.targetFloors);
    this.willStop = true;
  }

  // Check if elevator is passing by the floor and the request is at the current floor
  private handleElevatorPassingBy(
    elevatorState: ElevatorState,
    currentFloor: number,
    targetFloors: TargetFloor[]
  ): void {
    if (
      elevatorState !== elevatorStates.MOVING_UP &&
      elevatorState !== elevatorStates.MOVING_DOWN
    ) {
      return;
    }

    const direction = elevatorState === elevatorStates.MOVING_UP ? directions.UP : directions.DOWN;

    const isRequestAtCurrentFloor = this.sharedRequests.externalRequests[currentFloor][direction];
    if (!isRequestAtCurrentFloor) return;
    const newTargetFloors = this.removeExternalTargetFloor(currentFloor, direction, targetFloors);
    const nextTargetAfterCurrentOne = this.getNextTargetFloor(newTargetFloors);

    if (!nextTargetAfterCurrentOne) return;

    if (direction === directions.UP && nextTargetAfterCurrentOne.floor > currentFloor) {
      this.clearFloorRequest(currentFloor, direction);
    }
    if (direction === directions.DOWN && nextTargetAfterCurrentOne.floor < currentFloor) {
      this.clearFloorRequest(currentFloor, direction);
    }
  }

  private handleReverseAtBoundary(
    elevatorState: ElevatorState,
    currentFloor: number,
    targetFloors: TargetFloor[]
  ): void {
    const externalRequestTarget = targetFloors.find(
      target => target.floor === currentFloor && target.direction
    );
    if (!externalRequestTarget) return;
    const direction = externalRequestTarget?.direction as Direction;

    const newTargetFloors = this.removeExternalTargetFloor(currentFloor, direction, targetFloors);
    const nextTargetAfterCurrentOne = this.getNextTargetFloor(newTargetFloors);

    if (!nextTargetAfterCurrentOne) return;

    // Moving up to the target boundary and there is a request to go down
    if (elevatorState === elevatorStates.MOVING_UP) {
      if (nextTargetAfterCurrentOne.floor < currentFloor) {
        this.clearFloorRequest(currentFloor, direction);
      }
    }

    // Moving down to the target boundary and there is a request to go up
    if (elevatorState === elevatorStates.MOVING_DOWN) {
      if (nextTargetAfterCurrentOne.floor > currentFloor) {
        this.clearFloorRequest(this.currentFloor, direction);
      }
    }
  }

  private handleLastTargetFloor(currentFloor: number, targetFloors: TargetFloor[]): void {
    if (
      targetFloors.length === 1 &&
      targetFloors[0].floor === currentFloor &&
      targetFloors[0].direction
    ) {
      this.clearFloorRequest(currentFloor, targetFloors[0].direction);
    }
  }

  // private handle;

  // Move elevator to the next floor
  public async move(): Promise<void> {
    this.updateState();
    // Simulate 1s to lift to the next floor if no one press the button at current floor
    if (this.state === elevatorStates.MOVING_UP) {
      console.log(`🔼 Elevator ${this.id} starting to move up from floor ${this.currentFloor}`);
      await new Promise(resolve => setTimeout(resolve, this.moveSpeed * 1000));
      this.currentFloor++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate the time to slow down and stop
      console.log(
        `⬆️ Elevator ${this.id} completed upward movement, arriving at floor ${this.currentFloor}`
      );
    }
    if (this.state === elevatorStates.MOVING_DOWN) {
      console.log(`🔽 Elevator ${this.id} starting to move down from floor ${this.currentFloor}`);
      await new Promise(resolve => setTimeout(resolve, this.moveSpeed * 1000));
      this.currentFloor--;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate the time to slow down and stop
      console.log(
        `⬇️ Elevator ${this.id} completed downward movement, arriving at floor ${this.currentFloor}`
      );
    }

    // Make decision to answer which external request
    await this.sharedRequests.withLock(async () => {
      // Check for requests at current floor when pass by
      this.handleElevatorPassingBy(this.state, this.currentFloor, this.targetFloors);

      // Handle reverse direction at boundary
      this.handleReverseAtBoundary(this.state, this.currentFloor, this.targetFloors);

      // This floor is the last target floor
      this.handleLastTargetFloor(this.currentFloor, this.targetFloors);

      // Handle target floors selected inside elevator
      const currentTargetIndex = this.targetFloors.findIndex(target =>
        this.isTargetReachable(target)
      );

      if (currentTargetIndex !== -1) {
        console.log(`🎯 Elevator ${this.id} reached target floor ${this.currentFloor}`);
        this.willStop = true;

        // Remove all reached targets
        this.targetFloors.splice(currentTargetIndex, 1);
      }
    });

    // Open and close the elevator door
    if (this.willStop) {
      this.isOpeningDoor = true;
      console.log(`🚪 Elevator ${this.id} opening doors at floor ${this.currentFloor}`);
      await new Promise(resolve => setTimeout(resolve, this.stopTime * 1000));
      this.isOpeningDoor = false;
      console.log(`🚪 Elevator ${this.id} closing doors at floor ${this.currentFloor}`);
      this.willStop = false;
    }
  }

  // Start elevator operation
  public async operate(): Promise<void> {
    while (true) {
      if (this.state === elevatorStates.IDLE && this.targetFloors.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to prevent CPU overuse
      } else {
        await this.move();
      }
    }
  }
}

export default Elevator;
