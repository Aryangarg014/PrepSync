import React from "react";
import {Route, Routes, Link} from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MyGoalsPage from "./pages/MyGoalsPage";
import LogoutButton from "./components/LogoutButton";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
  const { isAuthenticated, loading } = useContext(AuthContext);

  if(loading){
    return ( <div>Loading...</div> );
  }

  return (
    <div>
      <nav style={{ padding: '1rem', background: "#faf9f6" }}>
        <Link to="/" style={{ marginRight: '1rem' }}> Home </Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
            <Link to="/my-goals" style={{ marginRight: '1rem' }}>My Goals</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>


      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={ <LoginPage/> } />
        <Route path="/signup" element={ <SignupPage/> } />
        <Route path="/" element={ <h2>Home Page (Welcome!)</h2> } />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={ <ProtectedRoute> <DashboardPage/> </ProtectedRoute> }
        />
        <Route
          path="/my-goals"
          element={ <ProtectedRoute> <MyGoalsPage/> </ProtectedRoute> }
        />
        
      </Routes>

    </div>
  );
}

export default App;