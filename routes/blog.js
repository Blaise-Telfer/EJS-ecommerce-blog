const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const middleware = require("../config/middleware");
const Post = require("../models/Post");
const Comment = require("../models/Comment");


router.get('/blogPost/:id', (req, res, next) => {
	Post.findById(req.params.id).populate("comments").exec(function(error, foundPost){
		if(error){
			req.flash("error_message", error.message);
			res.redirect('/blog');
		} else{
			res.render('blogPost', { user: req.user, post: foundPost });
		}
	});
	
});


router.get("/", (req, res) => {
	Post.find(function (err, posts){
		if(err){
			req.flash("error_message", err.message);
			res.redirect('/blog');
		} else{
			Comment.find(function (err, comments){
				if(err){
					req.flash("success_message", err.message);
					res.redirect('/blog');
				} else{
					res.render('blogPage', { user: req.user, posts: posts, comments: comments });
				}
			})
		}
	});
});


router.post('/new-post', middleware.isLoggedIn, (req, res) => {
	const {title, body} = req.body;
    const newPost = new Post({
		title, body, author: req.user.username
	});
	Post.create(newPost, function(error){
		if(error) {
			req.flash("error_message", error.message);
			res.redirect("/user/adminPanel");
		} else {
			newPost.save();
			req.flash("success_message", "Post added successfully");
			res.redirect('/blog');
		}
	});
});


router.post('/:id/new-comment', (req, res) => {
	const {body} = req.body;
    const newComment = new Comment({body, author: req.body.username});
	
	Post.findById(req.params.id, function(error, foundPost) {
		if(error) {
			req.flash("error_message", error.message);
			res.redirect("/blog");
		} else{
			Comment.create(newComment, function(error){
				if(error) {
					req.flash("error_message", error.message);
					res.redirect("/blog");
				} else {
					newComment.save();
					foundPost.comments.push(newComment);
					foundPost.save();
					req.flash("success_message", "Comment posted successfully");
					res.redirect('/blog');
				}
			});
		}
	});
});


//delete a comment
router.delete("/:post_id/comment/:id", function(req, res) {
	Comment.findByIdAndRemove(req.params.id, function(err, removeComment) {
		if(err) {
			req.flash("error_message", err.message);
			res.redirect("/blog/blogPost");
		} else {
			Post.findByIdAndUpdate(req.params.post_id, {$pull: {comments: req.params.id}}, function(err) {
				if(err) {
					req.flash("error_message", err.message);
					res.redirect("/blog/blogPost/:post_id");
				} else {
					req.flash("success_message", "Successfully deleted thread and associated posts");
					res.redirect("/blog/blogPost/:post_id");
				}
			});
		}
	});
});


// Posts edit form route
router.get("/edit/:id", function(req, res) {
	Post.findById(req.params.id, function(err, foundPost) {
		if(err) {
            req.flash("error_message", err.message);
			res.redirect("/blog");
		} else {
			res.render("postEdit", {post_id: req.params.id, post: foundPost});
		}
	});
});


// Posts update logic
router.put("/update/:id", function(req, res) {
	console.log(req);
	Post.findByIdAndUpdate(req.params.id, req.body.post, function(err) {
		if(err) {
			req.flash("error_message", err.message);
			res.redirect("/blog/blogPost/:id");
		} else {
            req.flash("success_message", "Successfully updated post");
			res.redirect("/blog/blogPost/:id");
		}
	})
}); 


//delete the porst
router.delete("/post/:id", function(req, res) {
	Post.findByIdAndRemove(req.params.id, function(err, removePost) {
		if(err) {
			req.flash("error_message", err.message);
			res.redirect("/blog/blogPost");
		} else {
			Comment.deleteMany({id: {$in: removePost.comments}}, function(err) {
				if(err) {
					req.flash("error_message", err.message);
					res.redirect("/blog/blogPost");
				} else {
					req.flash("success_message", "Successfully deleted thread and associated posts");
					res.redirect("/blog");
				}
			});
		}
	});
});



module.exports = router;
