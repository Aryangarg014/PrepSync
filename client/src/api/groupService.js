import apiClient from "./axiosConfig";

export async function createGroup(groupData){
    try{
        const response = await apiClient.post("/groups/create", groupData);
        return response.data;   // { message, group }
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to create group.");
    }
}

export async function getUserGroups(){
    try{
        const response = await apiClient.get("/groups/my-groups");
        return response.data;   // userGroups(array of groups)
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to fetch groups.");
    }
}

export async function joinGroup(groupId){
    try{
        const response = await apiClient.post(`/groups/join/${groupId}`);
        return response.data;   // { message, group }
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to join group.");
    }
}