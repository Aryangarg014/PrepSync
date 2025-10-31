import React, {useState, useEffect} from "react";
import { getUserGoals, createGoal } from "../api/goalService";
import GoalItem from "../components/GoalItem";

const MyGoalsPage = () => {
    // state for the getUserGoals
    const [personalGoals, setPersonalGoals] = useState(null);
    const [groupGoals, setGroupGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the createGoal (form)
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalDesc, setNewGoalDesc] = useState('');
    const [formError, setFormError] = useState(null);

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
        setFormError(null);

        try{
            // groupId is null as it is a personal goal
            const newGoal = {
                title : newGoalTitle,
                description : newGoalDesc
            }
            await createGoal(newGoal);
            
            setNewGoalTitle("");
            setNewGoalDesc("");

            await fetchGoals();     // refresh the goals
        }
        catch(err){
            setFormError(err.message);
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading your goals...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={{padding : "2rem"}}>
            <h1>My Goals</h1>

            <div>
                <h3>Create a New Personal Goal</h3>
                <form onSubmit={ handleCreateGoal }>
                    <div style={{ marginBottom : "0.5rem" }}>
                        <label>Title:</label>
                        <input
                            type="text"
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom : "0.5rem" }}>
                        <label>Description:</label>
                        <input
                            type="text"
                            value={newGoalDesc}
                            onChange={(e) => setNewGoalDesc(e.target.value)}
                        />
                    </div>
                    <button type="submit">Create Goal</button>
                    { formError && <p style={{ color : "red" }}>{formError}</p> }
                </form>
            </div>

            <div style={{ marginTop : "2rem" }}>
                <h2>My Personal Goals</h2>
                { personalGoals?.length > 0 ? (
                    <ul>
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

            <div style={{ marginTop : "2rem" }}>
                <h2>My Group Goals</h2>
                { groupGoals?.length > 0 ? (
                    <ul>
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