const bcrypt = require("bcryptjs");
const usersCollection = require("../db").db().collection("users");
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
  return new Promise(async (resolve, reject) => {
    if (this.data.username === "") this.errors.push("You must provide a username.");
    if (this.data.username.length > 0 && this.data.username.length < 3) this.errors.push("Username must be atleast 3 characters");
    if (this.data.username.length > 20) this.errors.push("Username cannot exceed 20 characters");
    if (this.data.username !== "" && !validator.isAlphanumeric(this.data.username)) this.errors.push("Username must contain only letters and digits");
    if (this.data.email === "") this.errors.push("You must provide an email");
    if (!validator.isEmail(this.data.email)) this.errors.push("You must provide valid email");
    if (this.data.password === "") this.errors.push("You must provide a password");
    if (this.data.password.length > 0 && this.data.password.length < 6) this.errors.push("Password must be atleast 6 characters");
    if (this.data.confirmPassword !== this.data.password) this.errors.push("Passwords don't match");

    // Only if username is valid then check to see if its already taken
    if (this.data.username.length > 2 && this.data.username.length < 21 && validator.isAlphanumeric(this.data.username)) {
      // Checks if username exists in database else null
      let usernameExists = await usersCollection.findOne({ username: this.data.username });
      if (usernameExists) {
        this.errors.push("That username is already taken");
      }
    }

    // Only if email is valid then check to see if its already taken
    if (validator.isEmail(this.data.email)) {
      // Checks if username exists in database else null
      let emailExists = await usersCollection.findOne({ email: this.data.email });
      if (emailExists) {
        this.errors.push("That email is already taken");
      }
    }

    resolve();
  });
};

// all instances of User will only have access to register method
// not all instances will create a register method - optimisation
User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // Validate user data
    this.cleanUp();
    await this.validate();

    // Only if there are no valid error
    // Then save user data into database
    if (!this.errors.length) {
      // Hash user password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      this.data.confirmPassword = bcrypt.hashSync(this.data.confirmPassword, salt);

      // Store user entered data to db
      await usersCollection.insertOne(this.data);
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.login = async function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    // Mongo Verify username - matching form data with db data
    const attemptedUser = await usersCollection.findOne({ username: this.data.username });
    if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
      this.data = attemptedUser;
      resolve("Congrats! Valid username and password");
    } else {
      reject("Sorry Invalid credentials");
    }
  });
};

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username !== "string") {
      reject();
      return;
    }

    usersCollection
      .findOne({ username: username })
      .then(function (userDoc) {
        if (userDoc) {
          userDoc = new User(userDoc);
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username
          };
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(function () {
        reject();
      });
  });
};

module.exports = User;
