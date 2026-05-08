if(process.env.NODE_ENV != "production"){
require("dotenv").config();
}
//this is use if we in the production phase and we deploye our project or abhi jese hum production phase me nahi h to hum env file ko use kar sakte h



const express=require("express");
const app=express();
const mongoose= require("mongoose");
//const dburl="mongodb://127.0.0.1:27017/wanderlust";  //THIS IS add for mongodb database and databse name is wanderlust

const dbUrl=process.env.ATLASDB_URL;

const path =require("path");
const Listing=require("./models/listing.js");

const ejsMate=require("ejs-mate");  
const ExpressError=require("./utils/ExpressError.js");                                               //this is usefor when some template are same for all router(pages) like a navbar

const methodOverride=require("method-override");
const session = require("express-session");
const MongoStore=require('connect-mongo').default;//as a session
const flash = require("connect-flash");
 


const listings= require("./routes/listing.js"); //this is router
const reviews=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const chatbotRouter=require("./routes/chatbot.js");

const passport=require("passport");
const localStrategy=require("passport-local");
const User= require("./models/user.js");

//session(user ke bare me ki user kitni der baad aaya website pe vesi information) ki inforamtion abb atlas me store hogi jiska dburl le liya h because express sessison me some time data leak ho jata h
const store=new MongoStore({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,

    },
    touchAfter:24*3600,
});

store.on("error",(err)=>{
    console.log("error in mongo store",err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
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
await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));  //data ko pars karne ke liye
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public"))); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.engine('ejs',ejsMate);  //for ejs mate templeting

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());//ek session me kam hona chahiye isliye use karte h
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //ek baar session start kar diya too baar bar login karna nahi padega
passport.deserializeUser(User.deserializeUser());//ek session khatam hote hi remove karne ke liye

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

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
app.use("/chatbot",chatbotRouter);
app.use("/",userRouter);


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
