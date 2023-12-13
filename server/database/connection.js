const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    // mongodb connection string
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb connected : ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDb;
