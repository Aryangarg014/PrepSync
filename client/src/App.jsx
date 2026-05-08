import React from "react";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import {Route, Routes} from 'react-router-dom';

import './App.css';
import Navbar from "./components/Navbar";
// --- TOAST IMPORTS ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import MyGoalsPage from "./pages/MyGoalsPage";
import MyGroupsPage from "./pages/MyGroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";

function App(){
  const { isAuthenticated, loading } = useContext(AuthContext);

  if(loading){
    return ( <div>Loading...</div> );
  }

  return (
    <div>

      <ToastContainer position="top-right" autoClose={3000} />

      <Navbar isAuthenticated={isAuthenticated} />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={ <LoginPage/> } />
        <Route path="/signup" element={ <SignupPage/> } />
        <Route path="/" element={ <LandingPage/> } />

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