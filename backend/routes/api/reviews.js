// backend/routes/api/reviews.js

const express = require('express');
const { Op } = require('sequelize');
const { Review, ReviewImage, User, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//validation middleware
const validateReview = [
    check('review')
      .exists({ checkFalsy: true })
      .withMessage('Review text is required'),
    check('stars')
      .exists({ checkFalsy: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
  ];

  //GET /api/reviews/current
  router.get('/current', requireAuth, async (req, res) => {
    const userId = req.user.id;
  
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Spot,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          include: [
            {
              model: SpotImage,
              where: { preview: true },
              required: false,
              attributes: ['url']
            }
          ]
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ]
    });
  
    const formatted = reviews.map(review => {
      const reviewJSON = review.toJSON();
      reviewJSON.Spot.previewImage = reviewJSON.Spot.SpotImages?.[0]?.url || null;
      delete reviewJSON.Spot.SpotImages;
      return reviewJSON;
    });
  
    res.json({ Reviews: formatted });
  });

  //POST /api/reviews/:reviewId/images
  router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
    const { reviewId } = req.params;
    const { url } = req.body;
  
    const review = await Review.findByPk(reviewId);
  
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
  
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    const imagesCount = await ReviewImage.count({
      where: { reviewId }
    });
  
    if (imagesCount >= 10) {
      return res.status(403).json({
        message: 'Maximum number of images for this resource was reached'
      });
    }
  
    const newImage = await ReviewImage.create({
      reviewId,
      url
    });
  
    res.status(201).json({
      id: newImage.id,
      url: newImage.url
    });
  });

  //PUT /api/reviews/:reviewId - edit review
  router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
    const { reviewId } = req.params;
    const { review, stars } = req.body;
  
    const existingReview = await Review.findByPk(reviewId);
  
    // Step 5: Check if review exists
    if (!existingReview) {
      return res.status(404).json({
        message: "Review couldn't be found"
      });
    }
  
    // Step 6: Check if current user owns the review
    if (existingReview.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    // Step 7: Update review
    existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();
  
    // Step 8 & 9: Return updated review
    return res.json(existingReview);
  });

  //DELETE /api/reviews/:reviewId - Deelet a Review
  router.delete('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
  
    // Step 4: Find review by ID
    const review = await Review.findByPk(reviewId);
  
    // Step 5: Check if review exists
    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found"
      });
    }
  
    // Step 6: Check if current user owns the review
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    // Step 7: Delete the review
    await review.destroy();
  
    // Step 8: Return success message
    return res.json({
      message: "Successfully deleted"
    });
  });

  

  module.exports = router;