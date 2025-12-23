import React, { useEffect, useState } from "react";
import { getGroupDetails } from "../api/groupService";
import { createGoal, getUserGoals } from "../api/goalService";
import { useParams, Link } from "react-router-dom";
import GoalItem from "../components/GoalItem";

const GroupDetailsPage = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [groupGoals, setGroupGoals] = useState([]);

    const [leaderboard, setLeaderboard] = useState([]);

    const [goalTitle, setGoalTitle] = useState("");
    const [goalDesc, setGoalDesc] = useState("");
    const [goalCreationError, setGoalCreationError] = useState(null);
    
    const fetchAllData = async () => {
        try{
            setLoading(true);

            const groupData = await getGroupDetails(id);
            setGroup(groupData);

            const allGoals = await getUserGoals();
            const filteredGoals = allGoals.groupGoals.filter(
                (g) => g.group && g.group._id === id
            )
            setGroupGoals(filteredGoals);

            calculateLeaderboard(groupData.members, filteredGoals);

            setError(null);
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    };

    const refreshGoalsOnly = async () => {      // refreshing goals after creating / updating a goal
        try {
            const allGoals = await getUserGoals();
            const filteredGoals = allGoals.groupGoals.filter(
                (g) => g.group && g.group._id === id
            );
            setGroupGoals(filteredGoals);

            if(group){
                calculateLeaderboard(group.members, filteredGoals);
            }
        } catch (err) {
            console.error("Failed to refresh goals", err);
        }
    };


    const calculateLeaderboard = (members, goals) => {
        if(!members || !goals) return;

        const scoreMap = {};
        members.forEach( (member) =>{
            scoreMap[member._id] = 0;
        });

        goals.forEach((goal) => {
            goal.completedBy.forEach( (record) => {
                const userId = record.user._id;

                if(scoreMap[userId] !== undefined){
                    scoreMap[userId]++;
                }
            });
        });

        const rankedList = members.map( (member) => ({
            ...member,
            score : scoreMap[member._id]
        })).sort((a, b) => b.score - a.score);

        setLeaderboard(rankedList);
    }


    useEffect(() => {
        fetchAllData();
    }, [id]);   // whenver id in the URL changes, refresh

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        setGoalCreationError(null);
        try{
            const newGoal = {
                title : goalTitle,
                description : goalDesc,
                groupId : id
            }
            await createGoal(newGoal);

            setGoalTitle("");
            setGoalDesc("");

            await refreshGoalsOnly();
        }
        catch(err){
            setGoalCreationError(err.message);
        }
    }

    if (loading) {
        return <div className="loading-state">Loading group details...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}</div>;
    }

    if (!group) {
        return <div className="not-found-state">Group not found.</div>;
    }

  return(
    <div className="group-details-page">
        
        <div className="group-nav">
            <Link to="/my-groups" className="back-link">← Back to My Groups</Link>
        </div>

        {/* Group Details */}
        <h1 style={{ marginTop: "1rem" }}> {group.name} </h1>
        <p> {group.description} </p>
        <p><strong>Group ID:</strong> {group._id}</p>
        <small>Created by: {group.createdBy.name} ({group.createdBy.email})</small>

        <div>
            <h2>🏆 Leaderboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Member</th>
                        <th>Goals Completed</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((member, index) => (
                            <tr key={member._id}>
                                <td> {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}</td>
                                <td> {member.name} {member._id === group.createdBy._id && "(Admin)"}</td>
                                <td> {member.score}</td>
                            </tr>
                    ))}
                </tbody>
            </table>

        </div>

        <div style={{ marginTop : "2rem" }}>
            <h2>Members ({group.members.length})</h2>
            <ul style={{ listStyle : "none" }}>
                {group.members.map( (member) => (
                    <li key={member._id} style={{ border : "1px solid black", padding: "0.5rem", marginTop : "1rem" }}>
                        {member.name} ({member.email})
                    </li>
                ) )}
            </ul>
        </div>
        
        {/* Group Goals */}
        <div>
            <h2>Group Goals</h2>
            <div style={{ marginTop : "1rem" }}>
                <h4>Create a Goal for this Group</h4>
                <form onSubmit={handleCreateGoal}>
                    <div style={{marginBottom : "0.5rem"}}>
                        <input
                            type="text"
                            placeholder="Goal Title"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                            required
                            style={{ marginRight: "0.5rem" }}
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={goalDesc}
                            onChange={(e) => setGoalDesc(e.target.value)}
                        />
                    </div>

                    <button type="submit">Create Group Goal</button>
                    {goalCreationError && <p style={{ color : "red" }}>{goalCreationError}</p>}
                </form>
            </div>
            
            {groupGoals.length > 0 ? (
                <ul>
                    { groupGoals.map( (goal) => (
                        <GoalItem
                            key={goal._id}
                            goal={goal}
                            onGoalUpdate={refreshGoalsOnly}
                        />
                    ) ) }
                </ul>
            ) : (
                <p>No Goals set for this group yet.</p>
            )}
        </div>

        {/* Resources */}
    </div>
  );
};

export default GroupDetailsPage;