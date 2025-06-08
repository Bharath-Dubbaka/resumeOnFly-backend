const express = require("express");
const userDetailsRouter = express.Router();



//basic level of example
userDetailsRouter.get("/quota", async (req, res) => {
   try {
      const user = req.user; // coming from middleware
      console.log("quota", user);
      res.send(user);
   } catch (err) {
      res.status(400).send(" NOT done :::" + err.message);
      console.log(" NOT done", err.message);
   }
});

module.exports = { userDetailsRouter };
