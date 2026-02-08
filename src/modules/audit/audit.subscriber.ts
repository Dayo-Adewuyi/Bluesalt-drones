import { eventBus } from '../../shared/eventBus/eventBus';
import { DRONE_EVENTS } from '../drone/drone.events';
import { AuditService } from './audit.service';
import { AuditEventType } from './audit.types';

export function registerAuditSubscribers(auditService: AuditService): void {
  eventBus.on(DRONE_EVENTS.DRONE_STATE_CHANGED, async (payload) => {
    await auditService.logEvent(payload.droneId, payload.serialNumber, AuditEventType.STATE_CHANGE, {
      serialNumber: payload.serialNumber,
      previousState: payload.previousState,
      newState: payload.newState,
      batteryCapacity: payload.batteryCapacity,
    });
  });

  eventBus.on(DRONE_EVENTS.DRONE_LOADED, async (payload) => {
    await auditService.logEvent(payload.droneId, payload.serialNumber, AuditEventType.DRONE_LOADED, {
      serialNumber: payload.serialNumber,
      medications: payload.medicationIds,
      totalWeight: payload.totalWeight,
    });
  });

  eventBus.on(DRONE_EVENTS.DRONE_REGISTERED, async (payload) => {
    await auditService.logEvent(payload.droneId, payload.serialNumber, AuditEventType.DRONE_REGISTERED, {
      serialNumber: payload.serialNumber,
      model: payload.model,
    });
  });
}
