import React, {useState, useContext} from 'react';
import { markGoalComplete, deleteGoal } from '../api/goalService';
import { AuthContext } from '../context/AuthContext';

// pass the goals list to check completed and pass a function to refresh the list on completing goal
const GoalItem = ({ goal, onGoalUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useContext(AuthContext);   // get user object for user ID

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

    return (
        <li style={{  backgroundColor: isCompletedByUser ? '#d4edda' : '#fff' }}>
            <h4>{goal.title}</h4>
            <p>{goal.description}</p>

            {/* Show group name if it's a group goal */}
            {goal.group && <small>Group: {goal.group.name}</small>}

            <div>
                <button
                    onClick={handleComplete}
                    disabled={loading || isCompletedByUser}     // if loading or already completed disable
                >
                    {loading ? "Loading..." : (isCompletedByUser ? "Completed" : "Mark as Complete")}
                </button>
            </div>

            <div>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? "Deleting..." : "Delete"}
                </button>
            </div>
            {error && <p style={{color : "red"}}>{error}</p>}
        </li>
    );

};

export default GoalItem;