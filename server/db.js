const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb+srv://ashikmoosa96:nG0qYPcPGggjY2ZI@cluster0.ia4df2e.mongodb.net/Tweeter?retryWrites=true&w=majority");

async function start() {
  await client.connect();
  module.exports = client.db();

  // We are starting app after loading db, since we dont how much time to create db
  const app = require("./app");
  app.listen(3000);
}

start();
