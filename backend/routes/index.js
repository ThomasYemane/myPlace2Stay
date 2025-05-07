const express = require('express');
const router = express.Router();

const apiRouter = require('./api');

// Mount the main API router
router.use('/api', apiRouter);

// 404 Route Handler (Catch-all for undefined routes)
router.use((req, res, next) => {
  const err = new Error("Route not found");
  err.status = 404;
  next(err);
});

module.exports = router;
