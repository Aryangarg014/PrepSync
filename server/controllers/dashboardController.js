const User = require("../models/User");
const Goal = require("../models/Goal");
const Group = require("../models/Group");
const mongoose = require("mongoose");

async function getMainStats(userId){
    const totalCompleted = await Goal.countDocuments( { "completedBy.user" : userId } );
    const personalGoalsCompleted = await Goal.countDocuments( { "completedBy.user" : userId, group : null } );
    const groupGoalsCompleted = totalCompleted - personalGoalsCompleted;
    const totalPending = await Goal.countDocuments( { createdBy : userId, "completedBy.user" : { $ne : userId } } );

    return {totalCompleted, personalGoalsCompleted, groupGoalsCompleted, totalPending};
}

async function getDailyCompletions(userId, days){

}

async function getGroupPerformance(userId){
    const groupPerformance = await Goal.aggregate([
        { $match : { "completedBy.user" : userId, group : { $ne : null } } },
        // unwind deconstruct the array in a manner that for each element of the array a new document is made
        { $unwind : "completedBy" },
        { $match : { "completedBy.user" : userId } },
        { $group : {
            _id : "$group",
            completedInGroup : { $sum : 1}
          }
        },
        // fetching information of the group by matching the group Id of this goal with group id of group
        { $lookup : {
            from : "groups",
            localField : "_id",
            foreignField : "_id",
            as : "groupInfo"    // groupInfo is added as an attribute with an array of matching documents from groups
          } 
        },
        { $unwind : "groupInfo" },  // again unwind the groupInfo array
        { $project : {
            _id : 0,
            groupId : "$_id",
            groupName : "$groupInfo.name",
            completedInGroup : 1
          }
        }
    ]);
    return performance;
}


async function getDashboardData(req, res){
    const userId = mongoose.Types.ObjectId(req.user.id);
    try{
        // Use promise.all to run all queries in parallel
        const [user, mainStats, streakGraphData, heatmapData, groupPerformance]
        = await Promise.all([
            User.findById(userId).select("streak").lean(),
            getMainStats(userId),
            getDailyCompletions(userId, 7),
            getDailyCompletions(userId, 90),
            getGroupPerformance(userId)
        ]);

        return res.status(200).json({
            stats: {
                currentStreak : user.streak,
                ...mainStats    // combining the main stats with current streak
            },
            streakGraph : streakGraphData,
            heatmap : heatmapData,
            groupPerformance
        })
    }
    catch(error){
        console.error("Error fetching dashboard data:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getDashboardData
};