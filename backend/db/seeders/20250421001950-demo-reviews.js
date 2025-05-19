
'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Reviews';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 2,
        review: 'Amazing place, will come back again!',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 1,
        userId: 3,
        review: 'Very clean and comfortable.',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 2,
        userId: 1,
        review: 'Location is perfect, great stay!',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 3,
        userId: 2,
        review: 'Quiet and cozy, highly recommended.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      review: {
        [Op.in]: [
          'Amazing place, will come back again!',
          'Very clean and comfortable.',
          'Location is perfect, great stay!',
          'Quiet and cozy, highly recommended.'
        ]
      }
    }, {});
  }
};
