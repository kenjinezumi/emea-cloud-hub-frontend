// src/components/forms/Login.js
import React, { useState, useEffect, useContext } from "react";
import { Button, Typography, Box, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import logo from '../../assets/logo/logo.png';
import { getUserData } from "../../api/getUserData";

function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(GlobalContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await getUserData();
        if (response.email) {
          setUser(response);
          setIsAuthenticated(true);
          navigate('/'); // Redirect to home after login
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserEmail();
  }, [setIsAuthenticated, navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = '/auth/google';
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ p: 4, maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={logo} alt="calendar" className="mr-2 w-12 h-12 cursor-pointer" />
        <Typography component="h1" variant="h5">
          {user ? `Welcome, ${user.name}` : 'Sign in with Google'}
        </Typography>
        {!user && (
          <Button variant="contained" color="primary" onClick={handleGoogleSignIn} sx={{ mt: 3, mb: 2 }}>
            Sign in with Google
          </Button>
        )}
      </Grid>
    </Grid>
  );
}

export default Login;
