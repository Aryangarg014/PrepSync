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

// Get the "Real UTC" timestamp for Midnight IST of a specific date
function getISTMidnight(dateObj) {
    const d = new Date(dateObj);
    
    // Adjust to IST (Add 5.5 hours) to see what day it is in India
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(d.getTime() + istOffset);
    
    // Strip the time part (Set to Midnight 00:00:00)
    istTime.setUTCHours(0, 0, 0, 0);
    
    // Subtract the offset to get back to "Real UTC"
    // Midnight IST is 18:30 UTC of the previous day
    return new Date(istTime.getTime() - istOffset);
}

// Generate continuous date strings (YYYY-MM-DD) based on IST
function getLastXDaysDates(days) {
    const dates = [];
    const now = new Date();
    
    // Loop backwards from today
    for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        
        // Convert this specific date to IST string to match MongoDB output
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(d.getTime() + istOffset);
        
        dates.push(istDate.toISOString().split('T')[0]);
    }
    return dates.reverse(); // [Oldest, ..., Newest]
}

async function getActivityData(userId, days) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days + 1); // +1 to include today

    // Get the Exact UTC timestamp for Midnight IST of that day
    // This ensures we catch activity that happened at 1:00 AM IST (which is previous day UTC)
    const startDate = getISTMidnight(targetDate);

    const rawData = await Goal.aggregate([
        { $unwind: "$completedBy" },
        { $match: { 
            "completedBy.user": userId,
            // Compare Real UTC in DB with Calculated UTC for IST Midnight
            "completedBy.completedAt": { $gte: startDate } 
        }},
        { $group: {
            // Mongo handles the IST conversion here perfectly
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedBy.completedAt", timezone: "Asia/Kolkata" } },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
    ]);

    // Transform to Map
    const activityMap = {};
    rawData.forEach(item => {
        activityMap[item._id] = item.count;
    });

    // Fill gaps
    const dateList = getLastXDaysDates(days);
    
    const filledData = dateList.map(date => ({
        date: date,
        count: activityMap[date] || 0
    }));

    return filledData;
}

async function getGroupPerformance(userId){
    const groupPerformance = await Goal.aggregate([
        { $match : { "completedBy.user" : userId, group : { $ne : null } } },
        // unwind deconstruct the array in a manner that for each element of the array a new document is made
        { $unwind : "$completedBy" },
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
        { $unwind : "$groupInfo" },  // again unwind the groupInfo array
        { $project : {
            _id : 0,
            groupId : "$_id",
            groupName : "$groupInfo.name",
            completedInGroup : 1
          }
        }
    ]);
    return groupPerformance;
}


async function getDashboardData(req, res){
    const userId = new mongoose.Types.ObjectId(req.user.id);
    try{
        // Use promise.all to run all queries in parallel
        const [user, mainStats, heatmapData, groupPerformance]
        = await Promise.all([
            User.findById(userId).select("streak").lean(),
            getMainStats(userId),
            getActivityData(userId, 90),
            getGroupPerformance(userId)
        ]);

        const last7Days = heatmapData.slice(-7);

        // Streak Validation Logic

        // 1. Get "Now" and shift it to IST
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // +5 hours 30 mins
        const todayIST = new Date(now.getTime() + istOffset);
        
        // 2. Normalize to Midnight (00:00:00) so we compare Dates, not Times
        todayIST.setUTCHours(0, 0, 0, 0);

        // 3. Define "Yesterday" based on Today (IST)
        const yesterdayIST = new Date(todayIST);
        yesterdayIST.setDate(todayIST.getDate() - 1);

        let currentStreak = user.streak;

        if(user.lastCompletedDate) {
            // This date was ALREADY saved as IST in markGoalComplete function
            const lastDate = new Date(user.lastCompletedDate);
            
            if (lastDate < yesterdayIST) {
                currentStreak = 0;

                if (user.streak !== 0) {
                    user.streak = 0;
                    await user.save();
                }
            }
        }
        else{      // never completed a goal
            currentStreak = 0;
        }
        
        return res.status(200).json({
            stats: {
                currentStreak : currentStreak,
                ...mainStats    // combining the main stats with current streak
            },
            streakGraph : last7Days,
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