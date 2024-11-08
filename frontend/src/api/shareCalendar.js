import { refreshAccessToken } from './refreshToken';

const API_URL = 'https://backend-dot-cloudhub.googleplex.com/';

const shareToGoogleCalendar = async (eventData) => {
  let accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

  if (!accessToken) {
    console.error("No access token found. Please authenticate.");
    return 'Error: Access token not found';
  }

  try {
    // First attempt to share the event
    const response = await fetch(`${API_URL}share-to-calendar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        data: eventData,
        message: 'share-to-calendar',
        accessToken: accessToken, // Pass token in the body
      }),
    });

    if (!response.ok && response.status === 401) {
      throw new Error('TokenExpired');
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'TokenExpired' && refreshToken) {
      console.warn('Access token expired. Attempting to refresh...');

      // Attempt to refresh the token
      const tokenData = await refreshAccessToken(refreshToken);

      if (tokenData.accessToken) {
        // Store the new access token
        accessToken = tokenData.accessToken;
        sessionStorage.setItem('accessToken', accessToken);
        localStorage.setItem('accessToken', accessToken);

        console.log('Token refreshed. Retrying request...');

        // Retry the request with the new access token
        try {
          const retryResponse = await fetch(`${API_URL}share-to-calendar`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
              data: eventData,
              message: 'share-to-calendar',
              accessToken: accessToken, // Pass updated token in the body
            }),
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            console.error('Retry failed to share to Google Calendar:', retryResponse.statusText, errorText);
            return `Error: Unable to share event after retry - ${errorText}`;
          }

          return await retryResponse.json();
        } catch (retryError) {
          console.error('Error during retry:', retryError);
          return 'Error: Unable to share event to Google Calendar after token refresh';
        }
      } else {
        console.error('Failed to refresh token.');
        return 'Error: Token refresh failed. Please re-authenticate.';
      }
    } else {
      console.error('Error sharing to Google Calendar:', error);
      return 'Error: Unable to share event to Google Calendar';
    }
  }
};

export { shareToGoogleCalendar };
