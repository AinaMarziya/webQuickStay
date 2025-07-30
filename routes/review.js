const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync= require("../utils/wrapAsync.js");
// const ExpressError =require("../utils/ExpressError.js");
// const {listingSchema } = require("../schema.js");
// const Review= require("../models/review.js");
// const Listing= require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");

const reviewController = require("../controllers/reviews.js");

//REVIEWS
//POST REVIEW ROUTE
// Reviews — POST route
router.post("/", 
  isLoggedIn,
  validateReview , 
  wrapAsync(reviewController.createReview));

//DELETE REVIEW ROUTE
 router.delete(
    '/:reviewId',
    isLoggedIn,
    isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports= router;

