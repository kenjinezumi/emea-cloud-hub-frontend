// Import the dummy data
import dummyEventData from "./dummyEventData";

export async function getEventData(queryEventData) {
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  // Define a template for your expected data structure
  const emptyDataTemplate = [
    {
      eventId: "event123",
      title: "Global Tech Conference",
      description:
        "An annual conference focusing on the latest trends in technology.",
      emoji: "💻",
      startDate: "1900-06-15",
      endDate: "1900-06-18",
      marketingProgramInstanceId: "marketing456",
      eventType: "Conference",
      region: ["North America"],
      subRegion: ["Pacific Northwest"],
      country: ["United States"],
      activityOwner: ["Jane Doe"],
      speakers: ["John Smith", "Diana Prince"],
      audiencePersona: ["Developers", "Product Managers"],
      audienceSeniority: ["Senior", "Mid-Level"],
      organisedBy: "Time traveller",
      eventSeries: "Tech Futures",
      emailLanguage: "English",
      emailText: "Join us for the annual Global Tech Conference...",
      languagesAndTemplates:
        '{"language": "English", "templateId": "template789"}',
      accountSegments: '{"segment": "Technology", "focus": "Innovation"}',
      customerUse: "Product Demonstration",
      okr: "Increase Customer Engagement",
      gep: "Growth Expansion Plan",
      activityType: "Educational",
      accountSectors: ["Technology", "Healthcare"],
      maxEventCapacity: "500",
      peopleMeetingCriteria: "Interested in Technology Advances",
      landingPageLink: "https://example.com/tech-conference",
      salesKitLink: "https://example.com/sales-kit",
      hailoLink: "https://example.com/hailo",
      publishedDate: "1900",
      lastEditedDate: "1900",
    },
  ];

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ queryName: queryEventData, message: 'get-data', 
    }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log(data.data);
    console.log('CHECK');
    if (!data || !data.data || data.data.length === 0) {
      return emptyDataTemplate;
    } else {
      return data.data;
    }

    return data
    // return dummyEventData;

  } catch (error) {
    console.error("Error fetching data from the server:", error);
    throw error;
  }
}