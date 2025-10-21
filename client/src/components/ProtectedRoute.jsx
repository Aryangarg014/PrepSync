import React, {useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    if(loading){
        return <div>Loading Session...</div>;
    }

    if(!isAuthenticated){
        // replace prevents the user from clicking back button to come back at the protected page.
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;