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
                id: user._id,
                name: user.name,
                email: user.email
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
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json( { message : "Invalid Credentials!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json( { message : "Invalid Credentials!"});
        }

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET_KEY, {expiresIn : "3d"});
        res.status(201).json({
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