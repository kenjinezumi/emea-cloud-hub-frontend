import { refreshAccessToken } from "./refreshToken";

const API_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/google.com:cloudhub/locations/us-central1/publishers/google/models/gemini-1.5-pro-002:streamGenerateContent';

const fetchGeminiResponse = async (prompt, chatLog = []) => {
  let accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

  if (!accessToken) {
    console.error("No access token found. Please authenticate.");
    return 'Error: Access token not found';
  }

  // Define context guidance for the assistant
  const contextGuidance = "You are a knowledgeable assistant providing helpful, accurate, and contextually relevant responses.";

  // Construct chat history with context guidance and user/assistant conversation
  const conversationHistory = [
    {
      role: 'system',
      parts: [{ text: contextGuidance }], // Add context guidance as the first message
    },
    ...chatLog.map((entry) => ({
      role: entry.sender === 'user' ? 'user' : 'assistant',
      parts: [{ text: entry.text }],
    })),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const data = {
    contents: conversationHistory,
  };

  try {
    // First attempt to fetch data
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok && response.status === 401) {
      throw new Error('TokenExpired');
    }

    return await handleStreamResponse(response);
  } catch (error) {
    if (error.message === 'TokenExpired') {
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
          const retryResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            console.error('Retry failed to fetch Gemini response:', retryResponse.statusText, errorText);
            return `Error: Unable to fetch response after retry - ${errorText}`;
          }

          return await handleStreamResponse(retryResponse);
        } catch (retryError) {
          console.error('Error during retry:', retryError);
          return 'Error: Unable to connect to Gemini API after token refresh';
        }
      } else {
        console.error('Failed to refresh token.');
        return 'Error: Token refresh failed. Please re-authenticate.';
      }
    } else {
      console.error('Error fetching Gemini response:', error);
      return 'Error: Unable to connect to Gemini API';
    }
  }
};

// Helper function to handle response streaming
const handleStreamResponse = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  let resultText = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk:', chunk);
      resultText += chunk;
    }
  }

  return resultText || 'No response from Gemini';
};

export { fetchGeminiResponse };
