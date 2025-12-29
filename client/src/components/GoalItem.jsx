import React, {useState, useContext} from 'react';
import { markGoalComplete, deleteGoal, updateGoal } from '../api/goalService';
import { AuthContext } from '../context/AuthContext';

// pass the goals list to check completed and pass a function to refresh the list on completing goal
const GoalItem = ({ goal, onGoalUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);      // Toggle Edit Mode

    const { user } = useContext(AuthContext);   // get user object for user ID
    
    const [editTitle, setEditTitle] = useState(goal.title);
    const [editDesc, setEditDesc] = useState(goal.description || "");
    const formattedDate = goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '';
    const [editDueDate, setEditDueDate] = useState(formattedDate);

    const isCompletedByUser = goal.completedBy.some(
        (c) => c.user._id === user.id
    );

    const handleComplete = async () => {
        setLoading(true);
        setError(null);
        try{
            await markGoalComplete(goal._id);
            onGoalUpdate();     // the loading spinner is only active for the `markGoalComplete` call
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if(!window.confirm(`Are you sure you want to delete "${goal.title}"?`)){
            return;
        }

        setLoading(true);
        setError(null);
        try{
            await deleteGoal(goal._id);
            onGoalUpdate();
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try{
            await updateGoal(goal._id,{
                title : editTitle,
                description : editDesc,
                dueDate : editDueDate || null       // If editDueDate is "", send null
            });
            setIsEditing(false);
            onGoalUpdate();
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    }

    const handleCancelEdit = () => {
        setEditTitle(goal.title);
        setEditDesc(goal.description || "");
        setEditDueDate(formattedDate);
        setIsEditing(false);
        setError(null);
    }

    if(isEditing){      // Edit Mode
        return (
            <li>
                <form onSubmit={handleUpdate}>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder='Description'
                    />
                    <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                    />
                    <div style={{marginTop : "10px"}}>
                        <button type='submit' disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    </div>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                </form>
            </li>
        );
    }

    function isOverdue(dateString) {
        return new Date(dateString) < new Date().setHours(0,0,0,0);
    }

    // View Mode
    return (
        <li style={{  backgroundColor: isCompletedByUser ? '#d4edda' : '#fff' }}>
            <div>
                <div>
                    <h4>{goal.title}</h4>
                    <p>{goal.description}</p>
                    {/* Show group name if it's a group goal */}
                    {goal.group && <small>Group: {goal.group.name}</small>}
                    {goal.dueDate && 
                        <small>
                            Due : {new Date(goal.dueDate).toLocaleDateString()}
                            {isOverdue(goal.dueDate) && !isCompletedByUser && " (Overdue)"}
                        </small>
                    }
                </div>

                <div>
                    <button
                        onClick={handleComplete}
                        disabled={loading || isCompletedByUser}     // if loading or already completed disable
                    >
                        {loading ? "Loading..." : (isCompletedByUser ? "✓ Completed" : "Mark as Complete")}
                    </button>

                    <button onClick={() => setIsEditing(true)} disabled={loading} >
                        Edit
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
            
            {error && <p style={{color : "red"}}>{error}</p>}
        </li>
    );

};

export default GoalItem;