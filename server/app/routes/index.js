'use strict';
var router = require('express').Router();
var bodyParser = require('body-parser');

module.exports = router;

router.use('/users', require('./users'));
router.use('/game', require('./game.js'));
router.use('/venue', require('./venue.js'));
router.use('/feed', require('./feed.js'));
router.use('/recommend', require('./recommend.js'));
router.use('/upload', require('./image-upload.js'));

// Make sure this is after all of
// the registered routes!
router.use(function(req, res) {
  res.status(404).end();
});
