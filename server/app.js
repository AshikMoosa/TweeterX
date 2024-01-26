const express = require("express");
const path = require("path");
const app = express();
const router = require("./router");

// Read 2 types of form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Access permission to public folder
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Render Home-Guest Page
app.use("/", router);

app.listen(3000);
