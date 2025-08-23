const mongoose = require("mongoose");
const Group = require("./Group");

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdBy: {
    // the user who created goal
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  group: {
    // Which group the goal belongs to
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null, // for personal goals
  },
  dueDate: {
    type: Date,
  },
  completedBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["on-time", "late"],
        required: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Goal = mongoose.model("Goal", goalSchema);
module.exports = Goal;
