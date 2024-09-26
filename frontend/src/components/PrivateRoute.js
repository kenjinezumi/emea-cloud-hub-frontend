import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";

const PrivateRoute = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    const dateAccessToken = sessionStorage.getItem('dateAccessToken') || localStorage.getItem('dateAccessToken');
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (!accessToken || !dateAccessToken || !user) {
      setIsAuthenticated(false);
    } else {
      const tokenDate = new Date(dateAccessToken);
      const now = new Date();
      const minutesPassed = (now - tokenDate) / (1000 * 60);

      if (minutesPassed > 50) {
        setIsAuthenticated(false);
        sessionStorage.clear();
        localStorage.clear();
        setTokenExpired(true); // Set token expired flag
      } else {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, [setIsAuthenticated]);

  if (loading) return <p>Loading...</p>;

  if (tokenExpired) {
    setTimeout(() => {
      window.location.href = "/login"; 
    }, 1000); 
    return <p>Token expired, redirecting to login...</p>;
  }
  

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
