const express = require("express");
const router = express.Router({ mergeParams: true });//parent route bhi use hote h router ko call karte time tab hum ise use karte h
const { isLoggedIn, validateReview, isReviewAuthor } = require("../utils/middleware.js");
const reviews = require("../controllers/review.js");


//Reviews(post route because listing ke sath dekhenge reviews ko)
// Create a review for a listing
router.post("/", isLoggedIn, validateReview, reviews.createReview);


router.delete("/:reviewId",isLoggedIn,isReviewAuthor, reviews.deleteReview);

module.exports = router;
