const express = require('express');
const { Booking, Spot, SpotImage, User, Review, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const { handleValidationErrors, validateReview } = require('../../utils/validation');

const router = express.Router();

router.post('/test', (req, res) => {
  return res.json({ message: 'POST /api/spots/test reached!' });
});

// Validate spot creation/update
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

// Validate query filters
const validateQueryFilters = [
  check('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  check('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100'),
  handleValidationErrors
];

// GET /api/spots - All spots with pagination
router.get('/', validateQueryFilters, async (req, res) => {
  let { page = 1, size = 20 } = req.query;
  page = Math.max(parseInt(page), 1);
  size = Math.min(Math.max(parseInt(size), 1), 100);

  const limit = size;
  const offset = (page - 1) * size;

  const spots = await Spot.findAll({
    include: [
      { model: Review, attributes: [] },
      { model: SpotImage, attributes: [['url', 'original'], ['url', 'thumbnail'], 'preview'], required: false }
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
    const previewImage = spotData.SpotImages?.find(img => img.preview)?.original || null;

    return {
      ...spotData,
      avgRating: parseFloat(spotData.avgRating).toFixed(2),
      previewImage
    };
  });

  res.json({ Spots: formattedSpots, page, size });
});

// GET /api/spots/current - Spots owned by current user
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
      avgRating: parseFloat(spotData.avgRating).toFixed(2),
      previewImage
    };
  });

  res.json({ Spots: formattedSpots });
});

// GET /api/spots/:id - Spot details by ID
router.get('/:id', async (req, res) => {
  const spotId = parseInt(req.params.id);

  const spot = await Spot.findByPk(spotId, {
    include: [
      { model: SpotImage, attributes: ['id', 'url', 'preview'] },
      { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] },
      { model: Review, attributes: [] }
    ],
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('Reviews.id')), 'numReviews'],
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgStarRating']
      ]
    },
    group: ['Spot.id', 'SpotImages.id', 'Owner.id']
  });

  if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

  const spotData = spot.toJSON();
  spotData.numReviews = parseInt(spotData.numReviews) || 0;
  spotData.avgStarRating = parseFloat(spotData.avgStarRating).toFixed(2) || null;

  res.json(spotData);
});

// POST /api/spots - Create a new spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id;

  const newSpot = await Spot.create({ ownerId, address, city, state, country, lat, lng, name, description, price });

  res.status(201).json(newSpot);
});

// POST /api/spots/:id/images - Upload an image to a spot
router.post('/:id/images', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { url, preview } = req.body;

  const spot = await Spot.findByPk(id);
  if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

  if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden: You are not the owner of this spot" });

  const newImage = await SpotImage.create({ spotId: spot.id, url, preview: preview || false });

  res.status(201).json({
    id: newImage.id,
    spotId: newImage.spotId,
    url: newImage.url,
    preview: newImage.preview
  });
});

// PUT /api/spots/:id - Edit a spot
router.put('/:id', requireAuth, validateSpot, async (req, res) => {
  const { id } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  const spot = await Spot.findByPk(id);
  if (!spot) return res.status(404).json({ message: "Spot not found" });

  if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden: You are not the owner of this spot" });

  spot.set({ address, city, state, country, lat, lng, name, description, price });
  await spot.save();

  res.json(spot);
});

// DELETE /api/spots/:id - Delete a spot
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const spot = await Spot.findByPk(id);

  if (!spot) return res.status(404).json({ message: "Spot not found" });
  if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden: You are not the owner of this spot" });

  await spot.destroy();
  res.json({ message: 'Successfully deleted the spot' });
});

// DELETE /api/spots/images/:imageId - Delete a spot image
router.delete('/images/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;

  const image = await SpotImage.findByPk(imageId, {
    include: {
      model: Spot,
      attributes: ['ownerId']
    }
  });

  if (!image) return res.status(404).json({ message: "Spot image couldn't be found" });
  if (image.Spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden: You are not the owner of this spot" });

  await image.destroy();
  res.json({ message: 'Successfully deleted the image' });
});

// GET /api/spots/:spotId/reviews - Get all reviews for a spot
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);
  if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      { model: User, attributes: ['id', 'firstName', 'lastName'] },
      { model: ReviewImage, attributes: ['id', 'url'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json({ Reviews: reviews });
});

// POST /api/spots/:spotId/reviews - Create a review for a spot
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);
  if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

  const existingReview = await Review.findOne({ where: { spotId, userId } });
  if (existingReview) return res.status(500).json({ message: "User already has a review for this spot" });

  const newReview = await Review.create({ spotId, userId, review, stars });
  res.status(201).json(newReview);
});

module.exports = router;
