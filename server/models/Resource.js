const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    groups : [  // the groups in which the resource is shared
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Group",
            required : true
        }
    ],
    addedBy : {    // who shared the resource
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

const Resource = mongoose.model("Resource", resourceSchema);
module.exports = Resource;