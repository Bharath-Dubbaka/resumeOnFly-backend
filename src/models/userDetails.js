const mongoose = require("mongoose");

const MAX_ARRAY_LENGTH = 20; // prevents abuse from users entering 1000 projects etc

const certificationSchema = new mongoose.Schema(
   {
      name: { type: String, trim: true },
      issuer: { type: String, trim: true },
      issueDate: { type: String, trim: true }, // Keeping string as per original
      expiryDate: { type: String, trim: true },
   },
   { _id: false }
);

const customSkillSchema = new mongoose.Schema(
   {
      skill: { type: String, trim: true },
      experienceMappings: {
         type: [String],
         default: [],
         validate: (arr) => arr.length <= 10,
      },
   },
   { _id: false }
);

const educationSchema = new mongoose.Schema(
   {
      degree: { type: String, trim: true },
      field: { type: String, trim: true },
      institution: { type: String, trim: true },
      location: { type: String, trim: true },
      grade: { type: String, trim: true },
      startDate: { type: String, trim: true },
      endDate: { type: String, trim: true },
   },
   { _id: false }
);

const experienceSchema = new mongoose.Schema(
   {
      title: { type: String, trim: true },
      employer: { type: String, trim: true },
      location: { type: String, trim: true },
      startDate: { type: String, trim: true },
      endDate: { type: String, trim: true },
      responsibilityType: {
         type: String,
         enum: ["skillBased", "manual", ""],
         default: "skillBased",
      },
      customResponsibilities: {
         type: [String],
         default: [],
         validate: (arr) => arr.length <= 15,
      },
   },
   { _id: false }
);

const projectSchema = new mongoose.Schema(
   {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      link: { type: String, trim: true },
      technologies: { type: String, trim: true },
      startDate: { type: String, trim: true },
      endDate: { type: String, trim: true },
   },
   { _id: false }
);

const userDetailsSchema = new mongoose.Schema(
   {
      uid: {
         type: String,
         required: true,
         unique: true,
         trim: true, //remove whitespace from the beginning and end
      },
      fullName: {
         type: String,
         trim: true,
         maxLength: 40,
      },
      email: {
         type: String,
         trim: true,
         
         lowercase: true,
         maxLength: 50,
      },
      phone: {
         type: String,
         trim: true,
         maxLength: 20,
      },
      certifications: {
         type: [certificationSchema],
         default: [],
         validate: (arr) => arr.length <= MAX_ARRAY_LENGTH,
      },
      customSkills: {
         type: [customSkillSchema],
         default: [],
         validate: (arr) => arr.length <= MAX_ARRAY_LENGTH,
      },
      education: {
         type: [educationSchema],
         default: [],
         validate: (arr) => arr.length <= MAX_ARRAY_LENGTH,
      },
      experience: {
         type: [experienceSchema],
         default: [],
         validate: (arr) => arr.length <= MAX_ARRAY_LENGTH,
      },
      projects: {
         type: [projectSchema],
         default: [],
         validate: (arr) => arr.length <= MAX_ARRAY_LENGTH,
      },
   },
   { timestamps: true }
);

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);
module.exports = { UserDetails };
