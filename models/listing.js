const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  id: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  // image: {
  //   filename: String,
  //   url: {
  //     type: String,
  //     default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157",
  //   }
  // },
  image: {
    url: String,
    filename: String,
  
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },
 geometry: {

  type: {
    type: String, // Don't do `{ l
    enum: ['Point'], // 'location.
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
}
});

// 🛠 CORRECTED: Cascade delete reviews after listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
