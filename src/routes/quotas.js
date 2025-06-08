const express = require("express");
const quotasRouter = express.Router();

//basic level of example
quotasRouter.get("/quota", async (req, res) => {
   try {
      const user = req.user; // coming from middleware
      console.log("quota", user);
      res.send(user);
   } catch (err) {
      res.status(400).send(" NOT done :::" + err.message);
      console.log(" NOT done", err.message);
   }
});

module.exports = { quotasRouter };
