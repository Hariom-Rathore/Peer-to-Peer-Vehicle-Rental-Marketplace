const mongoose= require("mongoose");

const initData= require("./data.js");

const Listing= require("../models/listing.js");
const DEFAULT_OWNER_ID = "69df2651aaefb65557b7339c";


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
    const ownerId = process.env.OWNER_ID || DEFAULT_OWNER_ID;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        throw new Error(`Invalid OWNER_ID: ${ownerId}`);
    }
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    initData.data=initData.data.map((obj)=>({...obj,owner:ownerObjectId})); //This is make a new array not change into the real array
    await Listing.insertMany(initData.data);
    console.log(`owner id used: ${ownerId}`);
    console.log("data was initialized");
    await mongoose.connection.close();
}

initDB();