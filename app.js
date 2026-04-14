const express=require("express");
const app=express();
const mongoose= require("mongoose");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";  //THIS IS add for mongodb database and databse name is wanderlust
const path =require("path");
const Listing=require("./models/listing.js");

const ejsMate=require("ejs-mate");  
const ExpressError=require("./utils/ExpressError.js");                                               //this is usefor when some template are same for all router(pages) like a navbar

const methodOverride=require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
 


const listings= require("./routes/listing.js"); //this is router
const reviews=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const passport=require("passport");
const localStrategy=require("passport-local");
const User= require("./models/user.js");

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: false,
};


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


main()
.then(()=>{
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

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(passport.initialize());
app.use(passport.session());//ek session me kam hona chahiye isliye use karte h
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //ek baar session start kar diya too baar bar login karna nahi padega
passport.deserializeUser(User.deserializeUser());//ek session khatam hote hi remove karne ke liye

//make a demo user for checking all things works 
// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"college-student" //this automaticlay invoked by the mongoose package

// })
// let registeredUser=await User.register(fakeUser,"helloworld"); //username and password
// res.send(registeredUser);
// });

app.use("/listings",listings);//listings and /listings/:id/reviews this is common part into the all router so this fixed first and after place of this use only /
app.use("/listings/:id/reviews",reviews);
app.use("/",userRouter);


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
