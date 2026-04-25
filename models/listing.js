const mongoose= require("mongoose");
const review = require("./review");
const Schema=mongoose.Schema;  //ek variable bana lenge joo baar use nahi karna pade
const Review = require("./review.js");

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
    reviews:[
      {
        type:Schema.Types.ObjectId,
        ref:"Review",
      },
    ],
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:true,
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await review.deleteMany({_id:{$in:listing.reviews}});
  }
}); 



const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
