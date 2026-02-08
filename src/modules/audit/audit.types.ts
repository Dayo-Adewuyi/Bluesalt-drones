export enum AuditEventType {
  BATTERY_CHECK = 'BATTERY_CHECK',
  STATE_CHANGE = 'STATE_CHANGE',
  DRONE_LOADED = 'DRONE_LOADED',
  DRONE_REGISTERED = 'DRONE_REGISTERED',
}

export interface IAuditLog {
  id: number;
  droneId: number;
  serialNumber: string;
  eventType: AuditEventType;
  details: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateAuditDTO {
  droneId: number;
  serialNumber: string;
  eventType: AuditEventType;
  details: Record<string, unknown>;
}
