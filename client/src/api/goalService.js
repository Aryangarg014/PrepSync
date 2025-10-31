import apiClient from "./axiosConfig";

export async function getUserGoals(){
    try{
        const response = await apiClient.get("/goals/my-goals");
        return response.data;   // { personalGoals, groupGoals }
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to fetch goals.");
    }
}

export async function createGoal(goalData){
    try{
        const response = await apiClient.post("/goals/create", goalData);
        return response.data;   // { message, goal }
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to create goal.");
    }
}

export async function markGoalComplete(goalId){
    try{
        const response = await apiClient.patch(`/goals/${goalId}/complete`);
        return response.data;   // { message, goal, streak }
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to mark the goal as complete");
    }
}

export async function deleteGoal(goalId){
    try{
        const response = await apiClient.delete(`/goals/${goalId}`);
        return response.data;   // { message, goal }
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to delete the goal.");
    }
}