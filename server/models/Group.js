const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    createdBy : {       // Group Admin
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    members : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    goals : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Goal"
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now
    }
})

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;