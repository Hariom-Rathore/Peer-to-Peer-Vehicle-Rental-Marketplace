//Use export router method because the make code understandable

const express = require("express");
const router = express.Router();  //express router
const { isLoggedIn,isOwner,validateListing } = require("../utils/middleware.js");
const listings = require("../controllers/listing.js");

//multer is use for upload any file 
 const multer =require('multer');
 const {storage}=require("../cloudconfig.js");
 const upload=multer({storage}); //data ko upload namm ke folder me storrre kara dega ek baar ke liye but now we use cloudinaryy so now store into this 

//use of router.route for same path becoze same path ko baar baar define na karna pade
 
router
	.route("/")
	.get(listings.index)
	.post(isLoggedIn, upload.single("listing[image]"),validateListing,  listings.createListing);
   

router.get("/new",upload.single("listing[image]"), isLoggedIn, listings.renderNewForm);

router
.route("/:id")
.put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, listings.updateListing)
.delete( isLoggedIn, isOwner, listings.deleteListing)
.get( listings.showListing); 


// edit route
router.get("/:id/edit", isLoggedIn,isOwner, listings.renderEditForm);


module.exports = router;
