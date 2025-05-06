'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Spots through ownerId with cascade delete
      User.hasMany(models.Spot, { 
        foreignKey: 'ownerId', 
        onDelete: 'CASCADE',  // Cascade delete when user is deleted
        onUpdate: 'CASCADE'   // Cascade update when user data is updated
      });

      // User has many Reviews through userId with cascade delete
      User.hasMany(models.Review, { 
        foreignKey: 'userId', 
        onDelete: 'CASCADE',  // Cascade delete when user is deleted
        onUpdate: 'CASCADE'   // Cascade update when user data is updated
      });

      // User has many Bookings through userId with cascade delete
      User.hasMany(models.Booking, { 
        foreignKey: 'userId', 
        onDelete: 'CASCADE',  // Cascade delete when user is deleted
        onUpdate: 'CASCADE'   // Cascade update when user data is updated
      });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60], // Ensure hashed password length is exactly 60 characters
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'createdAt', 'updatedAt'], // Exclude sensitive fields from query results
        },
      },
    }
  );

  return User;
};