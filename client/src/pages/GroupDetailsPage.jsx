import React, { useEffect, useState, useContext} from "react";
import { getGroupDetails } from "../api/groupService";
import { createGoal, getUserGoals } from "../api/goalService";
import { useParams, Link } from "react-router-dom";
import GoalItem from "../components/GoalItem";
import { addResource, deleteResource, getGroupResources } from "../api/resourceService";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const GroupDetailsPage = () => {
    const { id } = useParams();     // Group Id
    const { user } = useContext(AuthContext);   // get user object for user ID
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [groupGoals, setGroupGoals] = useState([]);

    const [leaderboard, setLeaderboard] = useState([]);

    const [goalTitle, setGoalTitle] = useState("");
    const [goalDesc, setGoalDesc] = useState("");
    const [goalCreationError, setGoalCreationError] = useState(null);

    const [resources, setResources] = useState([]);
    const [resourceType, setResourceType] = useState("link");
    const [resLink, setResLink] = useState("");
    const [resFile, setResFile] = useState(null);
    const [resTitle, setResTitle] = useState("");
    const [resError, setResError] = useState(null);

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

            const resourceData = await getGroupResources(id);
            setResources(resourceData);

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
            console.error("Failed to refresh goals", err.message);
        }
    };

    const refreshResources = async () => {
        try{
            const resourceData = await getGroupResources(id);
            setResources(resourceData);
        }
        catch(err){
            console.error("Failed to refresh resources", err.message);
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

    const handleAddResource = async (e) => {
        e.preventDefault();
        setResError(null);
        try{
            const formData = new FormData();
            formData.append("title", resTitle);
            formData.append("groupId", id);

            if(resourceType === "link"){
                formData.append("url", resLink);
            }
            else{
                if(!resFile) throw new Error("Please select a file.");
                formData.append("resourceFile", resFile);
            }
            await addResource(formData);

            setResTitle("");
            setResLink("");
            setResFile(null);
            await refreshResources();
        }
        catch(err){
            setResError(err.message);
        }
    }

    const handleDeleteResource = async (resourceId) => {
        if(!window.confirm("Are you sure you want to delete this resource?"))
            return;
        try{
            await deleteResource(resourceId, id);
            await refreshResources();
        }
        catch(err){
            alert(err.message);
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDownload = async (resource) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
              `http://localhost:8080/resources/download/${resource._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                responseType: "blob", // VERY IMPORTANT
              }
            );

            // Create a downloadable file
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = resource.title; // filename
            document.body.appendChild(a);
            a.click();

            // Cleanup
            a.remove();
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file");
        }
    };

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
        <section className="resources-section">
            <h2>Shared Resources</h2>

            <div className="add-resource-container">
                <h4>Share a resource</h4>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="resType"
                            checked={resourceType === "link"}
                            onChange={() => setResourceType("link")}
                        /> Link
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="resType"
                            checked={resourceType === "file"}
                            onChange={() => setResourceType("file")}
                        /> File (PDF, Doc, Image)
                    </label>
                </div>
                
                <form onSubmit={handleAddResource}>
                    <input
                        type="text"
                        placeholder="Resource Title"
                        value={resTitle || ""}
                        onChange={(e) => setResTitle(e.target.value)}
                    />

                    {resourceType === "link" ? (
                        <input
                            type="url"
                            placeholder="Resource URL (e.g., https://www.example.com)"
                            value={resLink || ""}
                            onChange={(e) => setResLink(e.target.value)}
                            required
                        />
                    ) : (
                        <input
                            type="file"
                            onChange={(e) => setResFile(e.target.files[0])}
                            required
                        />
                    )}

                    <button type="submit">
                        {resourceType === "link" ? "Add link" : "Upload File"}
                    </button>
                    {resError && <p style={{ color : "red" }}> {resError} </p>}
                </form>
            </div>

            <div className="resources-list">
                {resources.length > 0 ? (
                    resources.map( (resource) => {
                        const isOwner = resource.addedBy._id === user.id;
                        const isAdmin = group.createdBy._id === user.id;

                        return(
                            <li key={resource._id}>
                                <div>
                                    {resource.publicId ? (
                                        // 📎 Uploaded file → download
                                        <button onClick={() => handleDownload(resource)}>
                                            📎 {resource.title}
                                        </button>
                                    ) : (
                                        // 🔗 External link → open normally
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🔗 {resource.title}
                                        </a>
                                    )}
                                </div>
                                {(isOwner || isAdmin) && (
                                    <button onClick={() => handleDeleteResource(resource._id)}>
                                        Delete
                                    </button>
                                )}
                            </li>
                        );
                    })
                ) : (
                    <p>No resources shared yet.</p>
                )}
            </div>
        </section>
    </div>
  );
};

export default GroupDetailsPage;