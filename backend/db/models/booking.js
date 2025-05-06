'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Booking belongs to User
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      });

      // Booking belongs to Spot
      Booking.belongsTo(models.Spot, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE'
      });
    }
  }

  Booking.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Start date must be a valid date.'
        },
        isAfterToday(value) {
          if (new Date(value) < new Date()) {
            throw new Error('Start date cannot be in the past.');
          }
        },
        isBeforeEndDate(value) {
          if (this.endDate && new Date(value) >= new Date(this.endDate)) {
            throw new Error('Start date must be before end date.');
          }
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'End date must be a valid date.'
        },
        isAfterStartDate(value) {
          if (this.startDate && new Date(value) <= new Date(this.startDate)) {
            throw new Error('End date must be after start date.');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });

  return Booking;
};
