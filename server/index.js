// Packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config();

// Routers
const mainRouter = require("./routes/main.router");

const app = express();
const port = 8080;

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/", mainRouter)


mongoose.connect(process.env.MONGO_URI)
  .then((res) => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log("Database connection error: ", error);
  });

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
