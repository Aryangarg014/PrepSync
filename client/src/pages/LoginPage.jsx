import React, { useState, useContext } from 'react';
import { loginUser } from '../api/authService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleSubmit(e){
        e.preventDefault();     // prevent default form submission
        setLoading(true);
        try{
            const responseData = await loginUser({ email, password });
            // console.log("Login successful", responseData);

            login(responseData.user, responseData.token);       // saves {user, token} to localStorage

            toast.success(`Welcome back, ${responseData.user.name}! 👋`);
            navigate("/dashboard")
        }
        catch(err){
            console.error("Login failed.", err.message);
            toast.error(err.message || "Invalid credentials");
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div className='auth-container'>
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); }}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); }}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* UX Improvement: Link to Signup */}
                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;