if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path=require("path");
const methodOverride=require("method-override");
// const req = require("express/lib/request.js");
const ejsMate=require("ejs-mate");
// const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError =require("./utils/ExpressError.js");
const session= require("express-session");
const MongoStore = require("connect-mongo"); //ABHI KIYA
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");  

// const MONGO_URL = "mongodb://127.0.0.1:27017/quickstay";
const dbUrl = process.env.ATLASDB_URL;


main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));//connect with dir views
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname,"public")));
app.use(express.static("public"));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { 
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
    expires: Date.now() + 7 * 24 *60 * 60 * 1000,
    maxAge: 7 * 24 *60 * 60 * 1000,
    httpOnly: true,
    },
};
  
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next ) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"))
});

// app.use((err, req, res, next)=>{
//     let {statusCode=500, message="something went wrong"}= err;

// res.status(statusCode).render("error.ejs", {err});
//     // res.status(statusCode).send(messagw);
// });


app.use((err, req, res, next)=>{
    if(typeof err=== "string"){
        err= { message: err};
    }
    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
    const message = typeof err.message ==="string" ?  err.message:"something went wrong";

res.status(statusCode).render("error.ejs", {err: {statusCode, message}});
    res.status(statusCode).send(message);
});

// app.use((err, req, res, next) => {
//     let statusCode = 500;
//     let message = "Something went wrong";

//     if (err && typeof err === "object") {
//         if (typeof err.statusCode === "number") {
//             statusCode = err.statusCode;
//         }
//         if (typeof err.message === "string") {
//             message = err.message;
//         }
//     }

//     res.status(statusCode).render("error.ejs", {
//         err: {
//             statusCode,
//             message
//         }
//     });
// });
app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});


console.log("Mapbox Token:", process.env.MAP_TOKEN);
// res.render("show", {mapToken: process.env.MAP_TOKEN});