const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const quotasRouter = express.Router();
const { Quota } = require("../models/quotas");

const DEFAULT_FREE_QUOTA = {
   downloads: { used: 0, limit: 10 },
   generates: { used: 0, limit: 10 },
   parsing: { used: 0, limit: 10 },
   subscription: {
      type: "free",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
   },
};

const DEFAULT_PREMIUM_QUOTA = {
   downloads: { used: 0, limit: 100 },
   generates: { used: 0, limit: 100 },
   parsing: { used: 0, limit: 100 },
   subscription: {
      type: "premium",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
   },
};

// ===== Refresh if expired =====
function isExpired(endDate) {
   return new Date(endDate) < new Date();
}

function getRenewedQuota(type) {
   const base = type === "premium" ? DEFAULT_PREMIUM_QUOTA : DEFAULT_FREE_QUOTA;
   return {
      ...base,
      subscription: {
         type,
         startDate: new Date().toISOString(),
         endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
   };
   //sending subscription again bcz it replaces the stale/subscription inside default as it is only created once at server start
}

// ========== GET OR CREATE OR REFRESH USER QUOTA ==========
quotasRouter.get("/api/quota", verifyFirebaseToken, async (req, res) => {
   try {
      const uid = req.user.uid;
      let quota = await Quota.findOne({ uid });

      if (!quota) {
         quota = await Quota.create({ uid, ...DEFAULT_FREE_QUOTA });
         return res.json({ success: true, data: quota });
      }

      // Check if expired
      if (isExpired(quota.subscription.endDate)) {
         const newQuota = getRenewedQuota("free");
         quota = await Quota.findOneAndUpdate({ uid }, newQuota, { new: true });
      }

      res.json({ success: true, data: quota });
   } catch (err) {
      console.error("Quota fetch error:", err.message);
      res.status(500).json({ success: false, message: err.message });
   }
});

// ========== INCREMENT USAGE ==========
quotasRouter.post(
   "/api/quota/increment",
   verifyFirebaseToken,
   async (req, res) => {
      const { type } = req.body;
      const validTypes = ["downloads", "generates", "parsing"];
      if (!validTypes.includes(type)) {
         return res
            .status(400)
            .json({ success: false, message: "Invalid type" });
      }

      try {
         const uid = req.user.uid;
         let quota = await Quota.findOne({ uid });

         if (!quota) {
            return res
               .status(404)
               .json({ success: false, message: "Quota not found" });
         }

         // Refresh if expired
         if (isExpired(quota.subscription.endDate)) {
            const refreshedQuota = getRenewedQuota("free");
            quota = await Quota.findOneAndUpdate({ uid }, refreshedQuota, {
               new: true,
            });
         }

         // Check limit
         if (quota[type].used >= quota[type].limit) {
            return res
               .status(403)
               .json({ success: false, message: "Quota exceeded" });
         }

         quota[type].used += 1;
         await quota.save();

         res.json({ success: true, data: quota });
      } catch (err) {
         console.error("Increment error:", err.message);
         res.status(500).json({ success: false, message: err.message });
      }
   }
);

// ========== UPGRADE TO PREMIUM ==========
quotasRouter.post(
   "/api/quota/upgrade",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         const uid = req.user.uid;
         const newQuota = getRenewedQuota("premium");

         const updated = await Quota.findOneAndUpdate({ uid }, newQuota, {
            upsert: true,
            new: true,
         });

         res.json({ success: true, data: updated });
      } catch (err) {
         res.status(500).json({ success: false, message: err.message });
      }
   }
);

module.exports = { quotasRouter };
