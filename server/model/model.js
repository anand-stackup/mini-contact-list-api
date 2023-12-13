const mongoose = require("mongoose");

var schema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    requied: true,
  },
  email: {
    type: String,
    requied: true,
  },
  phone: {
    type: String,
    requied: true,
  },
  avatar: {
    type: String
  },
  status: {
    type: String,
    requied: true,
  },
});

// data collection model 
const Contacts = mongoose.model("contact", schema);

module.exports = Contacts;
