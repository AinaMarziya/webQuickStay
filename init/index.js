// init/index.js
require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

(async () => {
  await mongoose.connect(process.env.ATLASDB_URL, { dbName: "quickstay" }); // <—
  console.log("✅ Seed connected");
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data.map(d => ({ ...d, owner: "686dda3c73e9673422ef46a1" })));
  console.log("✅ Seeded", initData.data.length);
  await mongoose.disconnect();
})();

//
// (async () => {
//   try {
//     await mongoose.connect(process.env.ATLASDB_URL,{dbName:"quickstay" });
//     console.log("✅ DB connected");

//     const OWNER_ID = "686dda3c73e9673422ef46a1";  // your user ID from atlas users collection

//     // Add default geometry for all listings
//     const docs = initData.data.map(item => ({
//       ...item,
//       owner: OWNER_ID,
//       geometry: { type: "Point", coordinates: [77.2090, 28.6139] } // Delhi coordinates (safe default)
//     }));

//     await Listing.deleteMany({});
//     await Listing.insertMany(docs);

//     console.log(`✅ Seeded ${docs.length} listings`);
//     await mongoose.disconnect();
//   } catch (e) {
//     console.error(e);
//   }
// })();



// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing =require("../models/listing.js");
// const initData = require("./data");

// const MONGO_URL = "mongodb://127.0.0.1:27017/quickstay";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//   await Listing.deleteMany({});
//   const dataWithOwner =  initData.data.map((obj) => ({ ...obj, owner: "686dda3c73e9673422ef46a1"}));
//   await Listing.insertMany(dataWithOwner);//data.js se data le rhe hain....
//   console.log("data was initialized");
// };
// initDB();