const express = require("express");
const { connectDB } = require("./config/database");
const app = express();

require("dotenv").config(); //for env

// const { User } = require("./models/user");
const { ReturnDocument } = require("mongodb");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   })
);

app.get("/", (req, res) => {
   console.log("working");
   res.send("yes");
});

connectDB()
   .then(() => {
      console.log("connection to clusterDB successful");
      app.listen(9999, () => {
         console.log("express Server is up and running on port 9999");
      });
   })
   .catch((err) => {
      console.error("connection to clusterDB failed", err);
   });
