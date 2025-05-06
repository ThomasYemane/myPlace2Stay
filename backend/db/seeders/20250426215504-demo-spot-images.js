'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Set schema if in production
}
options.tableName = 'SpotImages';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Find all spots owned by Demo user
    const spots = await queryInterface.sequelize.query(
      `SELECT id FROM "${options.schema ? options.schema + '"."' : ''}Spots" ORDER BY id ASC;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!spots.length) {
      throw new Error('No spots found. Cannot seed SpotImages.');
    }

    await queryInterface.bulkInsert(options, [
      {
        spotId: spots[0].id,
        url: 'https://example.com/spot1-preview.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[0].id,
        url: 'https://example.com/spot1-secondary.jpg',
        preview: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[1].id,
        url: 'https://example.com/spot2-preview.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[2].id,
        url: 'https://example.com/spot3-preview.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages'; // make sure you're deleting SpotImages first
    await queryInterface.bulkDelete(options, null, {}); 
  }
};
