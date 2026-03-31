require('dotenv').config()
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI

async function main(){
console.log(uri)
//    await mongoose.connect("mongodb://localhost:27017/aldeia?replicaSet=rs0"); //O nome rs0 está no arquivo C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg
    await mongoose.connect(uri)

    console.log("conectou ao Mongoose");
}

main().catch((err) => console.log(err));

module.exports = mongoose;