'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // schema will be something like 'airbnb_schema'
}

// Dynamically set table names
const userTable = options.schema ? `"${options.schema}"."Users"` : '"Users"';
const spotTable = options.schema ? `"${options.schema}"."Spots"` : '"Spots"';
const reviewTable = options.schema ? `"${options.schema}"."Reviews"` : '"Reviews"';
const reviewImagesTable = options.schema ? `"${options.schema}"."ReviewImages"` : '"ReviewImages"';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs
    const demoUser = await queryInterface.sequelize.query(
      `SELECT id FROM ${userTable} WHERE username = 'Demo-lition' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const fakeUser1 = await queryInterface.sequelize.query(
      `SELECT id FROM ${userTable} WHERE username = 'FakeUser1' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const fakeUser2 = await queryInterface.sequelize.query(
      `SELECT id FROM ${userTable} WHERE username = 'FakeUser2' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get spot IDs
    const spots = await queryInterface.sequelize.query(
      `SELECT id FROM ${spotTable} ORDER BY id LIMIT 3;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Check if required data exists
    if (spots.length < 3 || !demoUser.length || !fakeUser1.length || !fakeUser2.length) {
      console.error("Error: Missing required spots or users in database");
      return;
    }

    const demoUserId = demoUser[0].id;
    const user1Id = fakeUser1[0].id;
    const user2Id = fakeUser2[0].id;

    // Insert sample reviews
    options.tableName = 'Reviews';
    await queryInterface.bulkInsert(options, [
      {
        spotId: spots[0].id,
        userId: user1Id,
        review: "This place was absolutely amazing! The location was perfect and the amenities were top-notch.",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[0].id,
        userId: user2Id,
        review: "Great spot overall. Just a few minor issues with cleanliness but would stay again.",
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[1].id,
        userId: demoUserId,
        review: "Wonderful experience! The host was very accommodating and the place exceeded my expectations.",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[1].id,
        userId: user2Id,
        review: "Decent spot but overpriced for what you get. The neighborhood was a bit noisy at night.",
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: spots[2].id,
        userId: user1Id,
        review: "Perfect getaway! Beautiful views and excellent amenities. Would definitely recommend!",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Get inserted reviews
    const insertedReviews = await queryInterface.sequelize.query(
      `SELECT id FROM ${reviewTable} ORDER BY id DESC LIMIT 5;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insert sample review images
    options.tableName = 'ReviewImages';
    await queryInterface.bulkInsert(options, [
      {
        reviewId: insertedReviews[0].id,
        url: "https://example.com/review-image1.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: insertedReviews[0].id,
        url: "https://example.com/review-image2.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: insertedReviews[2].id,
        url: "https://example.com/review-image3.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Delete ReviewImages first (dependent on Reviews)
    options.tableName = 'ReviewImages';
    await queryInterface.bulkDelete(options, {
      url: { [Sequelize.Op.in]: [
        "https://example.com/review-image1.jpg",
        "https://example.com/review-image2.jpg",
        "https://example.com/review-image3.jpg"
      ]}
    }, {});

    // Delete Reviews after ReviewImages
    options.tableName = 'Reviews';
    await queryInterface.bulkDelete(options, {
      review: { [Sequelize.Op.in]: [
        "This place was absolutely amazing! The location was perfect and the amenities were top-notch.",
        "Great spot overall. Just a few minor issues with cleanliness but would stay again.",
        "Wonderful experience! The host was very accommodating and the place exceeded my expectations.",
        "Decent spot but overpriced for what you get. The neighborhood was a bit noisy at night.",
        "Perfect getaway! Beautiful views and excellent amenities. Would definitely recommend!"
      ]}
    }, {});
  }
};