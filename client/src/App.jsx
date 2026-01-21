import React from "react";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import {Route, Routes, Link} from 'react-router-dom';

import './App.css';
// --- TOAST IMPORTS ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MyGoalsPage from "./pages/MyGoalsPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import LogoutButton from "./components/LogoutButton";
import GroupDetailsPage from "./pages/GroupDetailsPage";

function App(){
  const { isAuthenticated, loading } = useContext(AuthContext);

  if(loading){
    return ( <div>Loading...</div> );
  }

  return (
    <div>

      <ToastContainer position="top-right" autoClose={3000} />
      
      <nav className="navbar">
        <Link to="/" className="nav-brand"> PrepSync </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-item">Dashboard</Link>
              <Link to="/my-goals" className="nav-item">Goals</Link>
              <Link to="/my-groups" className="nav-item">Groups</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
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

        <Route
          path="/my-groups"
          element={ <ProtectedRoute> <MyGroupsPage></MyGroupsPage> </ProtectedRoute>}
        />
        <Route
          path="/group/:id"
          element={ <ProtectedRoute> <GroupDetailsPage></GroupDetailsPage> </ProtectedRoute> }
          />

      </Routes>

    </div>
  );
}

export default App;