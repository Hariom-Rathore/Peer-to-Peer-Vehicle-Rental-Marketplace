//Use export router method because the make code understandable

const express = require("express");
const router = express.Router();  //express router
const { isLoggedIn,isOwner,validateListing } = require("../utils/middleware.js");
const listings = require("../controllers/listing.js");


// index route
router.get("/", listings.index);

// new route  (isloogedin is difine into the middleware.js)
router.get("/new", isLoggedIn, listings.renderNewForm);

// create route
router.post("/", isLoggedIn, validateListing, listings.createListing);

// edit route
router.get("/:id/edit", isLoggedIn,isOwner, listings.renderEditForm);

// update route
router.put("/:id", isLoggedIn,isOwner, validateListing, listings.updateListing);

// delete route
router.delete("/:id", isLoggedIn, isOwner, listings.deleteListing);

// show route - display listing with reviews populated with author info
router.get("/:id", listings.showListing);

module.exports = router;
