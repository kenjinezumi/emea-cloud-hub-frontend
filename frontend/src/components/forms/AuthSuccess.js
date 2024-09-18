import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";

function AuthSuccess() {
  const { setIsAuthenticated } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}api/current_user`, {
          credentials: 'include',  // Include cookies in the request
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const data = await response.json();
        console.log('Received Data:', data);

        if (data.isAuthenticated) {
          // Save authentication state globally
          setIsAuthenticated(true);

          // Store user data in local storage
          const user = data.user;
          console.log('User data to be stored:', user);
          localStorage.setItem('user', JSON.stringify(user));

          // Extract the email and first part before "@"
          const email = user.emails[0].value;
          const username = email.split('@')[0];  // Get first part of email

          // Store the email and username in local storage for later use
          localStorage.setItem('email', email);
          localStorage.setItem('username', username);

          // Scrape the external page with the username
          scrapePersonDetails(username);

          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            console.log('Could find the access token', data.accessToken);
          }else{
            console.log('Could not find the access token :(');
          }

          // Navigate to the homepage after successful authentication
          navigate('/');
        } else {
          setErrorMessage('Authentication failed. Please try again.');
          navigate('/login');  // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setErrorMessage("Error fetching user details. Please try again.");
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [setIsAuthenticated, navigate]);

  // Function to scrape the external page for person details
  const scrapePersonDetails = async (username) => {
    const scrapeUrl = `https://iiiiii.com/person/${username}`;

    try {
      const response = await fetch(scrapeUrl);
      const html = await response.text();
      
      // Parse the HTML to find the desired div using DOMParser or regex
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const personDetailsDiv = doc.querySelector('.br0wK-r4nke');

      if (personDetailsDiv) {
        const personDetails = personDetailsDiv.textContent;
        console.log('Person Details:', personDetails);

        // You can store or display this information as needed
        localStorage.setItem('personDetails', personDetails);
      } else {
        console.log('Person details not found on the page.');
      }
    } catch (error) {
      console.error('Error scraping person details:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  return null;  // Render nothing or a loading spinner
}

export default AuthSuccess;
