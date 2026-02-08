import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../shared/database/connection';
import { IMedication } from './medication.types';

interface MedicationCreation extends Optional<IMedication, 'id' | 'image' | 'createdAt' | 'updatedAt'> {}

export class MedicationModel extends Model<IMedication, MedicationCreation> implements IMedication {
  declare id: number;
  declare name: string;
  declare weight: number;
  declare code: string;
  declare image: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

MedicationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'medications',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['code'] },
      { fields: ['weight'] },
    ],
  },
);

export const DroneLoadModel = sequelize.define(
  'drone_loads',
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
    medicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'drone_loads',
    timestamps: true,
    updatedAt: false,
  },
);
