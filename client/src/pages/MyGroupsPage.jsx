import React, { useState, useEffect } from "react";
import { createGroup, getUserGroups, joinGroup } from "../api/groupService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import './MyGroupsPage.css';

const MyGroupsPage = () => {
    // State for the list of groups
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the "Create New Group" form
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");

    const [groupIdToJoin, setGroupIdToJoin] = useState("");

    async function fetchGroups(){
        try{
            setLoading(true);
            const response = await getUserGroups();
            setGroups(response);
            setError(null);
        }
        catch(err){
            setError(err.message || "Failed to load groups.");
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchGroups();
    }, []);     // Fetch groups on initial page load

    async function handleCreateGroup(e){
        e.preventDefault();
        try{
            const newGroupData = {
                name : newGroupName,
                description : newGroupDesc
            };
            await createGroup(newGroupData);
            toast.success("Group created successfully!");

            setNewGroupName("");
            setNewGroupDesc("");

            await fetchGroups();
        }
        catch(err){
            toast.error(err.message || "Failed to create group");
        }
    }

    async function handleJoinGroup(e){
        e.preventDefault();
        if(!groupIdToJoin) return;

        try{
            await joinGroup(groupIdToJoin);
            toast.success("Joined group successfully!");

            setGroupIdToJoin("");
            await fetchGroups();
        }
        catch(err){
            toast.error(err.message || "Failed to join group");
        }
    }

    if (loading) {
        return <div className="loading-state">Loading your groups...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}</div>;
    }

    return (
        <div className="groups-page">
            <h1>My Groups</h1>

            <div className="card create-group-card">
                <h3>Create New Group</h3>
                <form onSubmit={handleCreateGroup} className="create-group-form">
                    <div className="form-row">
                        <div className="form-field">
                            <label>Group Name</label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => { setNewGroupName(e.target.value); }}
                                required
                            />
                        </div>
                        <button className="btn btn-primary btn-create-group" type="submit">Create Group</button>
                    </div>
                    <div className="form-field">
                        <label>Group Description</label>
                        <textarea
                            value={newGroupDesc}
                            onChange={(e) => { setNewGroupDesc(e.target.value) }}
                            placeholder="Enter group description (optional)"
                        />
                    </div>
                </form>
            </div>

            <div className="card join-group-card">
                <h3>Join a Group</h3>
                <form onSubmit={handleJoinGroup} className="join-group-form">
                    <div className="form-row">
                        <div className="form-field">
                            <label>Group ID</label>
                            <input
                                type="text"
                                value={groupIdToJoin}
                                onChange={(e) => { setGroupIdToJoin(e.target.value); }}
                                placeholder="Paste Group ID here"
                                required
                            />
                        </div>
                        <button className="btn btn-primary btn-join-group" type="submit">Join Group</button>
                    </div>
                </form>
            </div>

            <div className="card groups-section">
                <h2>Your Groups</h2>
                {groups.length > 0 ? (
                    <ul className="groups-list">
                        {groups.map((group) => (
                            <Link
                                to={`/group/${group._id}`}
                                key={group._id}
                                className="group-card"
                            >
                                <div className="group-content">
                                    <h4>{group.name}</h4>
                                    {group.description && <p>{group.description}</p>}
                                </div>
                            </Link>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-state">
                        You haven't joined or created any group yet.
                    </p>
                )}
            </div>
        </div>
    );
}

export default MyGroupsPage;