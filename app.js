const express=require("express");
const app=express();
const mongoose= require("mongoose");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";  //THIS IS add for mongodb database and databse name is wanderlust
const path =require("path");
const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ejsMate=require("ejs-mate");  
const ExpressError=require("./utils/ExpressError.js");                                               //this is usefor when some template are same for all router(pages) like a navbar

const methodOverride=require("method-override");
const {listingSchema,reviewSchema}= require("./schema.js");     

const emptyListing = {
    title: "",
    description: "",
    image: { url: "", filename: "listingimage" },
    price: "",
    country: "",
    location: "",
};

const buildListingData = (incomingListing = {}) => ({
    ...emptyListing,
    ...incomingListing,
    image: {
        ...emptyListing.image,
        ...(incomingListing.image || {}),
    },
});


//make according to joi for  server side all things work systematically and i am use on teh router only this function name

const validateReview = (req, res, next) => {
    let{error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg =error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
        }else{next();

        }   
     };

const validateListing = (req, res, next) => {
    let{error}=listingSchema.validate(req.body);
    if(error){
        let errMsg =error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
        }else{next();

        }   
     };
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

app.get("/",(req,res)=>{
    res.send("HII I am root");
});

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));  //data ko pars karne ke liye
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public"))); 

app.engine('ejs',ejsMate);  //for ejs mate templeting

//index route (print all information of data)
app.get("/listings",async(req,res,next)=>{
    try{
        const alllistings=await Listing.find({});   //define above the in this file that Listing is what
        res.render("listings/index.ejs",{alllistings});
    } catch(err){
        next(err);
    }
});

//new and create route
app.get("/listings/new",async(req,res,next)=>{
    try{
        res.render("listings/new.ejs",{ listing: emptyListing, errorMsg: null });
    } catch(err){
        next(err);
    }
});

app.post("/listings", validateListing,async(req,res,next)=>{
    try{
       
     const newListing = new Listing(req.listingData);
        await newListing.save();
        res.redirect("/listings");
    } catch(err){
        err.viewData = err.viewData || { listing: req.listingData || emptyListing };
        
        next(err);
    }
});

//Edit route
app.get("/listings/:id/edit",async(req,res,next)=>{
    try{
        let{id}=req.params;
        const listing= await Listing.findById(id);
        if(!listing){
            throw new ExpressError(404,"Listing not found!");
        }
        res.render("listings/edit.ejs",{listing});
    } catch(err){
        next(err);
    }
});

//update route
app.put("/listings/:id",validateListing,async(req,res,next)=>{
    try{
        let{id}=req.params;
        const updatedListing = await Listing.findByIdAndUpdate(id,req.listingData,{new:true,runValidators:true});
        if(!updatedListing){
            throw new ExpressError(404,"Listing not found!");
        }
        res.redirect(`/listings/${id}`);
    } catch(err){
        err.viewData = err.viewData || { listing: { ...req.listingData, _id: req.params.id } };
        next(err);
    }
});

//delete route
app.delete("/listings/:id",async(req,res,next)=>{
    try{
        let{id}=req.params;
        let deleteListing=await Listing.findByIdAndDelete(id);
        if(!deleteListing){
            throw new ExpressError(404,"Listing not found!");
        }
        console.log(deleteListing);
        res.redirect("/listings");
    } catch(err){
        next(err);
    }
});

//Reviews(post route because listing ke sath dekhenge reviews ko)
app.post("/listings/:id/reviews",validateReview,async(req,res)=>{
let listing = await Listing.findById(req.params.id);
let newReview= new Review(req.body.review);
listing.reviews.push(newReview);

await newReview.save();
await listing.save();
console.log(req.body);
res.redirect(`/listings/${listing._id}`);
});



app.delete("/listings/:id/reviews/:reviewId", async (req, res) => {
  let { id, reviewId } = req.params;

  // Remove review reference from listing
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  // Delete review from Review collection
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
});



//show route     read data(show data)
app.get("/listings/:id",async(req,res,next)=>{
    try{
        let{id}=req.params;
        const listing= await Listing.findById(id).populate("reviews");
        if(!listing){
            throw new ExpressError(404,"Listing not found!");
        }
        res.render("listings/show.ejs",{listing});
    } catch(err){
        next(err);
    }
});

app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

//error handler middleware
app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const errorMsg = err.message || "Something went wrong!";

    // show form errors on add/edit listing pages
    if (req.path === "/listings" && req.method === "POST") {
        return res.status(statusCode).render("listings/new.ejs", {
            listing: (err.viewData && err.viewData.listing) || emptyListing,
            errorMsg,
        });
    }

    if (req.path.match(/^\/listings\/[^/]+$/) && req.method === "PUT") {
        return res.status(statusCode).render("listings/edit.ejs", {
            listing: {
                ...(err.viewData && err.viewData.listing ? err.viewData.listing : emptyListing),
                _id: req.params.id,
            },
            errorMsg,
        });
    }

    return res.status(statusCode).render("error.ejs", { statusCode, errorMsg });
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});
