import { DroneModel, DroneState } from '../modules/drone/drone.types';

export const droneSeedData = [
  { serialNumber: 'DRN-LW-001', model: DroneModel.LIGHTWEIGHT, weightLimit: 150, batteryCapacity: 100, state: DroneState.IDLE },
  { serialNumber: 'DRN-LW-002', model: DroneModel.LIGHTWEIGHT, weightLimit: 200, batteryCapacity: 85, state: DroneState.IDLE },
  { serialNumber: 'DRN-MW-001', model: DroneModel.MIDDLEWEIGHT, weightLimit: 300, batteryCapacity: 70, state: DroneState.IDLE },
  { serialNumber: 'DRN-MW-002', model: DroneModel.MIDDLEWEIGHT, weightLimit: 350, batteryCapacity: 50, state: DroneState.IDLE },
  { serialNumber: 'DRN-CW-001', model: DroneModel.CRUISERWEIGHT, weightLimit: 400, batteryCapacity: 90, state: DroneState.IDLE },
  { serialNumber: 'DRN-CW-002', model: DroneModel.CRUISERWEIGHT, weightLimit: 420, batteryCapacity: 15, state: DroneState.IDLE },
  { serialNumber: 'DRN-HW-001', model: DroneModel.HEAVYWEIGHT, weightLimit: 500, batteryCapacity: 100, state: DroneState.IDLE },
  { serialNumber: 'DRN-HW-002', model: DroneModel.HEAVYWEIGHT, weightLimit: 500, batteryCapacity: 60, state: DroneState.IDLE },
  { serialNumber: 'DRN-HW-003', model: DroneModel.HEAVYWEIGHT, weightLimit: 480, batteryCapacity: 30, state: DroneState.IDLE },
  { serialNumber: 'DRN-LW-003', model: DroneModel.LIGHTWEIGHT, weightLimit: 180, batteryCapacity: 20, state: DroneState.IDLE },
];
