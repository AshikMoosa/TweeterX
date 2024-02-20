const postsCollection = require("../db").db().collection("posts");
const { ObjectId } = require("mongodb");

let Post = function (data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.body !== "string") this.data.body = "";

  // get rid of bogus property send by user
  this.data = {
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: new ObjectId(this.userid)
  };
};

Post.prototype.validate = function () {
  if (this.data.body === "") {
    this.errors.push("You must provide post content.");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();

    if (!this.errors.length) {
      // save post to database
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Post;
