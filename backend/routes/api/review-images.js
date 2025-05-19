const express = require('express');
const { ReviewImage, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router();


router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;


  const image = await ReviewImage.findByPk(imageId, {
    include: {
      model: Review,
      attributes: ['userId'] 
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