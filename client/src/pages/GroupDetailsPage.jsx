import React, { useEffect, useState, useContext} from "react";
import { getGroupDetails } from "../api/groupService";
import { createGoal, getUserGoals } from "../api/goalService";
import { useParams, Link } from "react-router-dom";
import GoalItem from "../components/GoalItem";
import { addResource, deleteResource, getGroupResources } from "../api/resourceService";
import apiClient from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import './GroupDetailsPage.css';

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
    const [goalDueDate, setGoalDueDate] = useState("");

    const [resources, setResources] = useState([]);
    const [resourceType, setResourceType] = useState("link");
    const [resLink, setResLink] = useState("");
    const [resFile, setResFile] = useState(null);
    const [resTitle, setResTitle] = useState("");

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
            setError(err.message || "Failed to load group details.");
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

    const refreshResources = async () => {
        try{
            const resourceData = await getGroupResources(id);
            setResources(resourceData);
        }
        catch(err){
            console.error("Failed to refresh resources", err);
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
        try{
            const newGoal = {
                title : goalTitle,
                description : goalDesc,
                groupId : id,
                dueDate : goalDueDate || null
            }
            await createGoal(newGoal);
            toast.success("Group goal created!");
            
            setGoalTitle("");
            setGoalDesc("");
            setGoalDueDate("");

            await refreshGoalsOnly();
        }
        catch(err){
            toast.error(err.message || "Failed to create goal");
        }
    }

    const handleAddResource = async (e) => {
        e.preventDefault();
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
            toast.success("Resource shared successfully!");

            setResTitle("");
            setResLink("");
            setResFile(null);
            await refreshResources();
        }
        catch(err){
            toast.error(err.message || "Unable to share resource");
        }
    }

    const handleDeleteResource = async (resourceId) => {
        if(!window.confirm("Are you sure you want to delete this resource?"))
            return;
        try{
            await deleteResource(resourceId, id);
            toast.success("Resource deleted");
            await refreshResources();
        }
        catch(err){
            console.error("Failed to delete resource", err);
            toast.error("Failed to delete resource");
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
            toast.info("Downloading...");
                        const response = await apiClient.get(
                            `/resources/download/${resource._id}`,
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
            toast.success("Download completed");
        }
        catch (err) {
            console.error("Download failed:", err);
            toast.error("Unable to download file");
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
        <h1>{group.name}</h1>
        <p>{group.description}</p>
        <p><strong>Group ID:</strong> {group._id}</p>
        <small>Created by: {group.createdBy.name} ({group.createdBy.email})</small>

        {/* Leaderboard */}
        <div className="card leaderboard-card">
            <h2>Leaderboard</h2>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Member</th>
                        <th>Goals Completed</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((member, index) => {
                        const rankClass = index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "";
                        return (
                            <tr key={member._id}>
                                <td>
                                    <span className={`rank-badge ${rankClass}`}>
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                    </span>
                                </td>
                                <td>
                                    <div className="member-name">
                                        {member.name}
                                        {member._id === group.createdBy._id && (
                                            <span className="admin-badge">Admin</span>
                                        )}
                                    </div>
                                </td>
                                <td>{member.score}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Members */}
        <div className="card members-card">
            <h2>Members ({group.members.length})</h2>
            <ul className="members-list">
                {group.members.map( (member) => (
                    <li key={member._id} className="member-item">
                        <div className="member-info">
                            <div className="member-name-text">{member.name}</div>
                            <div className="member-email">{member.email}</div>
                        </div>
                        {member._id === group.createdBy._id && (
                            <span className="admin-badge">Admin</span>
                        )}
                    </li>
                ) )}
            </ul>
        </div>
        
        {/* Group Goals */}
        <div className="card goals-section-card">
            <h2>Group Goals</h2>
            
            <div className="card create-goal-card">
                <h4>Create a Goal for this Group</h4>
                <form onSubmit={handleCreateGoal} className="create-goal-form">
                    <div className="form-row-top">
                        <div className="form-field">
                            <label>Title</label>
                            <input
                                type="text"
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label>Due Date:</label>
                            <input
                                type="date"
                                value={goalDueDate}
                                onChange={(e) => setGoalDueDate(e.target.value)}   
                            />
                        </div>
                    </div>
                    
                    <div className="form-row-bottom">
                        <div className="form-field form-field-description">
                            <label>Description</label>
                            <textarea
                                value={goalDesc}
                                onChange={(e) => setGoalDesc(e.target.value)}
                                placeholder="Enter goal description (optional)"
                            />
                        </div>
                        <button className="btn btn-primary btn-create-goal" type="submit">Create Goal</button>
                    </div>
                </form>
            </div>
            
            {groupGoals.length > 0 ? (
                <ul className="goals-list">
                    { groupGoals.map( (goal) => (
                        <GoalItem
                            key={goal._id}
                            goal={goal}
                            onGoalUpdate={refreshGoalsOnly}
                        />
                    ) ) }
                </ul>
            ) : (
                <p className="empty-goals">No Goals set for this group yet.</p>
            )}
        </div>

        {/* Resources */}
        <section className="resources-section">
            <h2>Shared Resources</h2>

            <div className="add-resource-container">
                <h4>Share a resource</h4>
                <div className="resource-type-selector">
                    <label>
                        <input
                            type="radio"
                            name="resType"
                            checked={resourceType === "link"}
                            onChange={() => setResourceType("link")}
                        />
                        <span>Link</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="resType"
                            checked={resourceType === "file"}
                            onChange={() => setResourceType("file")}
                        />
                        <span>File (PDF, Doc, Image)</span>
                    </label>
                </div>
                
                <form onSubmit={handleAddResource} className="resource-form">
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
                </form>
            </div>

            <ul className="resources-list">
                {resources.length > 0 ? (
                    resources.map( (resource) => {
                        const isOwner = resource.addedBy._id === user.id;
                        const isAdmin = group.createdBy._id === user.id;

                        return(
                            <li key={resource._id} className="resource-item">
                                <div>
                                    {resource.publicId ? (
                                        <button 
                                            className="resource-download"
                                            onClick={() => handleDownload(resource)}
                                        >
                                            📎 {resource.title}
                                        </button>
                                    ) : (
                                        // 🔗 External link → open normally
                                        <a
                                            className="resource-link"
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🔗 {resource.title}
                                        </a>
                                    )}
                                </div>
                                {(isOwner || isAdmin) && (
                                    <div className="resource-actions">
                                        <button 
                                            className="btn-delete-resource"
                                            onClick={() => handleDeleteResource(resource._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </li>
                        );
                    })
                ) : (
                    <p className="empty-resources">No resources shared yet.</p>
                )}
            </ul>
        </section>
    </div>
  );
};

export default GroupDetailsPage;