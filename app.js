if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
// console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError =require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");//ABHI KIYA
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");  

const dbUrl = process.env.ATLASDB_URL;



main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl,{dbName:"quickstay" });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));//connect with dir views
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static("public"));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    // crypto: { 
    //     secret: process.env.SECRET,
    // },
    touchAfter: 24 * 3600,
});


app.use(session({
  secret: process.env.SESSION_SECRET || "thisisasecret",
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));




app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next ) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//Fix favicon error
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"))
});

app.use((err, req, res, next)=>{
    console.error("ERR:", err);
    if(typeof err=== "string"){
        err= { message: err};
    }
    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
    const message = typeof err.message ==="string" ?  err.message:"something went wrong";

res.status(statusCode).render("error.ejs", {err: {statusCode, message}});
    // res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});

// SECRET TOKENS
// console.log("Mapbox Token:", process.env.MAP_TOKEN);
// console.log(process.env.ATLASDB_URL);

// res.render("show", {mapToken: process.env.MAP_TOKEN});