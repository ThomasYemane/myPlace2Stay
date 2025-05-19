
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {

      ReviewImage.belongsTo(models.Review, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE' 
      });
    }
  }

  ReviewImage.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'URL must not be empty.'
        },
        isUrl: {
          msg: 'URL must be a valid URL.'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'ReviewImage',
  });

  return ReviewImage;
};