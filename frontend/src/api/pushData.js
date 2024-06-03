const API_URL = 'https://backend-dot-cloudhub.googleplex.com/'; 
const sendDataToAPI = async (data) => {
  console.log(data);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        data: data, 
        message: 'save-data', 
        queryName: 'saveData', 
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

export {sendDataToAPI};
