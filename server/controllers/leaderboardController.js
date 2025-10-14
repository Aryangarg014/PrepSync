const Group = require("../models/Group");
const User = require("../models/User");
const Goal = require("../models/Goal");

async function getGroupLeaderboard(req, res) {
    const groupId = req.params.id;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }

        // getting the streak of all members
        const members = await User.find({ _id: { $in: group.members } }).select("name email streak");

        // Count number of completed goals for this group by each member
        const goalCounts = await Goal.aggregate([
            { $match: { group: group._id } },       // Only goals from this group
            { $unwind: "$completedBy" },
            { 
                $group: {       // group by user
                    _id: "$completedBy.user", 
                    totalCompletedInGroup: { $sum: 1 } 
                } 
            }
        ]);

        // Generating final members by combining the streak and the goal count
        const leaderboard = members.map(member => {
            const memberGoalCount = goalCounts.find(u => u._id.toString() === member._id.toString());
            return {
                userId: member._id,
                name: member.name,
                email: member.email,
                streak: member.streak || 0,
                // check if that memberGoalCount exist (whether the member has completed this group's any goal or not)
                totalCompletedInGroup: memberGoalCount ? memberGoalCount.totalCompletedInGroup : 0
            };
        });

        // Sort the leaderboard: highest streak first, then by goals completed
        leaderboard.sort((a, b) => {
            if (b.streak !== a.streak) {
                return b.streak - a.streak;
            }
            return b.totalCompletedInGroup - a.totalCompletedInGroup;
        });

        res.status(200).json(leaderboard);

    } catch (error) {
        console.error("Error generating leaderboard:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getGroupLeaderboard
};