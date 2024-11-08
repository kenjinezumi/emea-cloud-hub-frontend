const API_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/google.com:cloudhub/locations/us-central1/publishers/google/models/gemini-1.5-pro-002:streamGenerateContent';

const fetchGeminiResponse = async (prompt) => {
  const accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');

  if (!accessToken) {
    console.error("No access token found. Please authenticate.");
    return 'Error: Access token not found';
  }

  const data = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Gemini response:', response.statusText, errorText);
      return `Error: Unable to fetch response - ${errorText}`;
    }

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
  } catch (error) {
    console.error('Error fetching Gemini response:', error);
    return 'Error: Unable to connect to Gemini API';
  }
};

export { fetchGeminiResponse };
