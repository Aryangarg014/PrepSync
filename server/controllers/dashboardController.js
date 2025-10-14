const User = require("../models/User");
const Goal = require("../models/Goal");
const Group = require("../models/Group");

async function getMainStats(userId){

}

async function getDailyCompletions(userId, days){

}

async function getGroupPerformance(req, res){

}


async function getDashboardData(req, res){
    const userId = req.user.id;
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