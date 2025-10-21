import React, {createContext, useState, useEffect} from 'react';

export const AuthContext = createContext(null);

function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);   // it indicates that "checking the login status" still in progress

    useEffect(() => {       // checking the login status
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if(storedToken && storedUser){
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);      // checking finished
    }, []);     // run this once only when the component loads

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
    }
    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
    const authContextValue = {
        user,
        token,
        login,
        logout,
        isAuthenticated : token !== null ? true : false,
        loading     // to know if we are still checking the login status
    }
    return (
        <AuthContext.Provider value={authContextValue}>
            {/* render the children that has used the AuthContext */}
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;