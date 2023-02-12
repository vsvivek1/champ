const mongoose = require("mongoose");
let AccesTocken = require("./models/AccessTokens");

module.exports = async function StartServerConnections(app, port, today) {
  try {
    const uri =
      "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    app.listen(port, () => {
      console.log(`Server listening on the port::${port}`);
      console.log("mongo db connected4");
    });

    let access_token = await AccesTocken.findOne({ date: today }, "access_token").then(e => {
      return e.access_token;
    });

    access_token_global = access_token;
    console.log("access_token: ", access_token);

    return access_token;
  } catch (error) {
    console.log("mongo db connect error", error);
    // StartServerConnections()
  }
};
