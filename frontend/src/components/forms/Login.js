import React, { useState, useEffect, useContext } from "react";
import { Button, Typography, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import logo from '../../assets/logo/logo.png';

function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(GlobalContext);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State to hold error message
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  // Check for user authentication status after Google login
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}auth/google/callback`, {
          credentials: 'include', // Ensure cookies are included
        });
        const data = await response.json();

        if (data.isAuthenticated) {
          setUser(data.user); // Set user data from backend
          setIsAuthenticated(true); // Set global auth state
          navigate('/'); // Redirect to home page
        } else {
          setErrorMessage(data.message); // Set error message from backend
        }
      } catch (error) {
        console.error('Error fetching authentication status:', error);
        setErrorMessage("An error occurred. Please try again.");
      }
    };

    fetchAuthStatus();
  }, [setIsAuthenticated, navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = `${apiUrl}auth/google`;
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ p: 4, maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={logo} alt="calendar" className="mr-2 w-12 h-12 cursor-pointer" />
        <Typography component="h1" variant="h5">
          {user ? `Welcome, ${user.name}` : 'Sign in with Google'}
        </Typography>
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
