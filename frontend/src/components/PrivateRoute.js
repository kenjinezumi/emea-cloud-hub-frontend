import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";


const PrivateRoute = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (!user) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [setIsAuthenticated]);

  if (loading) return <p>Loading...</p>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};



export default PrivateRoute;
