import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";

const PrivateRoute = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    const localAuth = localStorage.getItem('isAuthenticated');
    
    // Check if user is authenticated in either sessionStorage or localStorage
    if (sessionAuth === 'true' || localAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    setLoading(false); // Done checking storage
  }, [setIsAuthenticated]);

  if (loading) return <p>Loading...</p>; // Optionally handle the loading state

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
