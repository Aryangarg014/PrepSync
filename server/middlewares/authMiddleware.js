const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    // The request will contain the field authorization : Bearer <token>
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message : "Token Missing or Invalid format. Format is -> Bearer token" });
    }

    const token = authHeader.split(" ")[1];
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;
        next();
    }
    catch(error){
        console.error("JWT verification failed:", error.message);
        return res.status(401).json({ message : "Invalid or Expired Token." });
    }
}

module.exports = authenticateUser;