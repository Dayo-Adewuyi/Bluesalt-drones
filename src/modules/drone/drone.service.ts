import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { eventBus } from '../../shared/eventBus/eventBus';
import { MAX_FLEET_SIZE, MIN_BATTERY_FOR_LOADING } from '../../shared/utils/constants';
import { MedicationRepository } from '../medication/medication.repository';
import { DRONE_EVENTS } from './drone.events';
import { CreateDroneDTO, DroneState, IDrone, VALID_STATE_TRANSITIONS } from './drone.types';
import { DroneRepository } from './drone.repository';

export class DroneService {
  constructor(
    private readonly droneRepository: DroneRepository,
    private readonly medicationRepository: MedicationRepository,
  ) {}

  async registerDrone(dto: CreateDroneDTO): Promise<IDrone> {
    const count = await this.droneRepository.count();
    if (count >= MAX_FLEET_SIZE) {
      throw new ConflictError('Fleet limit reached', 'FLEET_LIMIT_REACHED');
    }

    const existing = await this.droneRepository.findBySerialNumber(dto.serialNumber);
    if (existing) {
      throw new ConflictError('Serial number already exists', 'SERIAL_NUMBER_EXISTS');
    }

    const drone = await this.droneRepository.create(dto);

    eventBus.emit(DRONE_EVENTS.DRONE_REGISTERED, {
      droneId: drone.id,
      serialNumber: drone.serialNumber,
      model: drone.model,
      timestamp: new Date(),
    });

    return drone;
  }

  async loadDrone(droneId: number, medicationIds: number[]): Promise<IDrone> {
    const drone = await this.droneRepository.findById(droneId);
    if (!drone) {
      throw new NotFoundError('drone', droneId);
    }

    if (![DroneState.IDLE, DroneState.LOADING].includes(drone.state)) {
      throw new ValidationError('Invalid drone state for loading', {
        state: drone.state,
      });
    }

    if (drone.batteryCapacity < MIN_BATTERY_FOR_LOADING) {
      throw new ValidationError('Drone battery too low for loading');
    }

    const medications = await this.medicationRepository.findByIds(medicationIds);
    if (medications.length !== medicationIds.length) {
      const foundIds = new Set(medications.map((m) => m.id));
      const missing = medicationIds.filter((id) => !foundIds.has(id));
      throw new NotFoundError('medication', missing.join(','));
    }

    const currentLoad = await this.droneRepository.getCurrentLoad(droneId);
    const additionalWeight = medications.reduce((sum, m) => sum + m.weight, 0);
    const totalWeight = currentLoad + additionalWeight;

    if (totalWeight > drone.weightLimit) {
      throw new ValidationError('Weight limit exceeded', {
        weightLimit: drone.weightLimit,
        currentLoad,
        additionalWeight,
        totalWeight,
      });
    }

    let currentDrone = drone;
    if (currentDrone.state === DroneState.IDLE) {
      currentDrone = await this.transitionState(currentDrone, DroneState.LOADING);
    }

    await this.droneRepository.addMedications(droneId, medicationIds);
    const updated = await this.transitionState(currentDrone, DroneState.LOADED);

    eventBus.emit(DRONE_EVENTS.DRONE_LOADED, {
      droneId: updated.id,
      serialNumber: updated.serialNumber,
      medicationIds,
      totalWeight,
      timestamp: new Date(),
    });

    return updated;
  }

  async getLoadedMedications(droneId: number): Promise<any[]> {
    const drone = await this.droneRepository.findById(droneId);
    if (!drone) {
      throw new NotFoundError('drone', droneId);
    }

    return this.droneRepository.getLoadedMedications(droneId);
  }

  async getAvailableDrones(filters: {
    model?: string;
    minBattery?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: IDrone[]; total: number }> {
    return this.droneRepository.findAvailable(filters);
  }

  async getBatteryLevel(droneId: number): Promise<{ serialNumber: string; batteryCapacity: number }> {
    const drone = await this.droneRepository.findById(droneId);
    if (!drone) {
      throw new NotFoundError('drone', droneId);
    }

    return {
      serialNumber: drone.serialNumber,
      batteryCapacity: drone.batteryCapacity,
    };
  }

  private async transitionState(drone: IDrone, newState: DroneState): Promise<IDrone> {
    const allowed = VALID_STATE_TRANSITIONS[drone.state];
    if (!allowed.includes(newState)) {
      throw new ValidationError(`Invalid state transition: ${drone.state} -> ${newState}`);
    }

    if (newState === DroneState.LOADING && drone.batteryCapacity < MIN_BATTERY_FOR_LOADING) {
      throw new ValidationError('Drone battery too low for loading');
    }

    const updated = await this.droneRepository.updateState(drone.id, newState);

    eventBus.emit(DRONE_EVENTS.DRONE_STATE_CHANGED, {
      droneId: updated.id,
      serialNumber: updated.serialNumber,
      previousState: drone.state,
      newState,
      batteryCapacity: updated.batteryCapacity,
      timestamp: new Date(),
    });

    return updated;
  }
}
