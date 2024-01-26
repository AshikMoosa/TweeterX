let User = function (data) {
  this.data = data;
};

// all instances of User will only have access to register method
// not all instances will create a register method - optimisation
User.prototype.register = function () {};
module.exports = User;
