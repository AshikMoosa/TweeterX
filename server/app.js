const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
const app = express();
const router = require("./router");

// Setup session
let sessionOptions = session({
  secret: "Javascript is sooooo cool",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
});

app.use(sessionOptions);
app.use(flash());

// Read 2 types of form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Access permission to public folder
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Render Home-Guest Page
app.use("/", router);

module.exports = app;
