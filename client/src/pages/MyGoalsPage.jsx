import React, {useState, useEffect} from "react";
import { getUserGoals, createGoal } from "../api/goalService";
import GoalItem from "../components/GoalItem";
import { toast } from "react-toastify";
import './MyGoalsPage.css';

const MyGoalsPage = () => {
    // state for the getUserGoals
    const [personalGoals, setPersonalGoals] = useState(null);
    const [groupGoals, setGroupGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the createGoal (form)
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalDesc, setNewGoalDesc] = useState('');
    const [newGoalDueDate, setNewGoalDueDate] = useState('');

    async function fetchGoals(){
        try{
            setLoading(true);
            const goals = await getUserGoals();
            setPersonalGoals(goals.personalGoals);
            setGroupGoals(goals.groupGoals);
            setError(null);
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {       // Fetch goals on initial page load
        fetchGoals();
    }, [])

    // handle form submit
    async function handleCreateGoal(e){
        e.preventDefault();
        try{
            // groupId is null as it is a personal goal
            const newGoal = {
                title : newGoalTitle,
                description : newGoalDesc,
                dueDate : newGoalDueDate || null
            }
            await createGoal(newGoal);
            toast.success("Personal goal created!");

            setNewGoalTitle("");
            setNewGoalDesc("");
            setNewGoalDueDate("");

            await fetchGoals();     // refresh the goals
        }
        catch(err){
            toast.error(err.message || "Failed to create goal");
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading your goals...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div className="goals-page">
            <h1>My Goals</h1>

            <div className="card create-goal-card">
                <h3>Create a New Personal Goal</h3>
                <form onSubmit={ handleCreateGoal } className="create-goal-form">
                    <div className="form-row-top">
                        <div className="form-field">
                            <label>Title</label>
                            <input
                                type="text"
                                value={newGoalTitle}
                                onChange={(e) => setNewGoalTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label>Due Date:</label>
                            <input
                                type="date"
                                value={newGoalDueDate}
                                onChange={(e) => setNewGoalDueDate(e.target.value)}   
                            />
                        </div>
                    </div>
                    
                    <div className="form-row-bottom">
                        <div className="form-field form-field-description">
                            <label>Description</label>
                            <textarea
                                value={newGoalDesc}
                                onChange={(e) => setNewGoalDesc(e.target.value)}
                                rows="4"
                            />
                        </div>
                        <button className="btn btn-primary btn-create-goal" type="submit">Create Goal</button>
                    </div>
                </form>
            </div>

            <div className="card goals-section">
                <h2>My Personal Goals</h2>
                { personalGoals?.length > 0 ? (
                    <ul className="goals-list">
                        {personalGoals.map((goal) => (
                            <GoalItem 
                                key={goal._id}
                                goal={goal} 
                                onGoalUpdate={fetchGoals}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>You don't have any personal goals. Create one above!</p>
                )}
            </div>

            <div className="card goals-section">
                <h2>My Group Goals</h2>
                { groupGoals?.length > 0 ? (
                    <ul className="goals-list">
                        {groupGoals.map((goal) => (
                            <GoalItem 
                                key={goal._id}
                                goal={goal} 
                                onGoalUpdate={fetchGoals}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>You have no group goals yet.</p>
                )}
            </div>
        </div>
    );
}

export default MyGoalsPage;