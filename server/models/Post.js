const postsCollection = require("../db").db().collection("posts");
const { ObjectId, FindCursor } = require("mongodb");

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

Post.findSingleById = function (id) {
  return new Promise(async function (resolve, reject) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      reject();
      return;
    }
    // let post = await postsCollection.findOne({ _id: new ObjectId(id) });
    let posts = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
        {
          $project: {
            body: 1,
            createdDate: 1,
            author: { $arrayElemAt: ["$authorDocument", 0] }
          }
        }
      ])
      .toArray();

    // cleanup author property in each post object
    posts = posts.map(function (post) {
      post.author = {
        username: post.author.username
      };
      return post;
    });
    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

module.exports = Post;
