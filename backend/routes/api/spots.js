const express = require('express');
const { Booking, Spot, SpotImage, User, Review, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const { handleValidationErrors, validateReview } = require('../../utils/validation');

const router = express.Router();

// Spot validation
const validateSpot = [
  check('address').notEmpty().withMessage('Address is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('country').notEmpty().withMessage('Country is required'),
  check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  check('name').isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  check('description').notEmpty().withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  handleValidationErrors
];

// GET /api/spots - Homepage
router.get('/', async (req, res) => {
  const spots = await Spot.findAll({
    include: [
      { model: Review, attributes: [] },
      { model: SpotImage, attributes: ['url', 'preview'], required: false }
    ],
    attributes: {
      include: [
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating']
      ]
    },
    group: ['Spot.id', 'SpotImages.id'],
    subQuery: false
  });

  const formattedSpots = spots.map(spot => {
    const spotData = spot.toJSON();
    const previewImage = spotData.SpotImages?.find(img => img.preview)?.url || null;

    return {
      ...spotData,
      avgRating: spotData.avgRating ? parseFloat(spotData.avgRating).toFixed(2) : null,
      previewImage
    };
  });

  res.json({ Spots: formattedSpots });
});

// GET /api/spots/current
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const spots = await Spot.findAll({
    where: { ownerId: userId },
    include: [
      { model: Review, attributes: [] },
      { model: SpotImage, attributes: ['url', 'preview'], required: false }
    ],
    attributes: {
      include: [
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating']
      ]
    },
    group: ['Spot.id', 'SpotImages.id']
  });

  const formattedSpots = spots.map(spot => {
    const spotData = spot.toJSON();
    const previewImage = spotData.SpotImages?.find(img => img.preview)?.url || null;

    return {
      ...spotData,
      avgRating: spotData.avgRating ? parseFloat(spotData.avgRating).toFixed(2) : null,
      previewImage
    };
  });

  res.json({ Spots: formattedSpots });
});

// GET /api/spots/:id - Spot details
router.get('/:id', async (req, res) => {
  const spotId = req.params.id;

  const spot = await Spot.findByPk(spotId, {
    include: [
      {
        model: SpotImage,
        attributes: ['id', 'url', 'preview']
      },
      {
        model: User,
        as: 'Owner',
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Review,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('Reviews.id')), 'numReviews'],
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgStarRating']
      ]
    },
    group: ['Spot.id', 'SpotImages.id', 'Owner.id']
  });

  if (!spot) {
    return res.status(404).json({
      title: 'Resource Not Found',
      message: "The requested resource couldn't be found.",
      errors: ["The requested resource couldn't be found."]
    });
  }

  const spotData = spot.toJSON();
  spotData.numReviews = parseInt(spotData.numReviews) || 0;
  spotData.avgStarRating = parseFloat(spotData.avgStarRating) || 0;

  res.json(spotData);
});

// DELETE /api/spots/:id - Delete a spot
router.delete('/:id', requireAuth, async (req, res) => {
  const spotId = req.params.id;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await spot.destroy();
  return res.json({ message: "Successfully deleted" });
});
  

module.exports = router;
