import { refreshAccessToken } from "./refreshToken";

const API_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/google.com:cloudhub/locations/us-central1/publishers/google/models/gemini-1.5-pro-002:streamGenerateContent';

const fetchGeminiResponse = async (prompt, chatLog = []) => {
  let accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

  if (!accessToken) {
    console.error("No access token found. Please authenticate.");
    return 'Error: Access token not found';
  }

  // Define the context guidance or system instructions
  const systemInstructions = `
  You support the Marketing Manager in finding the best Title and description for their event (or Campaign) that will be displayed in the internal Go-to-Market Calendar, that the organization uses to view and coordinate all their events and Go-to-Market activities.
  As first step you will try to get additional information on the activity/event, so you lead the user through multiple questions, in order to find the best title and description. In that process, feel free to address the bulletpoints below and ask for a Landingpage URL from where you can retrieve details and information about the activity.
  
  As a final Output please give a title and a description of the event/campaign (or Go-to-Market activity). Please remember the output is not adressing people who should sign up to the event, the output is intended for internal stakeholders within Google Cloud to activate their customers (e.g. sign customers up for an event)
  
  The title should have maximum 26 characters and ideally fulfills the following criteria:
  
  - Should ideally contain the same Naming as it is communicated to the Target Audience
  - Give an understanding of the Activity type (Event or Prospecting days or Digital Campaign)
  - Should ideally transfer an understanding of the Narrative or topic that is addressed with this event
  
  The description should have a maximum of 55 words and ideally fulfills the following criteria:
  
  - Give more details about the Activity type, the format of the activity and what is the targeted audience for that event
  - Give a first glimpse of which speaker are part of it, which keynotes or presentations will be held or what's in it for the customer if they sign up for the event or campaign
  - Describes how the user can invite customers/interested persons to the event (In case Email copy is provided the user is able to leverage the Gmail-Invite or Salesloft-Invite function)
  
  Don’t suggest more than 3 options.
  `;
  

  // Build the conversation log
  const conversationHistory = chatLog.map((entry) => ({
    role: entry.sender === 'user' ? 'user' : 'assistant',
    content: entry.text,
  }));

  // Add the user's prompt to the conversation log
  conversationHistory.push({
    role: 'user',
    content: prompt,
  });

  // Prepare the request payload
  const data = {
    system: {
      instructions: systemInstructions, // Add system instructions as per the API's requirements
    },
    messages: conversationHistory, // Add the conversation log under the `messages` property
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
