import { FindOptions } from 'sequelize';
import { AuditLogModel } from './audit.model';
import { AuditEventType, CreateAuditDTO, IAuditLog } from './audit.types';

export class AuditRepository {
  async create(data: CreateAuditDTO): Promise<IAuditLog> {
    const log = await AuditLogModel.create(data as any);
    return log.get({ plain: true }) as IAuditLog;
  }

  async createBulk(data: CreateAuditDTO[]): Promise<IAuditLog[]> {
    const logs = await AuditLogModel.bulkCreate(data as any[]);
    return logs.map((l) => l.get({ plain: true }) as IAuditLog);
  }

  async findByDroneId(droneId: number, options: FindOptions = {}): Promise<IAuditLog[]> {
    const logs = await AuditLogModel.findAll({ where: { droneId }, ...options });
    return logs.map((l) => l.get({ plain: true }) as IAuditLog);
  }

  async findByEventType(type: AuditEventType, options: FindOptions = {}): Promise<IAuditLog[]> {
    const logs = await AuditLogModel.findAll({ where: { eventType: type }, ...options });
    return logs.map((l) => l.get({ plain: true }) as IAuditLog);
  }
}
