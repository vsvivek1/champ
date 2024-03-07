const mongoose = require("mongoose");
let AccesTocken = require(".././models/AccessTokens");
let today1 = new Date().toISOString().slice(0, 10);

module.exports = async function getAccessToken(today = today1) {
  try {
    const uri =
      "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log("mongo db connected");

    let accessToken = await AccesTocken.findOne({ date: today }, "access_token");
    if (!accessToken) {
      console.log("Access token not found for today");
      return null; // or any other default value you prefer
    }

    console.log("access_token: ", accessToken.access_token);

    return accessToken.access_token;
  } catch (error) {
    console.log("Error:", error.message);
    throw error; // rethrow the error to be caught outside of the function
  }
};
