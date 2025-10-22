import apiClient from "./axiosConfig";

export async function getDashboardData(){
    try{
        // 'apiClient' will automatically add the auth token
        const response = await apiClient.get("/dashboard");
        return response.data;
    }
    catch(error){
        // The axios response interceptor will automatically
        // handle 401 (expired token) errors.
        
        // It will handle other errors
        throw new Error(error.response?.data?.message || "Failed to fetch dashboard data.");
    } 
}