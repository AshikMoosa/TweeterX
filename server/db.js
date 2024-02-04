const dotenv = require("dotenv");
dotenv.config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.CONNECTIONSTRING)

async function start() {
  await client.connect();
  module.exports = client.db();

  // We are starting app after loading db, since we dont how much time to create db
  const app = require("./app");
  app.listen(process.env.PORT);
}

start();
