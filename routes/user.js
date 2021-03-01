const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const middleware = require("../config/middleware");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");


router.get('/adminPanel', middleware.isAdmin, (req, res, next) => {
    res.render('adminPanel', { user: req.user });
});

//page routes
router.get("/login", (req,res) => res.render("login"));
router.get("/register", (req,res) => res.render("register"));

//Register Handle
router.post("/register", (req,res) => {
	const { username, email, password, password2 } = req.body;
	let errors = [];
	//check required fields
	if(!username || !email || !password || !password2){
		errors.push({ message: "all fields required" });
	}
	if(password !== password2){
		errors.push({ message: "passwords don't match" });
	}
	if(password.length < 6){
		errors.push({ message: "passwords must be six characters or more" });
	}
	if(errors.length > 0){
		res.render("register", {
			errors,
			username,
			email,
			password,
			password2
		});
	}else{
		//validation passed
		User.findOne({ email: email })
		.then(user => {
			if(user){
				//user exists
				errors.push({ message: "Email already in use" });
				res.render("register", {
					errors,
					username,
					email,
					password,
					password2
				});
			}else{
				//create new user
				const newUser = new User({
					username,
					email,
					password
				});
				//generate salt and hash password, compares plaintext pw and salt
				bcrypt.genSalt(10, (error, salt) => 
					bcrypt.hash(newUser.password, salt, (error, hash) => {
						if(error) { throw error };
						//set password as hashed and save user
						newUser.password = hash;
						newUser.save()
						.then(user => {
							req.flash("success_message", "You are now registered and can log in");
							res.redirect("/user/login");
						})
						.catch(error => console.log(error));
						
				}));
				const msg = {
					to: "psychopandaca@gmail.com",
					from: "blaisetelfer@gmail.com",
					subject: "SendGrid Message",
					html: "<strong>Welcome, you have registered</strong>"
				};

				sgMail.send(msg)
				.then(() => {
					console.log("success");
				})
				.catch((error) => {
					console.log(error);
				});
			}
		});
	}	
});

//Login Handle
router.post("/login", (req, res, next) => {
	 passport.authenticate("local", {
		 successRedirect: "/",
		 failureRedirect: "/user/login",
		 failureFlash: true
	 })(req, res, next);
});

//Logout Handle
router.get("/logout", (req, res) => {
	req.flash("success_message", "You have logged out");
	req.session.destroy(function (err) {
		res.redirect('/');
	});
});





module.exports = router;