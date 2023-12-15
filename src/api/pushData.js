const API_URL = "your-api-url"; // Replace with your API's URL

const sendDataToAPI = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log(JSON.stringify(data));
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log("Data sent successfully");
    return response.json(); 
  } catch (error) {
    console.error("Error sending data:", error);
  }
};

export { sendDataToAPI };
