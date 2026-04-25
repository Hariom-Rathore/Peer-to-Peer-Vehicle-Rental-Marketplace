const express = require("express");
const router = express.Router({ mergeParams: true });//parent route bhi use hote h router ko call karte time tab hum ise use karte h
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../utils/middleware.js");


//Reviews(post route because listing ke sath dekhenge reviews ko)
router.post("/", isLoggedIn, validateReview, async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found!");
    }
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err);
  }
});


router.delete("/:reviewId",isLoggedIn,isReviewAuthor, async (req, res, next) => {
  try {
    let { id, reviewId } = req.params;

    // Remove review reference from listing
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });

    // Delete review from Review collection
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
