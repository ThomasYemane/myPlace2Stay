const express = require('express');
const { Booking, Spot, SpotImage, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const { handleValidationErrors } = require('../../utils/validation');
const { validateReview } = require('../../utils/validation');
const router = express.Router();
const { Review, ReviewImage } = require('../../db/models');

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

  // GET /api/spots - Get all spots with filters and pagination
router.get('/', validateQueryFilters, async (req, res) => {
    try {
      let { page = 1, size = 20 } = req.query;
  
      // Convert page & size to numbers and enforce limits
      page = Math.max(parseInt(page), 1);
      size = Math.min(Math.max(parseInt(size), 1), 100);
  
      const limit = size;
      const offset = (page - 1) * size;
  
      // Query spots with average rating and preview image
      const spots = await Spot.findAll({
        include: [
          {
            model: Review,
            attributes: [], // We'll aggregate below
          },
          {
            model: SpotImage,
            attributes: ['url', 'preview'],
            required: false
          }
        ],
        attributes: {
          include: [
            [
              // Sequelize literal to calculate avg rating
              Sequelize.fn('AVG', Sequelize.col('Reviews.stars')),
              'avgRating'
            ]
          ]
        },
        group: ['Spot.id', 'SpotImages.id'],
        limit,
        offset,
        subQuery: false
      });
  
      // Format the result to shape previewImage and avgRating
      const formattedSpots = spots.map(spot => {
        const spotData = spot.toJSON();
  
        // Find preview image URL
        const previewImage = spotData.SpotImages?.find(img => img.preview)?.url || null;
  
        return {
          id: spotData.id,
          ownerId: spotData.ownerId,
          address: spotData.address,
          city: spotData.city,
          state: spotData.state,
          country: spotData.country,
          lat: spotData.lat,
          lng: spotData.lng,
          name: spotData.name,
          description: spotData.description,
          price: spotData.price,
          createdAt: spotData.createdAt,
          updatedAt: spotData.updatedAt,
          avgRating: parseFloat(spotData.avgRating).toFixed(2), // optional: round to 2 decimals
          previewImage
        };
      });
  
      return res.json({ Spots: formattedSpots, page, size });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

         // Validation Middleware for Bookings
  const validateBooking = [
    check('startDate')
      .exists({ checkFalsy: true }).withMessage('Start date is required.')
      .isISO8601().withMessage('Start date must be a valid date.')
      .custom((value) => {
        const today = new Date();
        if (new Date(value) < today) {
          throw new Error('Start date cannot be in the past.');
        }
        return true;
      }),
    check('endDate')
      .exists({ checkFalsy: true }).withMessage('End date is required.')
      .isISO8601().withMessage('End date must be a valid date.')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date.');
        }
        return true;
      }),
    handleValidationErrors
  ];
  

  // GET /api/spots/current - Get spots owned by current user
router.get('/current', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const spots = await Spot.findAll({
        where: { ownerId: userId },
        include: [
          {
            model: Review,
            attributes: []
          },
          {
            model: SpotImage,
            attributes: ['url', 'preview'],
            required: false
          }
        ],
        attributes: {
          include: [
            [
              Sequelize.fn('AVG', Sequelize.col('Reviews.stars')),
              'avgRating'
            ]
          ]
        },
        group: ['Spot.id', 'SpotImages.id']
      });
  
      const formattedSpots = spots.map(spot => {
        const spotData = spot.toJSON();
  
        const previewImage = spotData.SpotImages?.find(img => img.preview)?.url || null;
  
        return {
          id: spotData.id,
          ownerId: spotData.ownerId,
          address: spotData.address,
          city: spotData.city,
          state: spotData.state,
          country: spotData.country,
          lat: spotData.lat,
          lng: spotData.lng,
          name: spotData.name,
          description: spotData.description,
          price: spotData.price,
          createdAt: spotData.createdAt,
          updatedAt: spotData.updatedAt,
          avgRating: parseFloat(spotData.avgRating).toFixed(2),
          previewImage
        };
      });
  
      res.json({ Spots: formattedSpots });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // GET /api/spots/:id - Get spot details by ID
router.get('/:id', async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
  
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
            // Number of Reviews
            [
              Sequelize.fn('COUNT', Sequelize.col('Reviews.id')),
              'numReviews'
            ],
            // Average Rating
            [
              Sequelize.fn('AVG', Sequelize.col('Reviews.stars')),
              'avgStarRating'
            ]
          ]
        },
        group: ['Spot.id', 'SpotImages.id', 'Owner.id']
      });
  
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }
  
      // Format response
      const spotData = spot.toJSON();
      spotData.numReviews = parseInt(spotData.numReviews) || 0;
      spotData.avgStarRating = parseFloat(spotData.avgStarRating).toFixed(2) || null;
  
      res.json(spotData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
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
    try {
      const { id } = req.params; // Spot ID from route parameter
  
      // Find the spot by ID
      const spot = await Spot.findByPk(id);
  
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }
  
      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You are not the owner of this spot' });
      }
  
      // Delete the spot
      await spot.destroy();
  
      // Return success message
      return res.json({ message: 'Successfully deleted the spot' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // DELETE /api/spot-images/:imageId - Delete a spot image
router.delete('/images/:imageId', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Find the SpotImage with its associated Spot
    const image = await SpotImage.findByPk(imageId, {
      include: {
        model: Spot,
        attributes: ['ownerId']  // Needed to verify ownership
      }
    });

    // Step 5: Check if image exists
    if (!image) {
      return res.status(404).json({ message: "Spot image couldn't be found" });
    }

    // Step 6: Check if current user owns the spot
    if (image.Spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this spot" });
    }

    // Step 7: Delete the image
    await image.destroy();

    // Step 8: Return success message
    return res.json({ message: 'Successfully deleted the image' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET /api/spots/:spotId/reviews - Get reviews for a Spot
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return res.json({ Reviews: reviews });
});

//POST /api/spots/:spotId/reviews — Add a Review for a Spot
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const existingReview = await Review.findOne({
    where: {
      spotId,
      userId
    }
  });

  if (existingReview) {
    return res.status(500).json({
      message: "User already has a review for this spot"
    });
  }

  const newReview = await Review.create({
    spotId,
    userId,
    review,
    stars
  });

  return res.status(201).json(newReview);
});

  // Export router
module.exports = router;
