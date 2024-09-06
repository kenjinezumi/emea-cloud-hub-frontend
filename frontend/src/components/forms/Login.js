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

  // Make API call to fetch user details after Google OAuth
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}auth/google/callback`, {
          method: 'POST',  // Use POST method as requested
          credentials: 'include',  // Include credentials (cookies)
          headers: {
            'Content-Type': 'text/plain',  // Example header, adjust as needed
          },
          body: JSON.stringify({ queryName: 'queryEventData', message: 'get-data' }),  // Example body, adjust as needed
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const data = await response.json();
        console.log('Received Data:', data);  // Log data for debugging

        if (data && data.isAuthenticated) {
          setUser(data.user);  // Set user data
          setIsAuthenticated(true);  // Update global context
          navigate('/');  // Redirect to the homepage
        } else {
          setErrorMessage('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setErrorMessage("Error fetching user details. Please try again.");
      }
    };

    // Fetch user details after the OAuth redirect
    fetchUserDetails();
  }, [setIsAuthenticated, navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = `${apiUrl}auth/google`;  // Redirect to backend for Google authentication
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
