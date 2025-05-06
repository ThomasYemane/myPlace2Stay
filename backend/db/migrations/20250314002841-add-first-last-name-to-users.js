'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      { tableName: 'Users', schema: options.schema },
      'firstName',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );

    await queryInterface.addColumn(
      { tableName: 'Users', schema: options.schema },
      'lastName',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      { tableName: 'Users', schema: options.schema },
      'firstName'
    );

    await queryInterface.removeColumn(
      { tableName: 'Users', schema: options.schema },
      'lastName'
    );
  }
};