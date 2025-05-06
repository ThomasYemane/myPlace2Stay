const express = require('express');
const { ReviewImage, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router();

// DELETE /api/review-images/:imageId
router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;

  // Find the image and include the associated review for ownership check
  const image = await ReviewImage.findByPk(imageId, {
    include: {
      model: Review,
      attributes: ['userId'] // Needed to check if the current user owns the review
    }
  });

  if (!image) {
    return res.status(404).json({ message: "Review image couldn't be found" });
  }

  if (image.Review.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You are not the owner of this review' });
  }

  await image.destroy();

  return res.json({ message: 'Successfully deleted the image' });
});

module.exports = router;