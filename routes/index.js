const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const middleware = require("../config/middleware");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const moment = require("moment");
const fetch = require('node-fetch');
moment().format();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");


router.get("/", (req, res) => {
  Product.find(function (err, products){
    if(err){
	console.log(err)
    }else{
	res.render('index', { user: req.user, products: products });
    }
  });
});

router.get("/about", (req, res) => {
	res.render('about');
});

router.get("/contact", (req, res) => {
	Product.find(function (err, products){
		if(err){
			console.log(err)
		} 
		else{
			res.render('contact');
		}
	});
});
router.get('/success', (req, res) => {
	res.render('success');
});
router.get('/details/:id', (req, res) => {
	Product.findById(req.params.id, function(error, foundProduct){
		if(error){
			req.flash("error_message", error.message);
			res.redirect('/');
		} else{
			res.render('details', { product: foundProduct });
		}
	});
});



router.post('/new-product', function (req, res, next) {
	const {imagePath, title, description, price} = req.body;
    const newProduct = new Product({
		imagePath, title, description, price
	});
	Product.create(newProduct, function(error) {
		if(error) {
			req.flash("error_message", error.message);
			res.redirect("/user/adminPanel");
		} else {
			newProduct.save();
			req.flash("success_message", "Product added successfully");
			res.redirect('/user/adminPanel');
		}
	})
});


// Posts destroy logic
router.delete("/product/:id",  function(req, res) {
	Product.findByIdAndRemove(req.params.id, function(error) {
		if(error) {
			req.flash("error_message", error.message);
			res.redirect("/");
		} else {
			req.flash("success_message", "Successfully deleted Product");
			res.redirect("/");
		}
	});
});


router.get('/add-to-cart/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
	
    Product.findById(productId, function (err, product) {
        if(err) {
            return res.redirect('/dashboard');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/');
    })
});


router.get('/add/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.addByOne(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});


router.get('/reduce/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});


router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});


router.get('/cart', function (req, res, next) {
    if(!req.session.cart) {
        return res.render('cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    return res.render('cart', {products: cart.generateArray(), items: cart.items, totalPrice: cart.totalPrice.toFixed(2), totalQty: cart.totalQty});
});


router.post("/contact", function(req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const postData = JSON.stringify(data);

  fetch('https://us8.api.mailchimp.com/3.0/lists/38aeb061a0', {
    method: 'POST',
    headers: {
      Authorization: 'auth 1ce2ab781c8ddcfdaf3a6e433aa61453-us8'
    },
    body: postData
  })
  .then(res.statusCode === 200 ?
      (req.flash("success_message", "You are now on our email newsletter; check your email for confirmation"), 
	  res.redirect('/contact') )
	  :
      (req.flash("error_message", "Something went wrong; try again"), 
	  res.redirect('/contact') )
  )
  .catch(err => console.log(err))
  
  const verificationMessage = {
		to: `${email}`,
		from: "blaisetelfer@gmail.com",
		subject: "Victoria Telfer Newsletter",
		html: `<h2>Hello ${firstName}, thanks for signing up for our newsletter</h2>`
	};
	sgMail.send(verificationMessage)
	.catch((error) => {
		req.flash("error_message", error);
	});

	
});


module.exports = router;
