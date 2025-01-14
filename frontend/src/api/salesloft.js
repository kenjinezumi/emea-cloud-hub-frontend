const API_URL = 'https://backend-dot-cloudhub.googleplex.com/';

const createSalesLoftEmailTemplate = async (salesLoftTemplate) => {
  console.log('Sending SalesLoft template to backend:', salesLoftTemplate);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include', // Include credentials if necessary
      headers: {
        'Content-Type': 'text/plain',  // Using text/plain
      },
      body: JSON.stringify({
        data: {
          title: salesLoftTemplate.title,
          subject: salesLoftTemplate.subjectLine,
          body: salesLoftTemplate.template,
          open_tracking: true,
          click_tracking: true,
          attachment_ids: '',
        },
        message: 'salesloft-cadence',  // Set the message to salesloft-cadence
        queryName: 'createSalesLoftCadence',  // Query name for backend logic
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();  // Expecting a JSON response from the backend
    console.log('Backend response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending data to backend:', error);
    return { success: false, message: error.message };
  }
};

export { createSalesLoftEmailTemplate };
