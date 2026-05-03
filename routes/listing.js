//Use export router method because the make code understandable

const express = require("express");
const router = express.Router();  //express router
const { isLoggedIn,isOwner,validateListing } = require("../utils/middleware.js");
const listings = require("../controllers/listing.js");
 
//use of router.route for same path becoze same path ko baar baar define na karna pade
 
router
	.route("/")
	.get(listings.index)
	.post(isLoggedIn, validateListing, listings.createListing);

router.get("/new", isLoggedIn, listings.renderNewForm);

router
.route("/:id")
.put( isLoggedIn,isOwner, validateListing, listings.updateListing)
.delete( isLoggedIn, isOwner, listings.deleteListing)
.get( listings.showListing); 


// edit route
router.get("/:id/edit", isLoggedIn,isOwner, listings.renderEditForm);


module.exports = router;
