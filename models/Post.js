var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;


var postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
	body: {
        type: String,
        required: true
    },
	author:{
        type:String,
        required:true
    },
	createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    latestComment: {
        _id: String,
        body: String,
        createdAt: {type: Date, default: Date.now}
    }
	
});


module.exports = mongoose.model("Post", postSchema);