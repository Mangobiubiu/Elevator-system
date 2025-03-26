import React, { createContext, useContext, useState, useEffect } from 'react';
import { Direction, Elevator, ExternalRequests } from '../types/elevator';
import api from '../utils/api';

interface ElevatorContextType {
  state: {
    elevators: Elevator[];
    isInitializing: boolean;
    externalRequests: ExternalRequests;
  };
  callElevator: (floor: number, direction: Direction) => Promise<void>;
  selectFloor: (elevatorId: number, floor: number) => Promise<void>;
  reset: () => Promise<void>;
}

const ElevatorContext = createContext<ElevatorContextType | undefined>(undefined);

export function ElevatorProvider({ children }: { children: React.ReactNode }) {
  const [elevators, setElevators] = useState<Elevator[]>([]);
  const [externalRequests, setExternalRequests] = useState<ExternalRequests>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isInitializing = elevators.length === 0 && isLoading;

  const fetchStatus = async () => {
    try {
      const data = await api.getStatus();
      setElevators(data.elevators);
      setExternalRequests(data.externalRequests);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setIsLoading(false);
    }
  };

  const callElevator = async (floor: number, direction: Direction) => {
    try {
      await api.callElevator(floor, direction);
    } catch (error) {
      console.error('Failed to call elevator:', error);
    }
  };

  const selectFloor = async (elevatorId: number, floor: number) => {
    try {
      await api.selectFloor(elevatorId, floor);
      await fetchStatus();
    } catch (error) {
      console.error('Failed to select floor:', error);
    }
  };

  const reset = async () => {
    try {
      await api.reset();
      await fetchStatus();
    } catch (error) {
      console.error('Failed to reset system:', error);
    }
  };

  // Polling the status every 200ms
  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 200);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ElevatorContext.Provider
      value={{
        state: {
          elevators,
          isInitializing,
          externalRequests,
        },
        reset,
        callElevator,
        selectFloor,
      }}
    >
      {children}
    </ElevatorContext.Provider>
  );
}

// Hook to use the ElevatorContext
export function useElevator() {
  const context = useContext(ElevatorContext);
  if (context === undefined) {
    throw new Error('useElevator must be used within an ElevatorProvider');
  }
  return context;
}
