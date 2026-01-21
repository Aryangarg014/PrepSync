import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getDashboardData } from "../api/dashboardService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
         PieChart, Pie, Cell, Legend } 
from 'recharts';
import './DashboardPage.css';
import { toast } from "react-toastify";

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
                console.error(err);
                setError(err.message || "Failed to load dashboard.");
                toast.error("Could not load latest data.");
            }
            finally{
                setLoading(false);      // loading finished
            }
        }

        fetchData();
    }, [])      // this useEffect will run once when the page loads.

    if (loading) return <div className="loading-state">Loading Analytics...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;
    if(!data) return null;

    // PIE Chart Colors
    const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];

    const pieData = data.groupPerformance.map(group => ({
        name: group.groupName || "Unknown Group",
        value: group.completedInGroup
    }))

    if(data.stats.personalGoalsCompleted > 0){
        pieData.push({
            name : "Personal Goals",
            value : data.stats.personalGoalsCompleted
        })
    }

    // HEATMAP COLORS
    const getHeatmapColor = (count) => {
        if (count === 0) return '#e5e7eb'; // Gray (Empty)
        if (count === 1) return '#a2f8c0ff'; // Very Light Green
        if (count === 2) return '#43da7aff'; // Light Green
        if (count === 3) return '#16a34a'; // Medium Green
        return '#14532d';                  // Dark Green (4+ goals)
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <p> Welcome back, <strong>{user?.name}</strong> </p>
            </header>

            <div className="stats-container">
                {/* Streak */}
                <div className="kpi-card card-streak">
                    <h3>Current Streak</h3>
                    <p className="big-number">{data.stats.currentStreak} Days</p>
                </div>

                {/* Total Completed */}
                <div className="kpi-card card-completed">
                    <h3>Total Completed</h3>
                    <p className="big-number">{data.stats.totalCompleted}</p>
                </div>

                {/* Pending */}
                <div className="kpi-card card-pending">
                    <h3>Pending Goals</h3>
                    <p className="big-number">{data.stats.totalPending}</p>
                </div>

                {/* Group Goals */}
                <div className="kpi-card card-group">
                    <h3>Group Contrib.</h3>
                    <p className="big-number">{data.stats.groupGoalsCompleted}</p>
                </div>
            </div>

            <div className="charts-container">
                {/* 7 Days Chart */}
                <div className="chart-card">
                    <h3>📅 Last 7 Days</h3>

                    <div style={{ width : "100%", height : 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.streakGraph}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="date"
                                    angle={-30}
                                    textAnchor="end"
                                    height={60}
                                />

                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" name="Goals Completed"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GroupWise Distribution of Goal Completions */}
                <div className="chart-card">
                    <h3>🎯 Focus Distribution</h3>
                    <div style={{width : "100%", height : 300}}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={30}
                                    dataKey="value"
                                    
                                >
                                    { pieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="heatmap-section chart-card">
                <h3>Consistency (Last 90 Days)</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                    Every Square is a day. The darker the green, the more goals you completed!
                </p>
                <div className="heatmap-grid">
                    { data.heatmap.map((day, index) => (
                        <div 
                            key={index}
                            className="heatmap-cell"
                            style={{ backgroundColor : getHeatmapColor(day.count)}}
                            data-tooltip={`${day.date}: ${day.count} goals completed`}
                        />
                    )) }
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;