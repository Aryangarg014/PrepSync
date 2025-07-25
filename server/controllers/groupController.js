const Group = require("../models/Group");

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
        res.status(500).send("Internal Server Error");
    }
}

async function joinGroup(req, res){
    
}

async function getUserGroups(req, res){
    const userId = req.user.id;
    try{
        const userGroups = await Group.find({ members : userId });

        return res.status(200).json(userGroups);
    }
    catch(error){
        console.error("Error in fetching all user groups : ", error.message);
        res.status(500).send("Internal Server Error.");
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
        res.status(500).send("Internal Server Error.");
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
        res.status(500).send("Internal Server Error.");
    }
}

module.exports = {
    createGroup,
    joinGroup,
    getUserGroups,
    getGroupDetails,
    deleteGroup
};