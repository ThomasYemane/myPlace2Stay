const express = require('express');
const router = express.Router();

// Import the API router
const apiRouter = require('./api');

// CSRF Token Route
router.get("/api/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});

//router.get('/hello/world', (req, res) => {
//  res.cookie('XSRF-TOKEN', req.csrfToken());
//  res.send('Hello World!');
//});

// Connect it to `/api`
router.use('/api', apiRouter);

// 404 Route Handler (Catch-all for undefined routes)
router.use((req, res, next) => {
    const err = new Error("Route not found");
    err.status = 404;
    next(err);
});

module.exports = router;