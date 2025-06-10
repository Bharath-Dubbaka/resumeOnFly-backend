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
const verifyFirebaseToken = require("./middleware/authMiddleware");
const { quotasRouter } = require("./routes/quotas");
const { userDetailsRouter } = require("./routes/userDetails");

app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);

app.use("/", quotasRouter, userDetailsRouter);

app.get("/", verifyFirebaseToken, (req, res) => {
   try {
      res.json({
         message: "Protected route accessed",
         user: { uid: req.user.uid, email: req.user.email },
      });
   } catch (error) {
      console.log(error, "error");
   }
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
