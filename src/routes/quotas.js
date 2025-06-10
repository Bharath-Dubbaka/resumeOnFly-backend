const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const quotasRouter = express.Router();
const { Quota } = require("../models/quotas");

//basic level of example
quotasRouter.get("/quota", verifyFirebaseToken, async (req, res) => {
   try {
      const user = req.user; // coming from middleware
      console.log("quota", user);
      res.send(user);
   } catch (err) {
      res.status(400).send(" NOT done :::" + err.message);
      console.log(" NOT done", err.message);
   }
});

quotasRouter.get("/api/quota/:uid", async (req, res) => {
   try {
      const quota = await Quota.findOne({ uid: req.params.uid });
      if (!quota) return res.status(404).json({ error: "Quota not found" });
      res.json(quota);
   } catch (err) {
      res.status(500).json({ error: "Server error" });
   }
});

module.exports = { quotasRouter };
