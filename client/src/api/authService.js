import apiClient from "./axiosConfig";

// userData contains { name, email, password } from the form
export async function signupUser(userData){
    try{
        const response = await apiClient.post("/users/signup", userData);
        return response.data;   // {message, token, user}
    }
    catch(error){
        throw new Error(error.response?.data?.message || 'An unknown error occurred');
    }
}

// credentials contains {email, password} from the form
export async function loginUser(credentials){
    try{
        const response = await apiClient.post("/users/login", credentials);
        return response.data;   // {token, user}
    }
    catch(error){
        throw new Error(error.response?.data?.message || 'Invalid Credentials!');
    }
}
