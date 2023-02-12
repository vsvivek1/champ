const mongoose = require("mongoose");
let AccesTocken = require(".././models/AccessTokens");
let today1 = new Date().toISOString().slice(0, 10);

module.exports = async function getAccessToken(today=today1) {
  try {
    const uri =
      "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log("mongo db connected");

    let access_token = await AccesTocken.findOne({ date: today }, "access_token").then(e => {
      return e.access_token;
    });

    access_token_global = access_token;
    console.log("access_token: ", access_token);

    return access_token;
  } catch (error) {
    console.log("mongo db connect error", error);
  }
};
