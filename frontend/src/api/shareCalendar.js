const API_URL = 'https://backend-dot-cloudhub.googleplex.com/';

const shareToGoogleCalendar = async (eventData, accessToken) => {
  try {
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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error sharing to Google Calendar:', error);
  }
};

export { shareToGoogleCalendar };
