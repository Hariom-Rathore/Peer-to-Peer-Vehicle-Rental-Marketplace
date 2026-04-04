const mongoose= require("mongoose");

const initdata= require("./data.js");

const Listing= require("../models/listing.js");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";  //THIS IS add for mongodb database and databse name is wanderlust


main()
.then(()=>{
    console.log("connected to Db");
})
.catch((err)=>{
    console.log(err); 
});

async function main(){
await mongoose.connect(MONGO_URL);
}

//making a function for cleaning the data which store before into the databse

const initDB= async()=>{
    await Listing.deleteMany({});   //jo phle data banyaya tha use delete karne ke liye
    await Listing.insertMany(initdata.data);
    console.log("data was initialized");
}

initDB();