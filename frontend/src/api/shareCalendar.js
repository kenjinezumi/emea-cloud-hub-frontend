export async function shareToGoogleCalendar(accessToken, eventData) {
    const response = await fetch("https://backend-dot-cloudhub.googleplex.com/share-to-calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(eventData),
    });
    return await response.json();
  }

