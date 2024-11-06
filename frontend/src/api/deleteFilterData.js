// Backend API URL
const API_URL = 'https://backend-dot-cloudhub.googleplex.com/';

// Function to send delete request to the backend
const deleteFilterDataFromAPI = async (filterName) => {
  console.log(`Deleting filter: ${filterName}`); // Log the filter name being deleted
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        data: { name: filterName }, 
        message: 'delete-config', 
        queryName: 'deleteConfig', 
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting data:', error);
  }
};

export { deleteFilterDataFromAPI };
