const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const wrapAsync= require("../utils/wrapAsync.js");
const {listingSchema } = require("../schema.js");
const {reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review= require("../models/review.js");
const { isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});

router.route("/")//index and create route
.get( wrapAsync(listingController.index))
.post( isLoggedIn, upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));


//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")// show update and delete route
.get( wrapAsync(listingController.showListing))
.put( 
    isLoggedIn, 
    isOwner, 
    upload.single("listing[image]"),
    validateListing,
    wrapAsync( listingController.updateListing)
)
.delete( isLoggedIn, isOwner, wrapAsync( listingController.destroyListing));

//EDIT ROUTE
router.get("/:id/edit", isLoggedIn,  isOwner, wrapAsync( listingController.renderEditForm));

module.exports = router;