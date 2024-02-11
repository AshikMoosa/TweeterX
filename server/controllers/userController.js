const User = require("../models/User");

exports.home = function (req, res) {
  if (req.session.user) {
    res.send("Welcome to actual App");
  } else {
    res.render("home-guest");
  }
};

exports.register = function (req, res) {
  let user = new User(req.body);
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
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
      res.send(result);
    })
    .catch(function (e) {
      res.send(e);
    });
};
