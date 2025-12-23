import React from "react";
import {Route, Routes, Link} from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MyGoalsPage from "./pages/MyGoalsPage";
import MyGroupsPage from "./pages/myGroupsPage";
import LogoutButton from "./components/LogoutButton";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GroupDetailsPage from "./pages/GroupDetailsPage";

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
            <Link to="/my-groups" style={{ marginRight: '1rem' }}>My Groups</Link>
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