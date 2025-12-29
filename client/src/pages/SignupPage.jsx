import React, { useState, useContext } from 'react';
import { signupUser } from '../api/authService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
        <div style = {{padding : '2rem'}}>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange ={(e) => { setName(e.target.value); }}
                        required
                    />
                </div>
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

                {/* if loading then disable submit button */}
                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Signup"}
                </button>
            </form>
        </div>
    );
}

export default SignupPage;