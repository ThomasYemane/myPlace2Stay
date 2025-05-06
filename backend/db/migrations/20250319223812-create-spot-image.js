'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // { schema: 'airbnb_schema' }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'SpotImages'; // 🔥 add tableName inside options
    await queryInterface.createTable(options, {  // 🔥 pass options FIRST
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING
      },
      preview: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages'; // 🔥 again, specify in options
    await queryInterface.dropTable(options);
  }
};