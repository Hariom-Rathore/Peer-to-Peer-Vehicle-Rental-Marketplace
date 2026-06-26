const mongoose= require("mongoose");

const initData= require("./data.js");

const Listing= require("../models/listing.js");
const DEFAULT_OWNER_ID = "69df2651aaefb65557b7339c";
const DEFAULT_OWNER_WHATSAPP_NUMBER = process.env.OWNER_WHATSAPP_NUMBER || "";

const resolveSampleCategory = (listing) => {
    const title = `${listing.title || ""} ${listing.location || ""}`.toLowerCase();

    if (title.includes("trending") || title.includes("city budget")) {
        return "trending";
    }

    if (title.includes("sedan")) {
        return "sedans";
    }

    if (title.includes("suv") || title.includes("4x4")) {
        return "suvs";
    }

    if (title.includes("electric") || title.includes("ev")) {
        return "electric";
    }

    if (title.includes("luxury") || title.includes("limousine") || title.includes("platinum")) {
        return "luxury";
    }

    if (title.includes("sports") || title.includes("roadster") || title.includes("convertible")) {
        return "sports";
    }

    if (title.includes("jeep") || title.includes("rally") || title.includes("terrain") || title.includes("offroad")) {
        return "offroad";
    }

    if (title.includes("mpv") || title.includes("family") || title.includes("van")) {
        return "family";
    }

    if (title.includes("vintage") || title.includes("classic")) {
        return "vintage";
    }

    if (title.includes("snow") || title.includes("zurich") || title.includes("switzerland")) {
        return "winter";
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

    if (DEFAULT_OWNER_WHATSAPP_NUMBER) {
        await Listing.updateMany(
            {
                $or: [
                    { whatsappNumber: { $exists: false } },
                    { whatsappNumber: "" },
                    { whatsappNumber: null },
                ],
            },
            { $set: { whatsappNumber: DEFAULT_OWNER_WHATSAPP_NUMBER.trim() } }
        );
    }

    await mongoose.connection.close();
}

initDB();