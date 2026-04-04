const express=require("express");
const app=express();
const mongoose= require("mongoose");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";  //THIS IS add for mongodb database and databse name is wanderlust
const path =require("path");
const Listing=require("./models/listing.js");
const ejsMate=require("ejs-mate");                                               //this is usefor when some template are same for all router(pages) like a navbar

const methodOverride=require("method-override");
const { redirect } = require("express/lib/response.js");
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

// app.get("/testListing",async(req,res)=>{
//     let sampleListing =new Listing({
//         title:"my New Vilaa",
//         description:"By the beach",
//         price:12000,
//         location:"calangute,Goa",
//         country:"India",
//         })
//         });
// app.get("/Listings", async (req, res) => {
//     const listings = await Listing.find({});
//     res.send(listings);
// });

//index route (print all information of data)
app.get("/listings",async(req,res)=>{
    const alllistings=await Listing.find({});   //define above the in this file that Listing is what
    res.render("listings/index.ejs",{alllistings});
    });

    //new and creat route
    app.get("/listings/new",async(req,res)=>{
        res.render("listings/new.ejs");
    })

    app.post("/listings",async(req,res)=>{
const newListing=new Listing(req.body.listing);
await newListing.save();
res.redirect("/listings");
    });

    //Edit route
    app.get("/listings/:id/edit",async(req,res)=>{
         let{id}=req.params;
       const listing= await Listing.findById(id);
       res.render("listings/edit.ejs",{listing});
    })

    //update route
    app.put("/listings/:id",async(req,res)=>{
        let{id}=req.params;
        await Listing.findByIdAndUpdate(id,{...req.body.listing});
        res.redirect(`/listings/${id}`);
    })

    //delete route

    app.delete("/listings/:id",async(req,res)=>{
        let{id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
console.log(deleteListing);
res.redirect("/listings");
 })

    //read data(show data)

    app.get("/listings/:id",async(req,res)=>{
       let{id}=req.params;
       const listing= await Listing.findById(id);
       res.render("listings/show.ejs",{listing});
    });

   





app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});
