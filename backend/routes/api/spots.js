const express = require('express');
const { Booking, Spot, SpotImage, User, Review, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const { handleValidationErrors, validateReview } = require('../../utils/validation');

const router = express.Router();

// POST /api/spots/test (test route)
router.post('/test', (req, res) => {
  return res.json({ message: 'POST /api/spots/test reached!' });
});

// Validation for spot creation/update
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

// GET /api/spots - All spots with pagination
router.get('/', async (req, res) => {
  let { page = 1, size = 20 } = req.query;
  page = Math.max(parseInt(page), 1);
  size = Math.min(Math.max(parseInt(size), 1), 100);

  const limit = size;
  const offset = (page - 1) * size;

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
    limit,
    offset,
    subQuery: false
  });

  const formattedSpots = spots.map(spot => {
    const spotData = spot.toJSON();
    const previewImage = spotData.SpotImages?.find(img => img.preview === true)?.url || null;

    return {
      ...spotData,
      avgRating: parseFloat(spotData.avgRating || 0).toFixed(2),
      previewImage
    };
  });

  res.json({ Spots: formattedSpots, page, size });
});

// Remaining routes unchanged for now
// (GET /current, GET /:id, POST, PUT, DELETE, image upload, reviews)

module.exports = router;
