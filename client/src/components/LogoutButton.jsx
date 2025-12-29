import React, {useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LogoutButton = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info("Logged out. See you soon!");
        navigate("/login");
    };
    
    return (
        <button onClick={ handleLogout } style={{ backgroundColor : "red", color : "white", cursor : "pointer"}}>
            Logout
        </button>
    );
};

export default LogoutButton;