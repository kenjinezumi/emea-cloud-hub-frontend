const API_URL = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:predict';
const API_KEY = process.env.GEMINI_API_KEY; // Fetch from environment variable

/**
 * Fetches a response from the Google Cloud Gemini API based on a prompt.
 * @param {string} prompt - The user's prompt to send to Gemini.
 * @returns {Promise<string>} - The response text from Gemini.
 */
const fetchGeminiResponse = async (prompt) => {
  const data = {
    instances: [{ content: prompt }],
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      return result.predictions[0]?.content || 'No response from Gemini';
    } else {
      console.error('Failed to fetch Gemini response:', response.statusText);
      return 'Error: Unable to fetch response';
    }
  } catch (error) {
    console.error('Error fetching Gemini response:', error);
    return 'Error: Unable to connect to Gemini API';
  }
};

export { fetchGeminiResponse };
