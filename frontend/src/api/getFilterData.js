// Backend API URL
const API_URL = 'https://backend-dot-cloudhub.googleplex.com/';

// Function to retrieve filter data from the backend
const getFilterDataFromAPI = async (ldap) => {
  console.log(`Retrieving filters for LDAP: ${ldap}`); // Log the LDAP being queried
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        data: { ldap }, 
        message: 'get-filters', 
        queryName: 'getFilters', 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Filters retrieved successfully:', result.data);
    return result.data; // Return the filter data
  } catch (error) {
    console.error('Error retrieving filters:', error);
  }
};

export { getFilterDataFromAPI };
