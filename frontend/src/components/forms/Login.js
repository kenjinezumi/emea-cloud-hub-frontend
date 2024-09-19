import React, { useState, useEffect, useContext } from "react";
import { Button, Typography, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import logo from '../../assets/logo/logo.png';

function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(GlobalContext);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));  // Load cached user from localStorage
  const [errorMessage, setErrorMessage] = useState("");  // State to hold error message

  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  useEffect(() => {
    // Check if user is already cached in localStorage
    if (user) {
      console.log("Cached user found:", user);
      setIsAuthenticated(true);  // Set the authentication state
      navigate('/');  // Redirect to homepage if user is authenticated
    }
  }, [user, setIsAuthenticated, navigate]);

  const handleGoogleSignIn = () => {
    // Redirect to backend for Google authentication
    window.location.href = `${apiUrl}auth/google`;
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ p: 4, maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={logo} alt="calendar" className="mr-2 w-12 h-12 cursor-pointer" />
        {!user && (
          <>
            <Button variant="contained" color="primary" onClick={handleGoogleSignIn} sx={{ mt: 3, mb: 2 }}>
              Sign in with Google
            </Button>
            {errorMessage && (
              <Typography color="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Typography>
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
}

export default Login;