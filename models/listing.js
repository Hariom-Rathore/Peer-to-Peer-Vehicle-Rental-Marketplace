const mongoose= require("mongoose");
const Schema=mongoose.Schema;  //ek variable bana lenge joo baar use nahi karna pade

const listingSchema = new Schema({
    title:{
       type:String,
       required:true,
    },
    description:String,  
    image:{
      filename: {
        type: String,
        default: "listingimage",
      },
      url: {
        type: String,
        default: "https://images.pexels.com/photos/11129937/pexels-photo-11129937.jpeg",
        set: (v) =>
          v === ""
            ? "https://images.pexels.com/photos/11129937/pexels-photo-11129937.jpeg"
            : v,
      },
    },
    price:{
      type:Number,
      required:true,
      min:0,
    },
    location:String,
    country:String,
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
