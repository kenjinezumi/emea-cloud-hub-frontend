const API_URL = 'https://backend.cloudhub.googleplex.com/'; // Replace with your API's URL

const sendDataToAPI = async (data) => {
  console.log(data);
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
    return response.json();
  } catch (error) {
    console.error('Error sending data:', error);
  }
};

export {sendDataToAPI};
