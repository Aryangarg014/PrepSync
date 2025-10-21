import React from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>
            {user ? ( <h2>Welcome, {user.name}!</h2> ) : ( <h2>Welcome!</h2> )}
        </div>
    );
}

export default DashboardPage;