const User = require("../models/User");

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest", { errors: req.flash("errors"), regErrors: req.flash("regErrors") });
  }
};

exports.register = function (req, res) {
  let user = new User(req.body);
  user.register();
  if (user.errors.length) {
    user.errors.forEach(function (error) {
      req.flash("regErrors", error);
    });
    req.session.save(function () {
      // Can do redirect outside save but this is expensive operation
      // and needs to wait to complete
      res.redirect("/");
    });
  } else {
    res.send("Validation Success");
  }
};

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { favColor: "blue", username: user.data.username };
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
