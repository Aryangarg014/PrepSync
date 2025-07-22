const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then((res) => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log("Database connection error: ", error);
  });

app.get("/", (req, res) => {
  res.send("server working");
});

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
