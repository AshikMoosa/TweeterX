const User = require("../models/User");
const Post = require("../models/Post");

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action!");
    req.session.save(function () {
      // Can do redirect outside save but this is expensive operation
      // and needs to wait to complete
      res.redirect("/");
    });
  }
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest", { errors: req.flash("errors"), regErrors: req.flash("regErrors") });
  }
};

exports.register = function (req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username, _id: user.data._id };
      req.session.save(function () {
        // Can do redirect outside save but this is expensive operation
        // and needs to wait to complete
        res.redirect("/");
      });
    })
    .catch((regErrors) => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error);
      });
      req.session.save(function () {
        // Can do redirect outside save but this is expensive operation
        // and needs to wait to complete
        res.redirect("/");
      });
    });
};

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { favColor: "blue", username: user.data.username, _id: user.data._id };
      req.session.save(function () {
        // Can do redirect outside save but this is expensive operation
        // and needs to wait to complete
        res.redirect("/");
      });
    })
    .catch(function (e) {
      req.flash("errors", e);
      req.session.save(function () {
        // Can do redirect outside save but this is expensive operation
        // and needs to wait to complete
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    // Can do redirect outside destroy but this is expensive operation
    // and needs to wait to complete
    res.redirect("/");
  });
};

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument;
      console.log(req.profileUser);
      next();
    })
    .catch(function () {
      res.render("404");
    });
};

exports.profilePostsScreen = function (req, res) {
  // ask our post model for posts by a certain author id
  Post.findByAuthorId(req.profileUser._id)
    .then(function (posts) {
      res.render("profile", {
        posts: posts,
        profileUsername: req.profileUser.username
      });
    })
    .catch(function () {
      res.render("404");
    });
};
