import axios from 'axios';

const apiClient = axios.create({
    baseURL : "http://localhost:8080"
});

// Axios Interceptor -> a piece of code that runs before every API request or after every response

// Request Interceptor (runs before every request)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor (runs after every request)
apiClient.interceptors.response.use(
    (response) => {     // status code of type '2xx'
        return response;
    },
    (error) => {
        // status code except type '2xx'

        if(error.response && error.response.status === 401){
            // it means the token is expired or invalid.
            console.error("Session expired. Please log in again.");

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            window.location.href = "/login";
        }
        
        return Promise.reject(error);
    }
);
export default apiClient;