import React, { useState, useContext } from 'react';
import { loginUser } from '../api/authService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleSubmit(e){
        e.preventDefault();     // prevent default form submission
        setError(null);
        setLoading(true);
        try{
            const responseData = await loginUser({ email, password });
            // console.log("Login successful", responseData);

            login(responseData.user, responseData.token);       // saves {user, token} to localStorage

            alert("Login successful!");
            navigate("/dashboard")
        }
        catch(err){
            console.error("Login failed.", err.message);
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div style = {{padding : '2rem'}}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); }}
                        required
                    />
                </div>
                
                {/* Show error message if it exists */}
                {error && <p style={{ color: 'red' }}> {error} </p>}

                {/* if loading then disable submit button */}
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;