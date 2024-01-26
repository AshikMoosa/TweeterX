const express = require("express");
const path = require("path");
const app = express();
const router = require("./router");

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Render Home-Guest Page
app.use("/", router);

app.listen(3000);
