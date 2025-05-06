'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ownerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users',    // ✅ wrapped inside an object
            schema: options.schema // ✅ schema is specified!
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING
      },
      country: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lat: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 7)
      },
      lng: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 7)
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);  // ✅ Don't forget to pass options here too
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    await queryInterface.dropTable(options);  // First drop Bookings (child)

    options.tableName = 'SpotImages';
    await queryInterface.dropTable(options);  // Then drop SpotImages (another child)

    options.tableName = 'Spots';
    await queryInterface.dropTable(options);  // Then drop Spots (parent)
  }
};