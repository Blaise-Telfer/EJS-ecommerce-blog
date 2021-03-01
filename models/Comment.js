var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;


var commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
	author:{
        type: String
    },
	createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Comment", commentSchema);
