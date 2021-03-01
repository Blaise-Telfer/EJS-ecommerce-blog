const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const methodOverride = require("method-override");
const cookieParser = require('cookie-parser');
const app = express();
const moment = require("moment");
moment().format(); 


//database configuration
const db = "mongodb+srv://blaise123:blaise123@cluster0-uxtwz.mongodb.net/app?retryWrites=true&w=majority";
mongoose.connect(db, {
	useNewUrlParser: true, useUnifiedTopology: true,
	useCreateIndex: true, useFindAndModify: false
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser());

//session middleware
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
	cookie: {maxAge: 30 * 60 * 1000}
}));

app.use(flash());
app.use((req,res,next) => {
	res.locals.user = req.user;
	res.locals.session = req.session;
	res.locals.moment = moment;
	res.locals.success_message = req.flash("success_message");
	res.locals.error_message = req.flash("error_message");
	res.locals.error = req.flash("error");
	next();
});


//middleware, initialize passport and login sessions
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());



//routes
const index = require("./routes/index");
const user = require("./routes/user");
const blog = require("./routes/blog");
const payment = require("./routes/payment");
app.use("/", index);
app.use("/user", user);
app.use("/blog", blog);
app.use("/pay", payment);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	res.render("notFound");
});


const port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Forum App server has started on port " + port + "!");
});

