const mongoose = require("mongoose");

const connectDB = async () => {
   //    const dbName = "devTinder";
   const uri = process.env.MONGODB_URI;
   //    await mongoose.connect(uri);

   await mongoose.connect(uri);
};

module.exports = { connectDB };
