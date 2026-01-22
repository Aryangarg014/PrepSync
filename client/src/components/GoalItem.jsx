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
            <li className='goal-card edit-mode'>
                <form className="edit-form" onSubmit={handleUpdate}>
                    <div className="edit-row-top">
                        <div className="edit-field">
                            <label>Title</label>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="edit-field">
                            <label>Due Date:</label>
                            <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="edit-row-bottom">
                        <div className="edit-field edit-field-description">
                            <label>Description</label>
                            <textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder='Description'
                            />
                        </div>
                        <div className="edit-actions">
                            <button className="btn btn-save-changes" type='submit' disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                            <button className="btn btn-outline" type="button" onClick={handleCancelEdit}>
                                ✕ Cancel
                            </button>
                        </div>
                    </div>
                    {error && <p className="goal-error">{error}</p>}
                </form>
            </li>
        );
    }

    function isOverdue(dateString) {
        return new Date(dateString) < new Date().setHours(0,0,0,0);
    }

    // View Mode
    return (
        <li className={`goal-card ${isCompletedByUser ? "completed" : ""}`}>
            
            <div className="goal-left">
                <h4>{goal.title}</h4>

                {goal.description && <p>{goal.description}</p>}

                <div className="goal-meta">
                    {goal.group && <span>Group: {goal.group.name}</span>}

                    {goal.dueDate && (
                        <span className={isOverdue(goal.dueDate) && !isCompletedByUser ? "overdue" : ""}>
                            Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="goal-actions">
                <button
                    className="btn btn-success"
                    onClick={handleComplete}
                    disabled={loading || isCompletedByUser}
                >
                {isCompletedByUser ? "✓ Completed" : "Mark Complete"}
                </button>

                <button
                    className="btn btn-outline"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                >
                    Edit
                </button>

                <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    Delete
                </button>
            </div>
            
            
            {error && <p className="goal-error">{error}</p>}
        </li>
    );

};

export default GoalItem;