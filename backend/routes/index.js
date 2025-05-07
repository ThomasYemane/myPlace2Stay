const express = require('express');
const path = require('path');
const router = express.Router();
const apiRouter = require('./api');

router.use('/api', apiRouter);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve index.html at root
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });

  // Serve static assets
  router.use(express.static(path.resolve("../frontend/dist")));

  // Serve index.html for all non-API routes
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
}

// XSRF token route for development
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.json({ 'XSRF-Token': req.csrfToken() });
  });
}

module.exports = router;
