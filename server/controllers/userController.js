const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signup = async (req, res) => {
    try{
        const { name, email, password } = req.body;

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
            token
        });
    }
    catch(error){
        console.error("Signup Error : ", error);
        res.status(500).json({message : "Internal Server Error"});
    }
}

const login = (req, res) => {
    res.send("logging in..");
}

const getCurrentUser = (req, res) => {
    res.send("Current user fetched!");
}

// const getUserProfile = (req, res) => {
//     res.send("Profile fetched!");
// }

const updateUserProfile = (req, res) => {
    res.send("Profile updated!");
}

const deleteUserProfile = (req, res) => {
    res.send("Profile deleted..");
}

module.exports = {
    signup,
    login,
    getCurrentUser,
    // getUserProfile,
    updateUserProfile,
    deleteUserProfile
}