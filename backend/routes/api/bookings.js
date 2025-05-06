const express = require('express');
const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, User, SpotImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// ------------------------------------------
// Validation Middleware for Booking
// ------------------------------------------
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

// ------------------------------------------
// GET /api/bookings/current - Get Current User's Bookings
// ------------------------------------------
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const bookings = await Booking.findAll({
    where: { userId },
    include: {
      model: Spot,
      attributes: {
        exclude: ['description', 'createdAt', 'updatedAt']
      },
      include: {
        model: SpotImage,
        where: { preview: true },
        required: false,
        attributes: ['url']
      }
    }
  });

  const formattedBookings = bookings.map(booking => {
    const spot = booking.Spot.toJSON();
    spot.previewImage = spot.SpotImages?.[0]?.url || null;
    delete spot.SpotImages;

    return {
      ...booking.toJSON(),
      Spot: spot
    };
  });

  res.json({ Bookings: formattedBookings });
});

// ------------------------------------------
// PUT /api/bookings/:bookingId - Update Booking
// ------------------------------------------
router.put('/:bookingId', requireAuth, validateBooking, async (req, res) => {
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  if (booking.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (new Date(booking.endDate) < new Date()) {
    return res.status(403).json({ message: "Past bookings can't be modified" });
  }

  // Check for date conflicts
  const conflictingBooking = await Booking.findOne({
    where: {
      spotId: booking.spotId,
      id: { [Op.ne]: booking.id },
      [Op.or]: [
        {
          startDate: { [Op.between]: [startDate, endDate] }
        },
        {
          endDate: { [Op.between]: [startDate, endDate] }
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate } },
            { endDate: { [Op.gte]: endDate } }
          ]
        }
      ]
    }
  });

  if (conflictingBooking) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking"
      }
    });
  }

  booking.startDate = startDate;
  booking.endDate = endDate;
  await booking.save();

  res.json(booking);
});

 // Get bookings for a specific spot
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const userId = req.user.id;
  
    const spot = await Spot.findByPk(spotId);
  
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
  
    const isOwner = spot.ownerId === userId;
  
    const bookings = await Booking.findAll({
      where: { spotId },
      include: isOwner ? [{ model: User, attributes: ['id', 'firstName', 'lastName'] }] : [],
      attributes: isOwner ? undefined : ['spotId', 'startDate', 'endDate']
    });
  
    res.json({ Bookings: bookings });
  });
  
  // Create a booking for a specific spot
router.post('/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {
    const { spotId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;
  
    const spot = await Spot.findByPk(spotId);
  
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
  
    if (spot.ownerId === userId) {
      return res.status(403).json({ message: "Owners cannot book their own spots" });
    }
  
    const conflictingBooking = await Booking.findOne({
      where: {
        spotId,
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] }
          },
          {
            endDate: { [Op.between]: [startDate, endDate] }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      }
    });
  
    if (conflictingBooking) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking"
        }
      });
    }
  
    const newBooking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate
    });
  
    res.status(201).json(newBooking);
  });

  module.exports = router;
  
  
// ------------------------------------------
// DELETE /api/bookings/:bookingId - Delete a booking
// ------------------------------------------
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const booking = await Booking.findByPk(bookingId, {
    include: {
      model: Spot,
      attributes: ['ownerId']
    }
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  const isOwner = booking.Spot.ownerId === userId;
  const isBooker = booking.userId === userId;

  if (!isOwner && !isBooker) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const startDate = new Date(booking.startDate);
  const now = new Date();

  if (startDate <= now) {
    return res.status(403).json({
      message: "Bookings that have started can't be deleted"
    });
  }

  await booking.destroy();
  res.json({ message: 'Successfully deleted' });
});