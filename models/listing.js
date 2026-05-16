const mongoose= require("mongoose");
const review = require("./review");
const Schema=mongoose.Schema;  //ek variable bana lenge joo baar use nahi karna pade
const Review = require("./review.js");

const listingSchema = new Schema({
    title:{
       type:String,
       required:true,
    },
    description: String,
    image: {
      filename: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    price:{
      type:Number,
      required:true,
      min:0,
    },
    location:String,
    country:String,
    category:{
      type:String,
      default:"trending",
    },
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
