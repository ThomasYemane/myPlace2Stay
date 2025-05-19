// backend/routes/api/spot-images.js
const express = require('express');
const router = express.Router();
const { SpotImage, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


router.delete('/:imageId', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await SpotImage.findByPk(imageId, {
      include: {
        model: Spot,
        attributes: ['ownerId']
      }
    });

    if (!image) {
      return res.status(404).json({ message: "Spot image couldn't be found" });
    }

    if (image.Spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this spot" });
    }

    await image.destroy();
    return res.json({ message: 'Successfully deleted the image' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;