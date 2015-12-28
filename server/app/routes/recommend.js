'use strict';

var router = require('express').Router(),
  fsHelper = require('./foursquare-helper'),
  _ = require('lodash');

module.exports = router;

var ensureAuthenticated = function(req, res, next) {
  next();
}

router.post('/', ensureAuthenticated, function (req, res) {
  var prefs = req.body;
  var ll = req.query.lat+","+req.query.long;
  var params = {
    'll': ll,
    'categoryId': '4d4b7105d754a06374d81259',
    'radius': 1000
   };
   fsHelper.venues(params)
   .then(venues => venues.map(v =>
     _.pick(v, 'id', 'name', 'location', 'categories', 'attributes', 'stats', 'details', 'url' )
   ))
  .then(venues => makeRecommendation(prefs, venues))
  .then(arr => res.json(arr))
  .catch(function(err) { res.sendStatus(404); })
});

var makeRecommendation = function(prefs, venueList) {
  venueList.forEach(venue => {
    let venueRank = 0;
    let venueWeight = 70;
    let catRank = 0;
    let catCount = 0;
    let catWeight = 30;

    // check if liked/disliked venue
    if(prefs.venue[venue.id]) {
      let likes = prefs.venue[venue.id].likes;
      let dislikes = prefs.venue[venue.id].dislikes;
      venueRank = venueWeight*(likes - dislikes)/prefs.count;
    }

    // check if liked/disliked tags...
    venue.categories.forEach(c => {
      let name = c.shortName;
      if(prefs.tag[name]) {
        catRank += (prefs.tag[name].likes - prefs.tag[name].dislikes)/prefs.count;
        catCount++;
      }
    });
    if(catCount) { catRank = catWeight*catRank/catCount; }

    venue.nomzRank = venueRank + catRank;
  });

  return _.sortBy(venueList, 'nomzRank').reverse();
}
