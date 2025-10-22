import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getDashboardData } from "../api/dashboardService";

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try{
                setLoading(true);       // loading started
                const dashboardData = await getDashboardData();
                setData(dashboardData);
                setError(null);
            }
            catch(err){
                setError(err.message);
            }
            finally{
                setLoading(false);      // loading finished
            }
        }

        fetchData();
    }, [])      // this useEffect will run once when the page loads.

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>
            {user ? ( <h2>Welcome, {user.name}!</h2> ) : ( <h2>Welcome!</h2> )}

            { loading && <p>Loading dashboard data...</p> }

            { error && <p style={{ color : "red" }}>Error : {error}</p> }

            { data && (
                <div style={{ marginTop : "2rem" }}>
                    <h3>Your Stats: </h3>
                    <p>Current Streak: {data.stats.currentStreak}</p>
                    <p>Total Goals Completed: {data.stats.totalCompleted}</p>
                    <p>Personal Goals Completed: {data.stats.personalGoalsCompleted}</p>
                    <p>Group Goals Completed: {data.stats.groupGoalsCompleted}</p>
                    <p>Total Pending Goals: {data.stats.totalPending}</p>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;