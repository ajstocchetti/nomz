var router = require('express').Router();
var AWS = require('aws-sdk');
var bucket = process.env.AWSBUCKET
var User = require('mongoose').model('User');


router.get('/', function(req, res) {
  res.sendStatus(200);
});

router.post('/', function(req, res) {
  var image=req.body.image;
  var buf = new Buffer(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
  var user=req.body.user;

  var now = new Date();
  var key = user + now.getTime() + '.jpeg';
  var imgUrl = "https://nomz-photos.s3.amazonaws.com/" + key;
  var s3 = new AWS.S3({params: {Bucket: bucket}});
  s3.putObject({
      Key: key,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    },
    function(err, data) {
      if(!err) {
        // image saved correctly
        var post = {
          imageUrl: imgUrl,
          date: now,
          caption: req.body.caption,
          menuItem: req.body.item
        };
        User.findOneAndUpdate(
          {_id: user},
          {$push: {posts: post}},
          {safe: true, upsert: true},
          function(err, model) {
            if(err) console.log(err);
            else res.sendStatus(200);
          }
        );
      } else {
        console.log(err);
      }
    }
  );
})

module.exports = router;
