// Backend API URL
const API_URL = 'https://backend-dot-cloudhub.googleplex.com/';

// Function to send data to the backend
const sendFilterDataToAPI = async (data) => {
  console.log(data); // Log the data being sent
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        data: data, 
        message: 'save-config', 
        queryName: 'saveConfig', 
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error sending data:', error);
  }
};

export {sendFilterDataToAPI};
