'use strict';
const {
  Model,
  DataTypes
} = require('sequelize');

module.exports = (sequelize) => {
  class SpotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // SpotImage belongs to Spot through spotId
      SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId' });
    }
  }

  SpotImage.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Non-nullable
      validate: {
        isInt: {
          msg: 'Spot ID must be an integer'
        },
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false, // Non-nullable
      validate: {
        notEmpty: {
          msg: 'URL cannot be empty'
        },
        isUrl: {
          msg: 'URL must be a valid URL'
        }
      }
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false, // Non-nullable
      defaultValue: false, // Default to false
    }
  }, {
    sequelize,
    modelName: 'SpotImage',
  });

  return SpotImage;
};