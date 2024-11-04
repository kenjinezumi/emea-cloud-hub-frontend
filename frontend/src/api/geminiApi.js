const API_URL = 'https://us-central1-aiplatform.googleapis.com/v1/projects/google.com:cloudhub/locations/us-central1/publishers/google/models/gemini-1.5-pro-002:generateContent';

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

    if (response.ok) {
      const result = await response.json();
      console.log("Full response from Gemini API:", result);
      
      // Extract the content from the first candidate
      const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      return content || 'No response from Gemini';
    } else {
      const errorText = await response.text();
      console.error('Failed to fetch Gemini response:', response.statusText, errorText);
      return `Error: Unable to fetch response - ${errorText}`;
    }
  } catch (error) {
    console.error('Error fetching Gemini response:', error);
    return 'Error: Unable to connect to Gemini API';
  }
};

export { fetchGeminiResponse };
