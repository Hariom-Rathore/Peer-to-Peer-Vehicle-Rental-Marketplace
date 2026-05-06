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

module.exports.index = async (req, res) => {
    const alllistings = await Listing.find({}).populate("owner");
    res.render("listings/index.ejs", { alllistings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", {
        listing: emptyListing,
        errorMsg: null,
    });
};

module.exports.createListing = async (req, res) => {
    const listingData = buildListingData(req.body.listing);

    if (req.file) {
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    const listing = new Listing(listingData);
    listing.owner = req.user._id;
    listing.image={url,filename};
    


    await listing.save();
    req.flash("success", "New listing created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listingData = buildListingData(req.body.listing);

    if (req.file) {
        listingData.image = {
             url: req.file.path,
            filename: req.file.filename,
        };
    }

    const listing = await Listing.findByIdAndUpdate(id, listingData, {
        runValidators: true,
        new: true,
    });

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};