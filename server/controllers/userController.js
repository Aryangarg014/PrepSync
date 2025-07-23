const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function signup(req, res) {
    const { name, email, password } = req.body;
    try{
        if(!name || !email || !password){
            return res.status(400).json({ message : "Some fields are missing." });
        }

        const user = await User.findOne({ email });
        if(user){
            return res.status(400).json( { message : "User already exists with this email."});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password : hashedPassword
        })
        await newUser.save();

        const token = jwt.sign({ id : newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn : "3d" });
        res.status(201).json({
            message : "Signup is successful.",
            token,
            user: { 
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch(error){
        console.error("Error during Signup: ", error.message);
        res.status(500).send("Internal Server Error");
    }
}

async function login(req, res) {
    const {email, password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({ message : "All fields are required." });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json( { message : "Invalid Credentials!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json( { message : "Invalid Credentials!"});
        }

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET_KEY, {expiresIn : "3d"});
        res.status(200).json({
            token,
            user: { 
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }
    catch(error){
        console.error("Error during Login : ", error.message);
        res.status(500).send("Internal Server Error");
    }
}

async function getUserProfile(req, res) {
    const userId = req.params.id;
    try{
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(404).json( { message : "User not found!"});
        }

        res.status(200).json(user);
    }
    catch(error){
        console.error("Error during fetching profile : ", error.message);
        res.status(500).send("Internal Server Error");
    }
}

async function updateUserProfile(req, res) {
    const userId = req.params.id;
    const {email, password} = req.body;
    try{
        if(!email && !password){
            return res.status(400).json( { message : "Atleast one field is required to update."});
        }

        let updatedFields = {};

        if(email){
            const existingUser = await User.findOne({ email });
            if(existingUser && existingUser._id.toString() !== userId){
                return res.status(400).json({ message: "Email is already in use by another user." });
            }
            updatedFields.email = email;
        }
        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedFields.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new : true }).select("-password");
        if(!updatedUser){
            return res.status(404).json( { message : "User not found!"});
        }

        res.status(200).json(updatedUser);
    }
    catch(error){
        console.error("Error during updating profile : ", error.message);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteUserProfile(req, res) {
    const userId = req.params.id;
    try{
        const deletedUser = await User.findByIdAndDelete(userId);
        if(!deletedUser){
            return res.status(404).json( { message : "User not found!"});
        }

        res.status(200).send("User Profile Deleted Successfully!");
    }
    catch(error){
        console.error("Error during deleting profile : ", error.message);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}