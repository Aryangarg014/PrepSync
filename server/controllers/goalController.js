const Goal = require("../models/Goal");
const Group = require("../models/Group");

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
        res.status(500).send("Internal Server Error");
    }
}

async function getUserGoals(req, res){

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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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
        
        return res.status(200).json( { message : "Goal marked completed successfully.", goal } );
    }
    catch(error){
        console.error("Error marking the goal as completed: ", error.message);
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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