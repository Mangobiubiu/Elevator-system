import express, { Request, RequestHandler, Response } from 'express';
import cors from 'cors';
import ElevatorSystem from './elevator/ElevatorSystem';
import { directions, Direction } from './elevator/types';

const app = express();
app.use(express.json());
app.use(cors());

// Create elevator system instance (5 elevators, 6 floors)
const system = new ElevatorSystem(5, 5);

// Initialize the system
system.init().catch(console.error);

// Handler for request elevator
const requestElevatorHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { floor, direction } = req.body;
    if (typeof floor !== 'number' || !Object.values(directions).includes(direction)) {
      res.status(400).json({ error: 'Invalid parameters' });
      return;
    }
    await system.requestElevator(floor, direction as Direction);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Handler for selecting a floor in the elevator
const selectFloorHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { elevatorId, floor } = req.body;
    if (typeof elevatorId !== 'number' || typeof floor !== 'number') {
      res.status(400).json({ error: 'Invalid parameters' });
      return;
    }
    system.selectFloor(elevatorId, floor);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// API endpoints
app.post('/api/request-elevator', requestElevatorHandler);

app.post('/api/select-floor', selectFloorHandler);

app.get('/api/status', (_req: Request, res: Response) => {
  const elevators = system.getElevators().map(elevator => ({
    id: elevator.id,
    currentFloor: elevator.currentFloor,
    state: elevator.state,
    targetFloors: elevator.targetFloors
      .filter(target => !target.direction)
      .map(target => target.floor),
    isOpeningDoor: elevator.isOpeningDoor,
  }));

  const externalRequests = system.getSharedRequests().externalRequests;
  res.json({ elevators, externalRequests });
});

// Start server
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT);
