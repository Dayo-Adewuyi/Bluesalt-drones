import { AuditRepository } from './audit.repository';
import { AuditEventType, CreateAuditDTO, IAuditLog } from './audit.types';

export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logEvent(
    droneId: number,
    serialNumber: string,
    eventType: AuditEventType,
    details: Record<string, unknown>,
  ): Promise<IAuditLog> {
    const payload: CreateAuditDTO = {
      droneId,
      serialNumber,
      eventType,
      details,
    };
    return this.auditRepository.create(payload);
  }

  async logBatteryChecks(entries: CreateAuditDTO[]): Promise<IAuditLog[]> {
    return this.auditRepository.createBulk(entries);
  }

  async getAuditHistory(droneId: number, limit = 50, offset = 0): Promise<IAuditLog[]> {
    return this.auditRepository.findByDroneId(droneId, {
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }
}
