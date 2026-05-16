const mongoose= require("mongoose");

const initData= require("./data.js");

const Listing= require("../models/listing.js");
const DEFAULT_OWNER_ID = "69df2651aaefb65557b7339c";

const resolveSampleCategory = (listing) => {
    const title = `${listing.title || ""} ${listing.location || ""}`.toLowerCase();

    if (title.includes("beach") || title.includes("pool") || title.includes("villa")) {
        return "amazing-pools";
    }

    if (title.includes("room") || title.includes("loft") || title.includes("apartment")) {
        return "rooms";
    }

    if (title.includes("city") || title.includes("downtown") || title.includes("new york") || title.includes("miami") || title.includes("tokyo") || title.includes("amsterdam") || title.includes("boston")) {
        return "iconic-cities";
    }

    if (title.includes("mountain") || title.includes("aspen") || title.includes("banff") || title.includes("swiss")) {
        return "mountains";
    }

    if (title.includes("castle") || title.includes("historic")) {
        return "castles";
    }

    if (title.includes("camp") || title.includes("treehouse")) {
        return "camping";
    }

    if (title.includes("farm") || title.includes("cottage") || title.includes("log cabin")) {
        return "farms";
    }

    if (title.includes("boat") || title.includes("island") || title.includes("canal")) {
        return "boats";
    }

    if (title.includes("snow") || title.includes("arctic") || title.includes("scotland") || title.includes("switzerland")) {
        return "arctic";
    }

    return "trending";
};


const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";  //This can seed either the deployed Atlas DB or local MongoDB.


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

    initData.data=initData.data.map((obj)=>({...obj,owner:ownerObjectId,category:resolveSampleCategory(obj)})); //This is make a new array not change into the real array
    await Listing.insertMany(initData.data);
    console.log(`owner id used: ${ownerId}`);
    console.log("data was initialized");
    await mongoose.connection.close();
}

initDB();