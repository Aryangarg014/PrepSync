import apiClient from "./axiosConfig";

export async function addResource(resourceData){
    try{
        const response = await apiClient.post("/resources/add", resourceData);
        return response.data;
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to add resource.");
    }
}

export async function getGroupResources(groupId) {
    try{
        const response = await apiClient.get(`/resources/group/${groupId}`);
        return response.data;
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to fetch resources.");
    }
}

export async function deleteResource(resourceId, groupId){
    try{
        const response = await apiClient.delete(`/resources/${resourceId}/group/${groupId}`);
        return response.data;
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Failed to delete resource.");
    }
}

