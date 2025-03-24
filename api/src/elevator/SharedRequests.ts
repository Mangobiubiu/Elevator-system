import { FloorRequest, FloorAssignment } from './types';

class SharedRequests {
  private static instance: SharedRequests;
  public isLocked: boolean = false;

  // To store the external requests
  // Set to true if someone is requesting an elevator
  public externalRequests: FloorRequest[];

  // To store the assigned elevators for the request
  // Set to the elevator id if an elevator is assigned to the request
  public assignedRequests: FloorAssignment[];

  private constructor(maxFloor: number) {
    this.externalRequests = [];
    this.assignedRequests = [];

    // Initialize the arrays
    for (let floor = 0; floor <= maxFloor; floor++) {
      this.externalRequests[floor] = {
        up: false,
        down: false,
      };
      this.assignedRequests[floor] = {
        up: null,
        down: null,
      };
    }
  }

  public static getInstance(maxFloor: number = 5): SharedRequests {
    if (!SharedRequests.instance) {
      SharedRequests.instance = new SharedRequests(maxFloor);
    }
    return SharedRequests.instance;
  }

  public acquireLock(): boolean {
    if (this.isLocked) {
      return false;
    }
    this.isLocked = true;
    return true;
  }

  public releaseLock(): void {
    this.isLocked = false;
  }

  public async withLock<T>(operation: () => T): Promise<T> {
    // If failed to acquire lock, wait and try again
    while (!this.acquireLock()) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    try {
      return await operation();
    } finally {
      this.releaseLock();
    }
  }
}

export default SharedRequests;
