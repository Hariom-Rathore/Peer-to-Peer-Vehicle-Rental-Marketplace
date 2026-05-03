//this is into the controller file for making a mvc framework(matlab iske ander sara backend ka code likha jayega)

const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

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

module.exports.index = async (req, res, next) => {
    try {
        const alllistings = await Listing.find({});
        res.render("listings/index.ejs", { alllistings });
    } catch (err) {
        next(err);
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { listing: emptyListing, errorMsg: null });
};

module.exports.createListing = async (req, res, next) => {
    try {
        req.listingData = buildListingData(req.body.listing);
        const newListing = new Listing(req.listingData);
        newListing.owner = req.user._id;
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
        err.viewData = err.viewData || { listing: req.listingData || emptyListing };
        next(err);
    }
};

module.exports.renderEditForm = async (req, res, next) => {
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
};

module.exports.updateListing = async (req, res, next) => {
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
};

module.exports.deleteListing = async (req, res, next) => {
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
};

module.exports.showListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate("owner")
            .populate({
                path: "reviews",
                populate: { path: "author" }
            });
        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        next(err);
    }
};
