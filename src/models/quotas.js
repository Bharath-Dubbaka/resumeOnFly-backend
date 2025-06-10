// src/models/quota.js
const mongoose = require("mongoose");

const limitSchema = new mongoose.Schema({
   limit: {
      type: Number,
      required: true,
      default: 10,
   },
   used: {
      type: Number,
      required: true,
      default: 0,
   },
});

const subscriptionSchema = new mongoose.Schema({
   startDate: {
      type: Date,
      required: true,
   },
   endDate: {
      type: Date,
      required: true,
   },
   type: {
      type: String,
      enum: ["free", "premium"], // Add more if needed
      default: "free",
   },
});

const quotaSchema = new mongoose.Schema(
   {
      uid: {
         type: String,
         required: true,
         unique: true, // Each user has one quota doc
      },
      downloads: {
         type: limitSchema,
         required: true,
         default: () => ({}), // initializes defaults inside
      },
      generates: {
         type: limitSchema,
         required: true,
         default: () => ({}),
      },
      parsing: {
         type: limitSchema,
         required: true,
         default: () => ({}),
      },
      subscription: {
         type: subscriptionSchema,
         required: true,
      },
   },
   {
      timestamps: true, // optional, good for tracking
   }
);

const Quota = mongoose.model("Quota", quotaSchema);
module.exports = { Quota };
