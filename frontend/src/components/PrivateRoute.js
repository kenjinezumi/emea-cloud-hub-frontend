import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";

const PrivateRoute = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    const localAuth = localStorage.getItem('isAuthenticated');
    const accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    const dateAccessToken = sessionStorage.getItem('dateAccessToken') || localStorage.getItem('dateAccessToken');
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (!accessToken || !dateAccessToken || !user) {
      // No access token, date, or user found, token expired
      setIsAuthenticated(false);
      setTokenExpired(true);
    } else {
      const tokenDate = new Date(dateAccessToken);
      const now = new Date();
      const minutesPassed = (now - tokenDate) / (1000 * 60);

      if (minutesPassed > 50) {
        setIsAuthenticated(false);
        setTokenExpired(true);
        sessionStorage.clear();
        localStorage.clear();
      } else {
        setIsAuthenticated(true);
      }
    }

    setLoading(false);
  }, [setIsAuthenticated]);

  if (loading) return <p>Loading...</p>;

  if (tokenExpired) {
    return (
      <div>
        <p>Token expired. Redirecting you to the login page...</p>
        {setTimeout(() => <Navigate to="/login" />, 3000)}
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
