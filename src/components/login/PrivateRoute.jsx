import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AdminContext } from "@/context/AdminContext";

const PrivateRoute = ({ children }) => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const location = useLocation();

  // Check for authentication
  const isAuthenticated = !!adminInfo?.user?.email;
  
  // Get the current path
  const currentPath = location.pathname;
  
  // List of public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Check if current path is a public path
  const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
  
  // If user is authenticated
  if (isAuthenticated) {
    // If trying to access public paths (login, signup, etc.), redirect to dashboard
    if (isPublicPath) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Allow access to protected routes for authenticated users
    // This includes dashboard and other routes defined in the routes config
  } 
  // If user is not authenticated
  else {
    // If trying to access any route other than public paths, redirect to login
    if (!isPublicPath) {
      return <Navigate to="/login" state={{ from: currentPath }} replace />;
    }
    
    // Allow access to public routes for non-authenticated users
  }

  // Render the children for the allowed scenarios
  return children;
};

export default PrivateRoute;
