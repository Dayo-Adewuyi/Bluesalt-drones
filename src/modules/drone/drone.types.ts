export enum DroneModel {
  LIGHTWEIGHT = 'Lightweight',
  MIDDLEWEIGHT = 'Middleweight',
  CRUISERWEIGHT = 'Cruiserweight',
  HEAVYWEIGHT = 'Heavyweight',
}

export enum DroneState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  RETURNING = 'RETURNING',
}

export interface IDrone {
  id: number;
  serialNumber: string;
  model: DroneModel;
  weightLimit: number;
  batteryCapacity: number;
  state: DroneState;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDroneDTO {
  serialNumber: string;
  model: DroneModel;
  weightLimit: number;
  batteryCapacity: number;
}

export const VALID_STATE_TRANSITIONS: Record<DroneState, DroneState[]> = {
  [DroneState.IDLE]: [DroneState.LOADING],
  [DroneState.LOADING]: [DroneState.LOADED, DroneState.IDLE],
  [DroneState.LOADED]: [DroneState.DELIVERING],
  [DroneState.DELIVERING]: [DroneState.DELIVERED],
  [DroneState.DELIVERED]: [DroneState.RETURNING],
  [DroneState.RETURNING]: [DroneState.IDLE],
};
