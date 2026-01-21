import React, { useState, useContext } from 'react';
import { signupUser } from '../api/authService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const SignupPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleSubmit(e){
        e.preventDefault();     // prevent default form submission
        setLoading(true);
        try{
            const responseData = await signupUser({ name, email, password });
            // console.log("Signup successful", responseData);

            login(responseData.user, responseData.token);       // saves {user, token} to localStorage

            toast.success("Account created successfully! 🎉");
            navigate("/dashboard");
        }
        catch(err){
            console.error("Signup failed.", err.message);
            toast.error(err.message || "Signup failed");
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            className="form-input"
                            type="text"
                            value={name}
                            onChange ={(e) => { setName(e.target.value); }}
                            required
                            placeholder="John Doe"
                        />
                    </div>
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
                            placeholder="Create a strong password"
                        />
                    </div>

                    {/* If loading, disable the submit button. */}
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;