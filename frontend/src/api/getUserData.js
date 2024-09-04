
export async function getUserData() {
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/api/get-user-email`;

  

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      }
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log(data.data);
    return data

  } catch (error) {
    console.error("Error fetching data from the server:", error);
    throw error;
  }
}