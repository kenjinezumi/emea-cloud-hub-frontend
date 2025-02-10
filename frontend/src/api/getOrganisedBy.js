// Import the dummy data
import dummyOrganisedData from "./dummyOrganisedData";

export async function getOrganisedBy() {
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        queryName: 'getOrganisers',
        message: 'get-organisers',
      }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();

    const uniqueData = [
      ...new Map(
        data.data.map((item) => [JSON.stringify(item.organisedBy), item])
      ).values(),
    ];

    return uniqueData;

    // ----- OR, if you just want to use dummyOrganisedData, for example: -----
    /*
    const uniqueDummy = [
      ...new Map(
        dummyOrganisedData.map((item) => [JSON.stringify(item.organisedBy), item])
      ).values(),
    ];
    console.log("Unique dummy data:", uniqueDummy);
    return uniqueDummy;
    */
    
  } catch (error) {
    console.error("Error fetching data from the server:", error);
    throw error;
  }
}
