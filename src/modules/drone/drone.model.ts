import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../shared/database/connection';
import { DroneModel as DroneModelEnum, DroneState, IDrone } from './drone.types';
import { MedicationModel, DroneLoadModel } from '../medication/medication.model';

interface DroneCreation extends Optional<IDrone, 'id' | 'state' | 'createdAt' | 'updatedAt'> {}

export class DroneModel extends Model<IDrone, DroneCreation> implements IDrone {
  declare id: number;
  declare serialNumber: string;
  declare model: DroneModelEnum;
  declare weightLimit: number;
  declare batteryCapacity: number;
  declare state: DroneState;
  declare createdAt: Date;
  declare updatedAt: Date;
}

DroneModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    model: {
      type: DataTypes.ENUM(...Object.values(DroneModelEnum)),
      allowNull: false,
    },
    weightLimit: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { max: 500 },
    },
    batteryCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
    state: {
      type: DataTypes.ENUM(...Object.values(DroneState)),
      allowNull: false,
      defaultValue: DroneState.IDLE,
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
    tableName: 'drones',
    timestamps: true,
    indexes: [
      { fields: ['state'] },
      { fields: ['batteryCapacity'] },
      { fields: ['serialNumber'] },
    ],
  },
);

DroneModel.belongsToMany(MedicationModel, {
  through: DroneLoadModel,
  foreignKey: 'droneId',
  otherKey: 'medicationId',
  as: 'medications',
});

MedicationModel.belongsToMany(DroneModel, {
  through: DroneLoadModel,
  foreignKey: 'medicationId',
  otherKey: 'droneId',
  as: 'drones',
});

DroneLoadModel.belongsTo(MedicationModel, { foreignKey: 'medicationId' });
DroneLoadModel.belongsTo(DroneModel, { foreignKey: 'droneId' });
