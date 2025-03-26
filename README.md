# Elevator System 🛗

Click here to try the live demo: [![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://elevator-system-page.vercel.app/)

A modern elevator control system with real-time monitoring and control capabilities.

## Features

### Core Elevator Features

- Multiple elevators (5 elevators, 6 floors) operating concurrently
- Smart elevator dispatching algorithm
- Real-time elevator status monitoring
- External call buttons (Up/Down) on each floor
- Internal floor selection panel in each elevator
- Visual indicators for elevator movement and door status
- System-wide reset capability
- **Realistic Timing**:
  - 2 seconds travel time between floors
  - 4 seconds for door opening/closing cycle

### Elevator Algorithm Highlights

- **Priority-based Assignment**: Idle elevators and elevators moving in the same direction are given priority
- **Optimal Path Selection**: Among eligible elevators (idle or same direction), the one with shortest path is selected
- **Dynamic Request Distribution**: If no suitable elevator is immediately available, the system will wait and assign when conditions are met
- **Smart Stop Strategy**: Elevators will stop at a floor with requests even if not explicitly assigned (or not assigned to this elevator), if it's the first elevator to pass by
- **Direction Isolation**: Each elevator can only be assigned either up or down request from the same floor, never both simultaneously
- **Efficient Request Handling**:
  - Prioritizes requests in the current travel direction
  - Minimizes unnecessary stops and direction changes

## Future Improvements

### Enhanced Elevator Assignment Algorithm

- **Optimal Elevator Selection**:

  - Implement random selection among equally optimal elevators to distribute system wear
  - Consider elevator usage frequency and maintenance status in assignment decisions

- **Smart Path Calculation**:

  - Include number of stops as weights in path calculation
  - Consider total travel distance and number of stops when calculating optimal path

- **Dynamic Request Reassignment**:

  - Reassign long-waiting requests to more available elevators
  - Consider real-time elevator state changes for better request distribution
  - Implement priority boost for requests that have been waiting too long

- **Edge Cases Handling**:

  - Find and improve edge cases

## Technology Stack

### Frontend

- **Framework**: React with TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Real-time Updates**: Polling with interval
- **HTTP Client**: Native Fetch API

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Architecture**: Event-driven system
- **Concurrency**: Async/Await with Promise
- **State Management**: In-memory with mutex locks

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Local Development

1. Clone the repository:

```bash
git clone git@github.com:Mangobiubiu/Elevator-system.git
cd elevator-system
```

2. Start the backend:

```bash
cd api
npm install
npm run dev
```

The backend will run on http://localhost:3000

3. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3005

## System Architecture

## API Endpoints

- `POST /api/request-elevator`: Request an elevator from a floor
- `POST /api/select-floor`: Select a destination floor inside elevator
- `GET /api/status`: Get current system status
- `POST /api/reset`: Reset the entire elevator system state

## Development Notes

### Frontend Development

- Components are in `frontend/src/components`
- API calls are centralized in `frontend/src/utils/api.ts`
- Types are defined in `frontend/src/types`
- Global state is managed in `frontend/src/contexts`

### Backend Development

- Core elevator logic is in `api/src/elevator`
- API routes are in `api/src/server.ts`
- Types and interfaces are in `api/src/elevator/types.ts`
