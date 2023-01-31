require('dotenv').config()
var mongo = require('mongodb'); 
var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://127.0.0.1:9090:27017/mydb";

const url=process.env.MONGO_URL+process.env.DB_NAME;

const myDbName=process.env.DB_NAME;

// let db='myDb'

console.log('thisis the db to be crated',myDbName,url)
MongoClient.connect(url, 
    {
    useNewUrlParser: true,
   useUnifiedTopology: true},
   
    function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });


  

  
  MongoClient.connect(url, {
    useNewUrlParser: true,
   useUnifiedTopology: true}, function(err, db) {
    // console.log('dbname',db)

    if (err) throw err;
    var dbo = db.db(myDbName);
    dbo.createCollection("access_tokens", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });

  