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