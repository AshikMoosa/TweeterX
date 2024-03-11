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

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id);
    res.render("edit-post", { post: post });
  } catch {
    res.render("404");
  }
};

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      // post was successfully updated in db
      // or user did have permission but validation error
      if (status === "success") {
        // post was updated in db
        req.flash("success", "Post successfully updated");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        post.errors.forEach(function (error) {
          req.flash("errors", errors);
        });
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      // a post with requested id doesn't exist
      // or if current visitor is not owner of post
      req.flash("errors", "You do not have permission to perform that action");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};
