module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Spots', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Spots', 'price', {
      type: Sequelize.DECIMAL,
      allowNull: false
    });
  }
};
