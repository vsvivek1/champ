const mongoose=require('mongoose');
require('dotenv').config();
const url=process.env.MONGO_URL
// +process.env.DB_NAME;

const myDbName=process.env.DB_NAME;
// mongoose.connect(url+myDbName,{ useNewUrlParser: true,useUnifiedTopology: true });

class Database{

    constructor(){

        this._connect();
    }

    _connect() {
        mongoose.connect(`mongodb://${url}/${myDbName}`,{ useNewUrlParser: true,useUnifiedTopology: true })
          .then(() => {
            console.log('Database connection successful')
          })
          .catch(err => {
            console.error('Database connection error')
          })
}
}
// module.exports = new Database()