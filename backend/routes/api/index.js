const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const spotImagesRouter = require('./spot-images');
const reviewsRouter = require('./reviews.js');
const reviewImagesRouter = require('./review-images');
const bookingsRouter = require('./bookings.js');
const { restoreUser } = require("../../utils/auth.js");

// 🔒 CSRF Restore Route (must come first)
router.get('/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('XSRF-TOKEN', csrfToken);
  res.status(200).json({ 'XSRF-Token': csrfToken });
});

// 🔐 Restore user middleware
router.use(restoreUser);

// ✅ All API routers
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter);
router.use('/spot-images', spotImagesRouter);
router.use('/reviews', reviewsRouter);
router.use('/review-images', reviewImagesRouter);
router.use('/bookings', bookingsRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
