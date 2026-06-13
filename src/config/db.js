const mongoose = require("mongoose");

const connectDB = async () => {
  console.log(process.env.MONGO_URI);

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;