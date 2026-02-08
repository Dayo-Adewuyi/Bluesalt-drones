import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../shared/database/connection';
import { AuditEventType, IAuditLog } from './audit.types';

interface AuditCreation extends Optional<IAuditLog, 'id' | 'createdAt'> {}

export class AuditLogModel extends Model<IAuditLog, AuditCreation> implements IAuditLog {
  declare id: number;
  declare droneId: number;
  declare serialNumber: string;
  declare eventType: AuditEventType;
  declare details: Record<string, unknown>;
  declare createdAt: Date;
}

const auditEventValues = Object.values(AuditEventType) as string[];

AuditLogModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    droneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.ENUM(...auditEventValues),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['droneId', 'createdAt'] },
      { fields: ['eventType'] },
    ],
  },
);
