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

  // POST /api/spots - Create a new spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
    try {
      const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
      } = req.body;
  
      const ownerId = req.user.id;
  
      const newSpot = await Spot.create({
        ownerId,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
      });
  
      res.status(201).json(newSpot);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // POST /api/spots/:id/images - Upload an image for a spot
router.post('/:id/images', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;  // Spot ID from route parameter
      const { url, preview } = req.body;  // Image data from the request body
  
      // Find the spot by ID
      const spot = await Spot.findByPk(id);
  
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }
  
      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot' });
      }
  
      // Create the new image for the spot
      const newImage = await SpotImage.create({
        spotId: spot.id,
        url,
        preview: preview || false,  // Default to false if no preview field is provided
      });
  
      // Return the new image information in the response
      return res.status(201).json({
        id: newImage.id,
        spotId: newImage.spotId,
        url: newImage.url,
        preview: newImage.preview,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // PUT /api/spots/:id - Update spot details
router.put('/:id', requireAuth, validateSpot, async (req, res) => {
    try {
      const { id } = req.params;  // Spot ID from route parameter
      const { address, city, state, country, lat, lng, name, description, price } = req.body;
  
      // Find the spot by ID
      const spot = await Spot.findByPk(id);
  
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }
  
      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot' });
      }
  
      // Update the spot with the new data
      spot.address = address;
      spot.city = city;
      spot.state = state;
      spot.country = country;
      spot.lat = lat;
      spot.lng = lng;
      spot.name = name;
      spot.description = description;
      spot.price = price;
  
      // Save the updated spot
      await spot.save();
  
      // Return the updated spot information
      return res.json({
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
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