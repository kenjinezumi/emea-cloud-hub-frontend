const API_URL = "your-api-url"; // Replace with your API's URL

const retrieveEventDataFromAPI = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const eventData = await response.json();
    if (!eventData || !eventData.eventId || !eventData.startDate || !eventData.title) {
      throw new Error("Mandatory fields (eventId, startDate, title) are missing in the API response.");
    }

    return eventData;
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
};

export { retrieveEventDataFromAPI };
