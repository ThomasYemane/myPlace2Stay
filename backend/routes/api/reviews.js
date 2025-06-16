const express = require('express');
const { Op } = require('sequelize');
const { Review, ReviewImage, User, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validation middleware
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
// GET /api/spotId
router.get('/:spotId', async (req, res) => {
  const { spotId } = req.params;

  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });
  //const reviewsData = reviews.toJSON();

  res.json(reviews);
});

// GET /api/reviews/current
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

// POST /api/reviews/:reviewId/images
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

// PUT /api/reviews/:reviewId - Edit review
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;

  const existingReview = await Review.findByPk(reviewId);

  if (!existingReview) {
    return res.status(404).json({
      message: "Review couldn't be found"
    });
  }

  if (existingReview.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  existingReview.review = review;
  existingReview.stars = stars;
  await existingReview.save();

  return res.json(existingReview);
});


router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByPk(reviewId);

  if (!review) {
    return res.status(404).json({
      message: "Review couldn't be found"
    });
  }

  if (review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await review.destroy();

  return res.json({
    message: "Successfully deleted"
  });
});

// DELETE /api/review-images/:imageId - Delete a review image
router.delete('/images/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;

  const reviewImage = await ReviewImage.findByPk(imageId, {
    include: {
      model: Review
    }
  });

  if (!reviewImage) {
    return res.status(404).json({
      message: "Review image couldn't be found"
    });
  }

  if (reviewImage.Review.userId !== req.user.id) {
    return res.status(403).json({
      message: "Forbidden"
    });
  }

  await reviewImage.destroy();

  return res.json({ message: 'Successfully deleted' });
});

module.exports = router;
