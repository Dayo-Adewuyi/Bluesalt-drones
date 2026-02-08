import { registerAuditSubscribers } from '../audit.subscriber';
import { eventBus } from '../../../shared/eventBus/eventBus';
import { AuditEventType } from '../audit.types';
import { DRONE_EVENTS } from '../../drone/drone.events';

const auditService: any = {
  logEvent: jest.fn().mockResolvedValue({}),
};

describe('audit subscribers', () => {
  it('logs on drone events', async () => {
    registerAuditSubscribers(auditService);

    eventBus.emit(DRONE_EVENTS.DRONE_REGISTERED, {
      droneId: 1,
      serialNumber: 'SN1',
      model: 'Lightweight',
    });
    eventBus.emit(DRONE_EVENTS.DRONE_LOADED, {
      droneId: 1,
      serialNumber: 'SN1',
      medicationIds: [1],
      totalWeight: 10,
    });
    eventBus.emit(DRONE_EVENTS.DRONE_STATE_CHANGED, {
      droneId: 1,
      serialNumber: 'SN1',
      previousState: 'IDLE',
      newState: 'LOADING',
      batteryCapacity: 80,
    });

    expect(auditService.logEvent).toHaveBeenCalledTimes(3);
    expect(auditService.logEvent).toHaveBeenCalledWith(
      1,
      'SN1',
      AuditEventType.DRONE_REGISTERED,
      expect.any(Object),
    );
  });
});
