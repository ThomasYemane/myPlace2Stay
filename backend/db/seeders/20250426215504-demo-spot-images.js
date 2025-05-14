'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'SpotImages';

module.exports = {
  async up(queryInterface, Sequelize) {
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
        url: 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1', // App Academy SF
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[0].id,
        url: 'https://images.unsplash.com/photo-1582719478171-dc0ee0f1a951',
        preview: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[1].id,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // Sunny Retreat LA
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[2].id,
        url: 'https://images.unsplash.com/photo-1505692794403-44b72a31e400', // Mountain View
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[3]?.id,
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Beachfront Bungalow
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    await queryInterface.bulkDelete(options, null, {});
  }
};
