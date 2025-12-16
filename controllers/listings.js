const Listing = require("../models/listing");
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  console.log("LISTINGS COUNT:", allListings.length);
  res.render("listings/index", { listings: allListings });
};


module.exports.renderNewForm = (req, res)=>{   
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res)=>{
    let {id} =req.params;

    const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
        path:"reviews",
        populate: {
            path: "author",
        },
    })
    
    
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    //log the image for debugging
    console.log(listing);
    console.log("image path:", listing.image)     ///chat gpt
    res.render("listings/show" , {listing, currUser: req.user, mapToken: process.env.MAP_TOKEN});
};

module.exports.createListing =  async (req, res, next) => {

    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();
    // console.log(response.body.features[0].geometry);
    // res.send("done!");

        let url= req.file.path;
        let filename = req.file.filename;

        const newListing= new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        newListing.geometry = response.body.features[0].geometry;
        savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res)=>{
    let {id} =req.params;
    const listing = await Listing.findById(id);
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(400).send("Invalid ID format");
    // }
     if(!listing) {
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/listings");
     }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs",{listing , originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id} =req.params;
    let listing= await Listing.findByIdAndUpdate(id, {...req.body.listing});

if(typeof req.file !=="undefined") {
    let url= req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} =req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};