import React, { useState, useEffect } from "react";
import { createGroup, getUserGroups, joinGroup } from "../api/groupService";

const MyGroupsPage = () => {
    // State for the list of groups
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the "Create New Group" form
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");
    const [formError, setFormError] = useState(null);

    const [groupIdToJoin, setGroupIdToJoin] = useState("");
    const [joinFormError, setJoinFormError] = useState(null);

    async function fetchGroups(){
        try{
            setLoading(true);
            const response = await getUserGroups();
            setGroups(response);
            setError(null);
        }
        catch(err){
            setError(err.message);
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
        setFormError(null);

        try{
            const newGroupData = {
                name : newGroupName,
                description : newGroupDesc
            };
            await createGroup(newGroupData);

            setNewGroupName("");
            setNewGroupDesc("");

            await fetchGroups();
        }
        catch(err){
            setFormError(err.message);
        }
    }

    async function handleJoinGroup(e){
        e.preventDefault();
        setJoinFormError(null);

        if(!groupIdToJoin){
            setJoinFormError("Group Id is required.");
            return;
        }

        try{
            await joinGroup(groupIdToJoin);
            setGroupIdToJoin("");
            await fetchGroups();
        }
        catch(err){
            setJoinFormError(err.message);
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading your groups...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div>
            <h1>My Groups</h1>

            <div>
                <h3>Create New Group</h3>
                <form onSubmit={handleCreateGroup}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label>Group Name:</label>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => { setNewGroupName(e.target.value); }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label>Group Description:</label>
                        <input
                            type="text"
                            value={newGroupDesc}
                            onChange={(e) => { setNewGroupDesc(e.target.value) }}
                        />
                    </div>
                    
                    <button type="submit">Create Group</button>
                    {formError && <p style={{color : "red"}}>{ formError }</p>}
                </form>
            </div>

            <div>
                <h3>Join a Group</h3>
                <form onSubmit={handleJoinGroup}>
                    <div style={{ marginBottom : '0.5rem' }}>
                        <label>Group ID:</label>
                        <input
                            type="text"
                            value={groupIdToJoin}
                            onChange={(e) => { setGroupIdToJoin(e.target.value); }}
                            placeholder="Paste Group ID here"
                            required
                        />
                    </div>
                    <button type="submit">Join Group</button>
                    {joinFormError && <p style={{color : "red"}}>{ joinFormError }</p>}
                </form>
            </div>

            <div>
                <h2>Your Groups</h2>
                {groups.length > 0 ? (
                    <ul>
                        {groups.map((group) => (
                            <li key={group._id}>
                                <h4>{group.name}</h4>
                                <p>{group.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You haven't joined or created any group yet.</p>
                )}
            </div>
        </div>
    );
}

export default MyGroupsPage;