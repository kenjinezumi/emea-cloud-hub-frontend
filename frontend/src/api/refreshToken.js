const REFRESH_TOKEN_URL = 'https://backend-dot-cloudhub.googleplex.com/refresh-token'; // Your backend endpoint

/**
 * Refreshes the access token using the refresh token.
 * @param {string} refreshToken - The refresh token to use for refreshing the access token.
 * @returns {Promise<{accessToken: string, expiryDate: number} | string>} - Returns an object with the new access token and expiry date or an error message.
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    console.error("No refresh token provided.");
    return 'Error: Refresh token not provided';
  }

  try {
    const response = await fetch(REFRESH_TOKEN_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain', // Sending the refresh token as plain text
      },
      body: JSON.stringify({ refreshToken }), // Sending as JSON object
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh token:', response.statusText, errorText);
      return `Error: Unable to refresh token - ${errorText}`;
    }

    const data = await response.json();

    if (data.accessToken) {
      // Optionally store the new access token and expiry date in localStorage or sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);

      return {
        accessToken: data.accessToken,
        expiryDate: data.expiryDate,
      };
    }

    return 'Error: No access token returned from refresh';
  } catch (error) {
    console.error('Error fetching refreshed token:', error);
    return 'Error: Unable to refresh token';
  }
};
