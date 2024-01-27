const usersCollection = require("../db").collection("users");
const validator = require("validator");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

// Protection from bad values from form
User.prototype.cleanUp = function () {
  if (typeof this.data.username !== "string") this.data.username = "";
  if (typeof this.data.email !== "string") this.data.email = "";
  if (typeof this.data.password !== "string") this.data.password = "";
  if (typeof this.data.confirmPassword !== "string") this.data.confirmPassword = "";

  // get rid of bogus properties(overriding)
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
    confirmPassword: this.data.confirmPassword
  };
};

// Check for all validation rules under here
User.prototype.validate = function () {
  if (this.data.username === "") this.errors.push("You must provide a username.");
  if (this.data.username.length > 0 && this.data.username.length < 3) this.errors.push("Username must be atleast 3 characters");
  if (this.data.username !== "" && !validator.isAlphanumeric(this.data.username)) this.errors.push("Username must contain only letters and digits");
  if (this.data.email === "") this.errors.push("You must provide an email.");
  if (!validator.isEmail(this.data.email)) this.errors.push("You must provide valid email.");
  if (this.data.password === "") this.errors.push("You must provide a password.");
  if (this.data.password.length > 0 && this.data.password.length < 6) this.errors.push("Password must be atleast 6 characters");
  if (this.data.confirmPassword !== this.data.password) this.errors.push("Passwords don't match");
};

// all instances of User will only have access to register method
// not all instances will create a register method - optimisation
User.prototype.register = function () {
  // Validate user data
  this.cleanUp();
  this.validate();

  // Only if there are no valid error
  // Then save user data into database
  if (!this.errors.length) {
    usersCollection.insertOne(this.data);
  }
};

module.exports = User;
