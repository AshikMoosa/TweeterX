const postsCollection = require("../db").db().collection("posts");
const { ObjectId, FindCursor } = require("mongodb");

let Post = function (data, userid, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
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

Post.reusablePostQuery = function (uniqueOperations, visitorId) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
      {
        $project: {
          body: 1,
          createdDate: 1,
          authorId: "$author",
          author: { $arrayElemAt: ["$authorDocument", 0] }
        }
      }
    ]);

    let posts = await postsCollection.aggregate(aggOperations).toArray();

    // cleanup author property in each post object
    posts = posts.map(function (post) {
      post.isVisitorOwner = post.authorId.equals(visitorId);

      post.author = {
        username: post.author.username
      };
      return post;
    });

    resolve(posts);
  });
};

Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      reject();
      return;
    }

    let posts = await Post.reusablePostQuery([{ $match: { _id: new ObjectId(id) } }], visitorId);

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([{ $match: { author: authorId } }, { $sort: { createdDate: -1 } }]);
};

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid);
      if (post.isVisitorOwner) {
        // actually update db
        let status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();

    if (!this.errors.length) {
      await postsCollection.findOneAndUpdate({ _id: new ObjectId(this.requestedPostId) }, { $set: { title: this.data.title, body: this.data.body } });
      resolve("success");
    } else {
      resolve("failure");
    }
  });
};

module.exports = Post;
