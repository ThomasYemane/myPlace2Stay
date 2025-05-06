'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Review belongs to a User
      Review.belongsTo(models.User, { foreignKey: 'userId' });

      // Review belongs to a Spot
      Review.belongsTo(models.Spot, { foreignKey: 'spotId' });

      // Review has many ReviewImages with cascade delete
      Review.hasMany(models.ReviewImage, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE',
        hooks: true
      });
    }
  }

  Review.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Review text cannot be empty'
        }
      }
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Stars must be an integer'
        },
        min: {
          args: [1],
          msg: 'Stars must be at least 1'
        },
        max: {
          args: [5],
          msg: 'Stars must be at most 5'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
  });

  return Review;
};