import { DroneModel, DroneState } from './drone.types';

export const DRONE_EVENTS = {
  DRONE_REGISTERED: 'drone.registered',
  DRONE_STATE_CHANGED: 'drone.stateChanged',
  DRONE_LOADED: 'drone.loaded',
} as const;

export interface DroneRegisteredPayload {
  droneId: number;
  serialNumber: string;
  model: DroneModel;
  timestamp: Date;
}

export interface DroneStateChangedPayload {
  droneId: number;
  serialNumber: string;
  previousState: DroneState;
  newState: DroneState;
  batteryCapacity: number;
  timestamp: Date;
}

export interface DroneLoadedPayload {
  droneId: number;
  serialNumber: string;
  medicationIds: number[];
  totalWeight: number;
  timestamp: Date;
}
