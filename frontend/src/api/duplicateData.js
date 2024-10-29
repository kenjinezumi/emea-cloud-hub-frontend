const API_URL = 'https://backend-dot-cloudhub.googleplex.com/'; 
const duplicateEvent = async (eventId, eventData) => {
    const data = {
      eventId: eventId,
      eventData: eventData,
      message: 'duplicate-event',
      queryName: 'duplicateEvent',
    };
  
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          data: data, 
          message: 'duplicate-event',
          queryName: 'duplicateEvent',
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Event duplicated successfully:', result);
      } else {
        console.error('Failed to duplicate event:', response.statusText);
      }
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };
  
  

export {duplicateEvent};
