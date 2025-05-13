'use strict';
const {
  Model,
  DataTypes,
  Sequelize
} = require('sequelize');
module.exports = (sequelize) => {
  class Spot extends Model {
  
    static associate(models) {
      // Spot belongs to User (Owner)
      Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner' });

      // Spot has many SpotImages
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });

      // Spot has many Reviews
      Spot.hasMany(models.Review, { foreignKey: 'spotId' });

      // Spot has many Bookings
      Spot.hasMany(models.Booking, { foreignKey: 'spotId' });
    }
  }

  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false, 
      validate: {
        notEmpty: {
          msg: 'Address cannot be empty'
        }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'City cannot be empty'
        }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false, 
      validate: {
        notEmpty: {
          msg: 'State cannot be empty'
        }
      }
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false, 
      validate: {
        notEmpty: {
          msg: 'Country cannot be empty'
        }
      }
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Latitude must be a decimal number'
        },
        min: {
          args: -90,
          msg: 'Latitude must be between -90 and 90'
        },
        max: {
          args: 90,
          msg: 'Latitude must be between -90 and 90'
        }
      }
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Longitude must be a decimal number'
        },
        min: {
          args: -180,
          msg: 'Longitude must be between -180 and 180'
        },
        max: {
          args: 180,
          msg: 'Longitude must be between -180 and 180'
        }
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false, 
      validate: {
        len: {
          args: [1, 50],
          msg: 'Name must be between 1 and 50 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false, 
      validate: {
        notEmpty: {
          msg: 'Description cannot be empty'
        }
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'Price must be a positive value'
        }
      }
    }
    
    }, {
    sequelize,
    modelName: 'Spot',
  });

  return Spot;
};