const API_URL = 'https://backend-dot-cloudhub.googleplex.com/saveEventData'; // Replace with your API's URL
console.log('CHECKING THE save DATA API');

const sendDataToAPI = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
