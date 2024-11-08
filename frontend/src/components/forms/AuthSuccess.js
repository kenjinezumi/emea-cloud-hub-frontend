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
          credentials: 'include',  
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const data = await response.json();

        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          sessionStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('isAuthenticated', 'true');

          const user = data.user;
          sessionStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user));

          const email = user.emails[0].value;
          const username = email.split('@')[0]; 

          sessionStorage.setItem('email', email);
          sessionStorage.setItem('username', username);

          scrapePersonDetails(username);
 
          if (data.accessToken) {
            const currentDate = new Date().toISOString();  
            sessionStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('accessToken', data.accessToken);   
            sessionStorage.setItem('dateAccessToken', currentDate);
            localStorage.setItem('dateAccessToken', currentDate);         
          } else {
            console.log('Access token not found.');
          }
          if (data.refreshToken) {
            sessionStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          } else {
            console.log('Refresh token not found.');
          }

          navigate('/');
        } else {
          setErrorMessage('Authentication failed. Please try again.');
          navigate('/login'); 
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

  const scrapePersonDetails = async (username) => {
    const scrapeUrl = `https://iiiiii.com/person/${username}`;

    try {
      const response = await fetch(scrapeUrl);
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const personDetailsDiv = doc.querySelector('.br0wK-r4nke');

      if (personDetailsDiv) {
        const personDetails = personDetailsDiv.textContent;

        sessionStorage.setItem('personDetails', personDetails);
      } else {
        console.log('Person details not found on the page.');
      }
    } catch (error) {
      console.error('Error scraping person details:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  return null;  
}

export default AuthSuccess;
