// Import the dummy data
import dummyEventData from "./dummyEventData";

export async function getOrganisedBy() {
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(
        { queryName: 'getOrganisers',
        message: 'get-organisers', 
    }
),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log(data.data);    
    return data.data;
    

  } catch (error) {
    console.error("Error fetching data from the server:", error);
    throw error;
  }
}