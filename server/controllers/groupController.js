const Group = require("../models/Group");
const User = require("../models/User");

async function createGroup(req, res){
    const userId = req.user.id;
    const {name, description} = req.body;
    try{
        if(!name || name.trim() === ""){
            return res.status(400).json( { message : "Group Name is required." } );
        }

        const newGroup = new Group({
            name,
            createdBy : userId,
            members : [userId]
        })
        
        if(description){
            newGroup.description = description;
        }
        await newGroup.save();

        res.status(201).json({ message : "Group Created Successfully.", group : newGroup });
    }
    catch(error){
        console.error("Error in creating group : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function joinGroup(req, res){
    const userId = req.user.id;
    const groupId = req.params.id;
    try{
        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).json({ message : "Group not found" });
        }
        if(group.members.includes(userId)){
            return res.status(400).json({ message : "Already a member of this group." });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message : "User not found." });
        }

        group.members.push(userId);
        user.joinedGroups.push(groupId);
        
        await group.save();
        await user.save();
        res.status(200).json({ message : "Group joined successfully.", group });
    }
    catch(error){
        console.error("Error joining group : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function leaveGroup(req, res) {
    const userId = req.user.id;
    const groupId = req.params.id;
    try{
        const group = await Group.findById(groupId)
        if(!group){
            return res.status(404).json({ message : "Group not found" });
        }
        if(!group.members.includes(userId)){
            return res.status(400).json({ message : "You are not a member of this group." });
        }

        if (group.createdBy.toString() === userId) {
            return res.status(403).json({ message: "Group Admin cannot leave the group. You may delete it instead." });
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message : "User not found." });
        }

        group.members = group.members.filter((memberId) => memberId.toString() !== userId);
        await group.save();
        user.joinedGroups.filter((joinedGroupId) => joinedGroupId.toString() != groupId);
        await user.save();
        res.status(200).json({ message : "Group left successfully.", group });
    }
    catch(error){
        console.error("Error in leaving group : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function getUserGroups(req, res){
    const userId = req.user.id;
    try{
        const userGroups = await Group.find({ members : userId });

        return res.status(200).json(userGroups);
    }
    catch(error){
        console.error("Error in fetching all user groups : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function getGroupDetails(req, res){
    const groupId = req.params.id;
    try{
        const group = await Group.findById(groupId)
                        .populate("createdBy", "name email")
                        .populate("members", "name email");
        if(!group){
            return res.status(404).json({ message : "Group not found" });
        }

        res.status(200).json(group);
    }
    catch(error){
        console.error("Error in fetching group details : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function deleteGroup(req, res){
    const groupId = req.params.id;
    const userId = req.user.id;
    try{
        const group = await Group.findById(groupId)
        if(!group){
            return res.status(404).json({ message : "Group not found" });
        }
        if(userId !== group.createdBy.toString()){
            return res.status(403).json({ message: "Only the group admin can delete the group." });
        }

        await Group.findByIdAndDelete(groupId);
        return res.status(200).json({ message : "Group deleted successfully." });
    }
    catch(error){
        console.error("Error in deleting group : ", error.message);
        res.status(500).json({ error : "Internal Server Error" });
    }
}

module.exports = {
    createGroup,
    joinGroup,
    leaveGroup,
    getUserGroups,
    getGroupDetails,
    deleteGroup
};