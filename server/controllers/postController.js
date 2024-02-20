const Post = require("../models/Post");

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id);

  post
    .create()
    .then(function () {
      res.send("New post created");
    })
    .catch(function (errors) {
      res.send(errors);
    });
};
