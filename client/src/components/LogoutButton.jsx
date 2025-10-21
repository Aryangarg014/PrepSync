import React, {useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    
    return (
        <button onClick={ handleLogout } style={{ backgroundColor : "red", color : "white" }}>
            Logout
        </button>
    );
};

export default LogoutButton;