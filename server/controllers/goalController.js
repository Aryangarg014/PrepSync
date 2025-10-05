const Goal = require("../models/Goal");
const Group = require("../models/Group");
const User = require("../models/User");

async function createGoal(req, res){
    const userId = req.user.id;
    const {title, description, dueDate, groupId} = req.body;
    try{
        if(!title || title.trim() === ""){
            return res.status(400).json( { message : "Title is required." } );
        }

        if(dueDate && new Date(dueDate) <= new Date()){
            return res.status(400).json( { message : "The due date for goal should be in future." } );
        }
        
        const newGoal = new Goal({
            title,
            dueDate,
            createdBy : userId
        })

        if(!description || description.trim() === ""){
            newGoal.description = "";
        }
        else{
            newGoal.description = description;
        }

        if(groupId){
            const foundGroup = await Group.findById(groupId);
            if(!foundGroup){
                return res.status(404).json( { message : "Group not found." } );
            }

            if(!foundGroup.members.includes(userId)){
                return res.status(403).json( { message : "You are not a member of this group" } );
            }
            newGoal.group = groupId;
        }
        
        await newGoal.save();

        res.status(201).json( { message: "Goal created successfully.", goal : newGoal });
    }
    catch(error){
        console.error("Error in creating goal : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function getUserGoals(req, res){
    const userId = req.user.id;
    try{
        const personalGoals = await Goal.find({ group: null, createdBy : userId })
                                        .sort({ createdAt : -1 })
                                        .populate("createdBy", "name email")
                                        .populate("completedBy.user", "name email");

        const userGroups = await Group.find({ members : userId }).select("_id");
        const groupIds = userGroups.map(g => g._id);

        const groupGoals = await Goal.find({ group : { $in : groupIds }})
                                    .sort({ createdAt : -1 })
                                    .populate("group", "name")
                                    .populate("createdBy", "name email")
                                    .populate("completedBy.user", "name email");

        return res.status(200).json({ personalGoals, groupGoals });
    }
    catch(error){
        console.error("Error fetching user goals: ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function getGoalsByGroup(req, res){
    const userId = req.user.id;
    const groupId = req.params.id;
    try{
        const group = await Group.findById(groupId);
        
        if(!group){
            return res.status(404).json( { message : "Group not found." } );
        }

        if(!group.members.includes(userId)){
            return res.status(403).json( { message : "You are not a member of this group" } );
        }

        const goals = await Goal.find({group : groupId})
                                .populate("createdBy", "name email")
                                .populate("completedBy.user", "name email");

        return res.status(200).json(goals);
    }
    catch(error){
        console.error("Error fetching group goals: ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function getGoalDetails(req, res){
    const goalId = req.params.id;
    const userId = req.user.id;
    try{
        // after populating createdBy and completedBy become objects.
        const goal = await Goal.findById(goalId)
                                .populate("createdBy", "name email")
                                .populate("completedBy.user", "name email");
        
        if(!goal){
            return res.status(404).json( { message : "Goal not found." } ); 
        }

        if(goal.group){     // Group Goal
            const group = await Group.findById(goal.group);
            if(!group){
                return res.status(404).json( { message : "Group not found." } );
            }

            if(!group.members.includes(userId)){
                return res.status(403).json( { message : "You are not a member of this group." } );
            }
        }
        else{       // Personal Goal
            if(goal.createdBy._id.toString() !== userId){
                return res.status(403).json( { message : "This goal is not created by you." } );
            }
        }

        return res.status(200).json(goal);
    }
    catch(error){
        console.error("Error fetching goal details: ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function markGoalComplete(req, res){
    const userId = req.user.id;
    const goalId = req.params.id;
    try{
        const goal = await Goal.findById(goalId);
        if(!goal){
            return res.status(404).json( { message : "Goal not found." } );
        }

        if(goal.group){     // Group Goal
            const group = await Group.findById(goal.group);
            if(!group){
                return res.status(404).json( { message : "Group not found." } );
            }
            if(!group.members.includes(userId)){
                return res.status(403).json( { message : "You are not a member of this group." } );
            }
        }
        else if(goal.createdBy.toString() !== userId){      // Personal Goal
            return res.status(403).json( { message : "This goal is not created by you." } );
        }

        let alreadyCompleted =  goal.completedBy.some((c) => c.user.toString() == userId );
        if(alreadyCompleted){
            return res.status(400).json( { message : "You have already completed this goal." } );
        }

        if(!goal.dueDate || (goal.dueDate && new Date() <= goal.dueDate)){
            goal.completedBy.push({user : userId, status : "on-time"});
        }
        else{
            goal.completedBy.push({user : userId, status : "late"});
        }
        await goal.save();

        // STREAK
        const user = await User.findById(userId);

        const now = new Date();
        const istTime = now.getTime() + (5.5 * 60 * 60 * 1000);
        const dateInIndia = new Date(istTime);

        // Manually set the time to the start of the day (midnight)
        const today = new Date(dateInIndia);
        today.setUTCHours(0, 0, 0, 0); // Use setUTCHours for consistency

        if (user.lastCompletedDate &&
            user.lastCompletedDate.getDate() == today.getDate() && user.lastCompletedDate.getMonth() == today.getMonth()
            && user.lastCompletedDate.getFullYear() == today.getFullYear()){

            // Already Completed another goal today (streak not updated)
            return res.status(200).json( { message : "Goal marked completed successfully.", goal } );
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (user.lastCompletedDate &&
            user.lastCompletedDate.getDate() == yesterday.getDate() && user.lastCompletedDate.getMonth() == yesterday.getMonth()
            && user.lastCompletedDate.getFullYear() == yesterday.getFullYear()
        ){
            user.streak += 1;
        }
        else{
            user.streak = 1;
        }

        user.lastCompletedDate = today;
        await user.save();
        return res.status(200).json( { message : "Goal marked completed successfully and streak updated.", goal, streak : user.streak } );
    }
    catch(error){
        console.error("Error marking the goal as completed: ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function deleteGoal(req, res){
    const goalId = req.params.id;
    const userId = req.user.id;
    try{
        const goal = await Goal.findById(goalId);
        if(!goal){
            return res.status(404).json( { message : "Goal not found." } );
        }

        let isGoalCreator = goal.createdBy.toString() === userId;
        
        if(goal.group){         // Group Goals
            const group = await Group.findById(goal.group);
            let isGroupAdmin = false;

            if(!group){
                return res.status(404).json( { message: "Group not found." } );
            }

            if(userId === group.createdBy.toString()){
                isGroupAdmin = true;
            }

            if(!isGoalCreator && !isGroupAdmin){
                return res.status(403).json( { message : "Only the goal creator or group admin can delete the goal." });
            }
        }
        else{       // Personal Goals
            if(!isGoalCreator){
                return res.status(403).json( { message : "Only the goal creator can delete the goal." });
            }
        }

        const deletedGoal = await Goal.findByIdAndDelete(goalId);
        return res.status(200).json({ message: "Goal deleted successfully.", goal: deletedGoal });
    }
    catch(error){
        console.error("Error deleting goal : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function updateGoal(req, res){
    const goalId = req.params.id;
    const userId = req.user.id;
    const {title, description, dueDate} = req.body;
    try{
        const goal = await Goal.findById(goalId);
        if(!goal){
            return res.status(404).json( { message : "Goal not found." } );
        }

        let isGoalCreator = goal.createdBy.toString() === userId;
        
        if(goal.group){         // Group Goals
            const group = await Group.findById(goal.group);
            let isGroupAdmin = false;

            if(!group){
                return res.status(404).json( { message: "Group not found." } );
            }

            if(userId === group.createdBy.toString()){
                isGroupAdmin = true;
            }

            if(!isGoalCreator && !isGroupAdmin){
                return res.status(403).json( { message : "Only the goal creator or group admin can update the goal." });
            }
        }
        else{       // Personal Goals
            if(!isGoalCreator){
                return res.status(403).json( { message : "Only the goal creator can update the goal." });
            }
        }

        if(title && title.trim() !== ""){
            goal.title = title;
        }
        if(description && description.trim() !== ""){
            goal.description = description;
        }
        if(dueDate){
            if(new Date(dueDate) <= new Date()){
                return res.status(400).json( { message : "The due date for goal should be in future." } )
            }
            goal.dueDate = dueDate;
        }

        await goal.save();
        return res.status(200).json( { message : "Goal updated successfully.", goal} );
    }
    catch(error){
        console.error("Error updating goal : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

module.exports = {
    createGoal,
    getUserGoals,
    getGoalsByGroup,
    getGoalDetails,
    markGoalComplete,
    deleteGoal,
    updateGoal
}