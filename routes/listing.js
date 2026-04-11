//Use export router method because the make code understandable

const express = require("express");
const router = express.Router();  //express router
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

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

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        const err = new ExpressError(400, errMsg);
        err.viewData = { listing: buildListingData(req.body.listing) };
        throw err;
    }
    next();
};

// index route
router.get("/", async (req, res, next) => {
    try {
        const alllistings = await Listing.find({});
        res.render("listings/index.ejs", { alllistings });
    } catch (err) {
        next(err);
    }
});

// new route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs", { listing: emptyListing, errorMsg: null });
});

// create route
router.post("/", validateListing, async (req, res, next) => {
    try {
        req.listingData = buildListingData(req.body.listing);
        const newListing = new Listing(req.listingData);
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
        err.viewData = err.viewData || { listing: req.listingData || emptyListing };
        next(err);
    }
});

// edit route
router.get("/:id/edit", async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        next(err);
    }
});

// update route
router.put("/:id", validateListing, async (req, res, next) => {
    try {
        const { id } = req.params;
        req.listingData = buildListingData(req.body.listing);
        const updatedListing = await Listing.findByIdAndUpdate(id, req.listingData, {
            new: true,
            runValidators: true,
        });
        if (!updatedListing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.redirect(`/listings/${id}`);
    } catch (err) {
        err.viewData = err.viewData || {
            listing: { ...(req.listingData || emptyListing), _id: req.params.id },
        };
        next(err);
    }
});

// delete route
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleteListing = await Listing.findByIdAndDelete(id);
        if (!deleteListing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
});

module.exports = router;
