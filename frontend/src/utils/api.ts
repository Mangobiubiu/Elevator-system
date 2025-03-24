import { Direction } from '../types/elevator';

const API_BASE_URL = '/api';

const api = {
  // To select the destination floor inside the elevator
  callElevator: async (floor: number, direction: Direction): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/request-elevator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ floor, direction }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error calling elevator:', error);
      throw error;
    }
  },

  // To select the target floor inside the elevator
  selectFloor: async (elevatorId: number, floor: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/select-floor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elevatorId, floor }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error selecting floor:', error);
      throw error;
    }
  },

  // To get the system status - Get the position and state of all elevators
  getStatus: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  },
};

export default api;
