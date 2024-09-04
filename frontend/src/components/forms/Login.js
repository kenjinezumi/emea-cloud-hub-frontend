import React, { useState, useEffect, useContext } from "react";
import { Avatar, Button, TextField, Grid, Paper, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import logo from '../../assets/logo/logo.png';
import { getUserData } from "../../api/getUserData"; // Import your fetch-based function

function Login() {
  const navigate = useNavigate(); // For programmatic navigation
  const { setIsAuthenticated } = useContext(GlobalContext);
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password

  useEffect(() => {
    // Fetch the user email from the backend using the fetch-based getUserData function
    const fetchUserEmail = async () => {
      try {
        const response = await getUserData(); // Call the getUserData function to fetch email
        if (response.email) {
          setEmail(response.email); // Update the email state with the fetched email
        }
      } catch (error) {
        console.error('Error fetching user email', error);
      }
    };

    fetchUserEmail(); // Invoke the function to fetch email
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here, you should add your authentication logic, e.g., call your authentication API.
    // If successful:
    setIsAuthenticated(true); // Update the authentication state
    navigate('/'); // Redirect to the home page or desired route after login
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          p: 4,
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={logo} alt="calendar" className="mr-2 w-12 h-12 cursor-pointer" />

        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box
          component="form"
          sx={{ mt: 1, width: '100%' }}
          noValidate
          onSubmit={handleSubmit}
        >
          {/* Email Input Field */}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email} // Bind the input field to the email state
            onChange={(e) => setEmail(e.target.value)} // Update the state on change
          />
          {/* Password Input Field */}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password} // Bind the input field to the password state
            onChange={(e) => setPassword(e.target.value)} // Update the state on change
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Login;
