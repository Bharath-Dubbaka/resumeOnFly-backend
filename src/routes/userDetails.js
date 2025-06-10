const express = require("express");
const userDetailsRouter = express.Router();
// src/routes/userDetails.js
const { UserDetails } = require("../models/userDetails");
const verifyFirebaseToken = require("../middleware/authMiddleware");

//WE NEED TO CREATE DEFAULT USER DETAILS ASA USER SIGN UP FOR FIRST TIME , IF USER_DETAILS EXISTS ALREADY THEN DON'T
//ON UI SIde of things we only have one btn for signup and signin .. if user details exists we redirect to dashboard for generating new version .. if no user details already in db then create new default quota and default user details and then redirect to userFormPage to fill out more info before dashboard and generating new versions


// ========== GET USER DETAILS ==========
userDetailsRouter.get(
   "/api/user-details",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         console.log("Fetching user details for:", req.user.uid);

         const userDetails = await UserDetails.findOne({ uid: req.user.uid });

         if (!userDetails) {
            console.log("No user details found, returning empty structure");
            // Return empty structure if no details found
            return res.json({
               success: true,
               data: {
                  uid: req.user.uid,
                  fullName: "",
                  email: req.user.email || "",
                  phone: "",
                  certifications: [],
                  customSkills: [],
                  education: [],
                  experience: [],
                  projects: [],
               },
               message: "No user details found, empty structure returned",
            });
         }

         console.log("User details fetched successfully");

         res.json({
            success: true,
            data: userDetails,
            message: "User details fetched successfully",
         });
      } catch (error) {
         console.error("Error fetching user details:", error);
         res.status(500).json({
            success: false,
            message: "Failed to fetch user details",
            error: error.message,
         });
      }
   }
);

// ========== CREATE/UPDATE USER DETAILS ==========
userDetailsRouter.post(
   "/api/user-details",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         console.log("Saving user details for:", req.user.uid);
         console.log("Request body keys:", Object.keys(req.body));

         // Prepare update data, ensuring UID matches authenticated user
         const updateData = {
            ...req.body,
            uid: req.user.uid, // Always use authenticated user's UID
            email: req.user.email || req.body.email, // Use Firebase email as fallback
         };

         // Remove any undefined or null values at the top level
         Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
               delete updateData[key];
            }
         });

         console.log("Updating with data keys:", Object.keys(updateData));

         const userDetails = await UserDetails.findOneAndUpdate(
            { uid: req.user.uid },
            updateData,
            {
               new: true,
               upsert: true, // Create if doesn't exist
               runValidators: true,
            }
         );

         console.log("User details saved successfully");

         res.json({
            success: true,
            data: userDetails,
            message: "User details saved successfully",
         });
      } catch (error) {
         console.error("Error saving user details:", error);

         // Handle validation errors specifically
         if (error.name === "ValidationError") {
            const validationErrors = Object.keys(error.errors).map((key) => ({
               field: key,
               message: error.errors[key].message,
               value: error.errors[key].value,
            }));

            return res.status(400).json({
               success: false,
               message: "Validation failed",
               errors: validationErrors,
            });
         }

         // Handle duplicate key errors
         if (error.code === 11000) {
            return res.status(409).json({
               success: false,
               message: "User details already exist",
               error: "Duplicate entry",
            });
         }

         res.status(500).json({
            success: false,
            message: "Failed to save user details",
            error: error.message,
         });
      }
   }
);

// ========== UPDATE SPECIFIC SECTION ========== WHY/WHERE WOULD WE NEED THIS ?
userDetailsRouter.patch(
   "/api/user-details/:section",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         const { section } = req.params;
         const updateData = req.body;

         console.log(`Updating ${section} for user:`, req.user.uid);

         // Validate section
         const allowedSections = [
            "fullName",
            "email",
            "phone",
            "certifications",
            "customSkills",
            "education",
            "experience",
            "projects",
         ];
         if (!allowedSections.includes(section)) {
            return res.status(400).json({
               success: false,
               message: `Invalid section. Allowed: ${allowedSections.join(
                  ", "
               )}`,
            });
         }

         // Prepare update object
         const update = {};
         update[section] = updateData.value || updateData;

         const userDetails = await UserDetails.findOneAndUpdate(
            { uid: req.user.uid },
            { $set: update },
            {
               new: true,
               upsert: true,
               runValidators: true,
            }
         );

         console.log(`${section} updated successfully`);

         res.json({
            success: true,
            data: userDetails,
            message: `${section} updated successfully`,
         });
      } catch (error) {
         console.error(`Error updating ${req.params.section}:`, error);

         if (error.name === "ValidationError") {
            return res.status(400).json({
               success: false,
               message: "Validation failed",
               errors: Object.keys(error.errors).map((key) => ({
                  field: key,
                  message: error.errors[key].message,
               })),
            });
         }

         res.status(500).json({
            success: false,
            message: `Failed to update ${req.params.section}`,
            error: error.message,
         });
      }
   }
);

// ========== DELETE USER DETAILS ========== WE CAN USE IT IN HEADER DROPDOWN
userDetailsRouter.delete(
   "/api/user-details",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         console.log("Deleting user details for:", req.user.uid);

         const result = await UserDetails.findOneAndDelete({
            uid: req.user.uid,
         });

         if (!result) {
            return res.status(404).json({
               success: false,
               message: "User details not found",
            });
         }

         console.log("User details deleted successfully");

         res.json({
            success: true,
            message: "User details deleted successfully",
         });
      } catch (error) {
         console.error("Error deleting user details:", error);
         res.status(500).json({
            success: false,
            message: "Failed to delete user details",
            error: error.message,
         });
      }
   }
);

// ========== ADD ITEM TO ARRAY FIELD ========== i DON'T THINK WE NEED IT
userDetailsRouter.post(
   "/api/user-details/:section/add",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         const { section } = req.params;
         const newItem = req.body;

         console.log(`Adding item to ${section} for user:`, req.user.uid);

         // Validate section is an array field
         const arrayFields = [
            "certifications",
            "customSkills",
            "education",
            "experience",
            "projects",
         ];
         if (!arrayFields.includes(section)) {
            return res.status(400).json({
               success: false,
               message: `Invalid section. Array fields: ${arrayFields.join(
                  ", "
               )}`,
            });
         }

         const userDetails = await UserDetails.findOneAndUpdate(
            { uid: req.user.uid },
            { $push: { [section]: newItem } },
            {
               new: true,
               upsert: true,
               runValidators: true,
            }
         );

         console.log(`Item added to ${section} successfully`);

         res.json({
            success: true,
            data: userDetails,
            message: `Item added to ${section} successfully`,
         });
      } catch (error) {
         console.error(`Error adding item to ${req.params.section}:`, error);

         if (error.name === "ValidationError") {
            return res.status(400).json({
               success: false,
               message: "Validation failed",
               errors: Object.keys(error.errors).map((key) => ({
                  field: key,
                  message: error.errors[key].message,
               })),
            });
         }

         res.status(500).json({
            success: false,
            message: `Failed to add item to ${req.params.section}`,
            error: error.message,
         });
      }
   }
);

// ========== REMOVE ITEM FROM ARRAY FIELD ========== DON'T NEED
userDetailsRouter.delete(
   "/api/user-details/:section/:index",
   verifyFirebaseToken,
   async (req, res) => {
      try {
         const { section, index } = req.params;

         console.log(
            `Removing item at index ${index} from ${section} for user:`,
            req.user.uid
         );

         // Validate section is an array field
         const arrayFields = [
            "certifications",
            "customSkills",
            "education",
            "experience",
            "projects",
         ];
         if (!arrayFields.includes(section)) {
            return res.status(400).json({
               success: false,
               message: `Invalid section. Array fields: ${arrayFields.join(
                  ", "
               )}`,
            });
         }

         // First, get the user details to access the array
         const userDetails = await UserDetails.findOne({ uid: req.user.uid });

         if (!userDetails) {
            return res.status(404).json({
               success: false,
               message: "User details not found",
            });
         }

         // Check if index is valid
         const arrayField = userDetails[section];
         if (
            !arrayField ||
            parseInt(index) >= arrayField.length ||
            parseInt(index) < 0
         ) {
            return res.status(400).json({
               success: false,
               message: "Invalid index",
            });
         }

         // Remove the item at the specified index
         arrayField.splice(parseInt(index), 1);

         // Save the updated document
         await userDetails.save();

         console.log(`Item removed from ${section} successfully`);

         res.json({
            success: true,
            data: userDetails,
            message: `Item removed from ${section} successfully`,
         });
      } catch (error) {
         console.error(
            `Error removing item from ${req.params.section}:`,
            error
         );
         res.status(500).json({
            success: false,
            message: `Failed to remove item from ${req.params.section}`,
            error: error.message,
         });
      }
   }
);

//basic level of example
userDetailsRouter.get("/userDetails", async (req, res) => {
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
