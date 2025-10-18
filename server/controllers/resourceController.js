const Resource = require("../models/Resource");
const Group = require("../models/Group");
const cloudinary = require('cloudinary').v2;

async function addResource(req, res){
    const {title, url, groupId} = req.body;
    const userId = req.user.id;
    try{
        if(!groupId || (!url && !req.file)){
            return res.status(400).json({message : "Group ID and either a file or url are required."});
        }
        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).json({message : "Group not found."});
        }
        if(!group.members.includes(userId)){
            return res.status(403).json({message : "You are not a member of this group."});
        }

        const newResource = new Resource({
            title : title || (req.file ? req.file.originalname : url),
            addedBy : userId,
            groups : [groupId]
        })

        if(req.file){   // a file was uploaded
            newResource.url = req.file.path;        // the link where the file is hosted on cloudinary
            newResource.publicId = req.file.filename;
        }
        else{   // it was a link
            newResource.url = url;      // public id remains null
        }
        await newResource.save();
        return res.status(201).json({ message : "Resource added successfully.", resource : newResource});
    }
    catch(error){
        console.error("Error adding resource : ", error.message);
        if(error.message.includes('File type not supported')){
            return res.status(400).json({message : "File type not supported"});
        }
        if(error.code === 'LIMIT_FILE_SIZE'){
            return res.status(400).json({message : "File is too large. Maximum size supported is 5MB."})
        }
        res.status(500).json({ error : "Internal Server Error" });
    }
}

async function getGroupResources(req, res){
    const groupId = req.params.id;
    const userId = req.user.id;
    try{
        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).json({ message : "Group not found." });
        }
        if(!group.members.includes(userId)){
            return res.status(403).json({ message : "You are not a member of this group." });
        }
        
        const resources = await Resource.find({ groups : groupId })
                                    .populate("addedBy", "name email")
                                    .sort({ createdAt : -1 });
        return res.status(200).json(resources);
    }
    catch(error){
        console.error("Error fetching group resources : ", error.message);
        return res.status(500).json({ error : "Internal Server Error" });
    }
}

async function deleteResource(req, res){
    const { resourceId, groupId } = req.params;
    const userId = req.user.id;

    try{
        const resource = await Resource.findById(resourceId);
        if(!resource){
            return res.status(404).json({ message : "Resource not found." });
        }
        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).json({ message : "Group not found. "});
        }
        if(!resource.groups.includes(groupId)){
            return res.status(400).json({ message : "This resource is not part of this group. "});
        }

        const isAdmin = group.createdBy.toString() === userId;
        const isOwner = resource.addedBy.toString() === userId;

        if(!isAdmin && !isOwner){
            return res.status(403).json({ message : "You do not have permission to remove this resource." });
        }
        resource.groups.pull(groupId);
        await resource.save();

        if(resource.groups.length === 0){   // no longer associated with any group
            if(resource.publicId){      // delete permanently from cloud
                await cloudinary.uploader.destroy(resource.publicId);
            }
            await Resource.findByIdAndDelete(resourceId);   // delete from database.
            return res.status(200).json({ message : "Resource removed from group and deleted permanently." });
        }

        return res.status(200).json({ message : "Resource removed from group." });
    }
    catch(error){
        console.error("Error deleting resource : ", error.message);
        return res.status(500).json({ error : "Internal Server Error" });
    }
}

module.exports = {
    addResource,
    getGroupResources,
    deleteResource
}