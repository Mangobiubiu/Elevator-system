import { ElevatorState, Direction, TargetFloor } from './types';
import SharedRequests from './SharedRequests';

class Elevator {
    constructor(
        public readonly id: number,
        private maxFloor: number = 5,
        private moveSpeed: number = 2, // Simulate 2s to move to the next floor
        private stopTime: number = 4, // Simulate 4s to stop at the floor, then move to the next state
    ) {
        this.currentFloor = 0;
        this.state = ElevatorState.IDLE;
        this.targetFloors = [];
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

        if (!this.targetFloors.some((target: TargetFloor) => target.floor === floor && target.direction === direction)) {
            console.log(`📋 Elevator ${this.id} added target floor: ${floor}${direction ? ` (${direction})` : ''}`);
            this.targetFloors.push({ floor, direction });
        }
    }

    private updateState(): void {
        const nextTarget = this.getNextTargetFloor();

        if (!nextTarget) {
            this.state = ElevatorState.IDLE;
            return;
        }

        console.log('nextTarget', nextTarget.floor, this.currentFloor);
        if (nextTarget.floor > this.currentFloor) {
            this.state = ElevatorState.MOVING_UP;
        } 
        if (nextTarget.floor < this.currentFloor) {
            this.state = ElevatorState.MOVING_DOWN;
        }
    }

    private getNextTargetFloor(): TargetFloor | null {
        if (this.targetFloors.length === 0) return null;

        if (this.state === ElevatorState.MOVING_UP) {
            // First handle floors above current floor in the same direction
            const upwardTargets = this.targetFloors.filter(
                target => target.floor >= this.currentFloor && 
                (!target.direction || target.direction === Direction.UP)
            );
            if (upwardTargets.length > 0) {
                return upwardTargets.reduce((prev, curr) => 
                    prev.floor < curr.floor ? prev : curr
                );
            }
        }

        if (this.state === ElevatorState.MOVING_DOWN) {
            // First handle floors below current floor in the same direction
            const downwardTargets = this.targetFloors.filter(
                target => target.floor <= this.currentFloor && 
                (!target.direction || target.direction === Direction.DOWN)
            );
            if (downwardTargets.length > 0) {
                return downwardTargets.reduce((prev, curr) => 
                    prev.floor > curr.floor ? prev : curr
                );
            }
        }

        return this.targetFloors[0];
    }

    public calculateDistance(floor: number): number {
        if (this.state === ElevatorState.IDLE) {
            return Math.abs(this.currentFloor - floor);
        }

        if (this.state === ElevatorState.MOVING_UP) {
            if (floor >= this.currentFloor) {
                return floor - this.currentFloor;
            }
            // Need to go to the highest target floor first, then return
            const maxTarget = Math.max(...this.targetFloors.map(t => t.floor));
            return (maxTarget - this.currentFloor) + (maxTarget - floor);
        } else {
            if (floor <= this.currentFloor) {
                return this.currentFloor - floor;
            }
            // Need to go to the lowest target floor first, then return
            const minTarget = Math.min(...this.targetFloors.map(t => t.floor));
            return (this.currentFloor - minTarget) + (floor - minTarget);
        }
    }


    private clearExternalRequest(floor: number, direction: 'up' | 'down'): void {
        this.sharedRequests.externalRequests[floor][direction] = false;
        this.sharedRequests.assignedRequests[floor][direction] = null;
    }

    private removeExternalTargetFloor(floor: number, direction: Direction): void {
        this.targetFloors = this.targetFloors.filter(
            target => target.floor !== floor || target.direction !== direction
        );
    }

    private clearFloorRequest(floor: number, direction: 'up' | 'down'): void {
        this.clearExternalRequest(floor, direction);
        this.removeExternalTargetFloor(floor, Direction[direction.toUpperCase() as 'UP' | 'DOWN']);
        this.willStop = true;
    }

    // Move elevator to the next floor
    public async move(): Promise<void> {
        this.updateState();
        console.log('elevator state', this.state);
        // Simulate 1s to lift to the next floor if no one press the button at current floor
        if (this.state === ElevatorState.MOVING_UP) {
            console.log(`🔼 Elevator ${this.id} starting to move up from floor ${this.currentFloor}`);
            await new Promise(resolve => setTimeout(resolve, this.moveSpeed * 1000));
            this.currentFloor++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`⬆️ Elevator ${this.id} completed upward movement, arriving at floor ${this.currentFloor}`);
        } 
        if (this.state === ElevatorState.MOVING_DOWN) {
            console.log(`🔽 Elevator ${this.id} starting to move down from floor ${this.currentFloor}`);
            await new Promise(resolve => setTimeout(resolve, this.moveSpeed * 1000));
            this.currentFloor--;
            console.log(`⬇️ Elevator ${this.id} completed downward movement, arriving at floor ${this.currentFloor}`);
        }

        // Make decision to answer which external request
        await this.sharedRequests.withLock(async () => {            
            // Check for requests at current floor when pass by
            if (this.state === ElevatorState.MOVING_UP && 
                this.sharedRequests.externalRequests[this.currentFloor].up 
            ) {
                console.log(`🛑 Elevator ${this.id} stopping at floor ${this.currentFloor} to respond to UP request`);
                this.clearFloorRequest(this.currentFloor, 'up');
            }
            else if (
                this.state === ElevatorState.MOVING_DOWN &&
                this.sharedRequests.externalRequests[this.currentFloor].down
            ) {
                console.log(`🛑 Elevator ${this.id} stopping at floor ${this.currentFloor} to respond to DOWN request`);
                this.clearFloorRequest(this.currentFloor, 'down');
            }
            // Request an elevator and there is an idle elevator at current floor
            if (this.state === ElevatorState.IDLE && this.willStop) {
                this.clearFloorRequest(this.currentFloor, 'up');
                this.clearFloorRequest(this.currentFloor, 'down');
            }

            // This floor is the last target floor
            if (this.targetFloors.length === 1 && this.targetFloors[0].floor === this.currentFloor && this.targetFloors[0].direction) {
                const directionKey = this.targetFloors[0].direction.toLowerCase() as 'up' | 'down';
                this.clearFloorRequest(this.currentFloor, directionKey);
            }

            // Handle top and bottom floor special cases
            if (this.currentFloor === this.maxFloor && this.sharedRequests.externalRequests[this.currentFloor].down) {
                this.clearFloorRequest(this.currentFloor, 'down');
            }
            if (this.currentFloor === 0 && this.sharedRequests.externalRequests[this.currentFloor].up) {
                this.clearFloorRequest(this.currentFloor, 'up');
            }

            // Handle target floors selected inside elevator
            const currentTargetIndex = this.targetFloors.findIndex(target => this.isTargetReachable(target));

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
            if (this.state === ElevatorState.IDLE && this.targetFloors.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to prevent CPU overuse
            }
            else {
                await this.move();
            }
        }
    }
}

export default Elevator;