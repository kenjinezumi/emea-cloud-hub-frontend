export async function getEventData(queryEventData) {
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  // Define a template for your expected data structure
  const emptyDataTemplate = [{
    eventId: 'event123',
    title: 'Global Tech Conference',
    description: 'An annual conference focusing on the latest trends in technology.',
    emoji: '💻',
    startDate: '1900-06-15',
    endDate: '1900-06-18',
    marketingProgramInstanceId: 'marketing456',
    eventType: 'Conference',
    region: ['North America'],
    subRegion: ['Pacific Northwest'],
    country: ['United States'],
    activityOwner: ['Jane Doe'],
    speakers: ['John Smith', 'Diana Prince'],
    audiencePersona: ['Developers', 'Product Managers'],
    audienceSeniority: ['Senior', 'Mid-Level'],
    organisedBy: 'Time traveller',
    eventSeries: 'Tech Futures',
    emailLanguage: 'English',
    emailText: 'Join us for the annual Global Tech Conference...',
    languagesAndTemplates: '{"language": "English", "templateId": "template789"}',
    accountSegments: '{"segment": "Technology", "focus": "Innovation"}',
    customerUse: 'Product Demonstration',
    okr: 'Increase Customer Engagement',
    gep: 'Growth Expansion Plan',
    activityType: 'Educational',
    accountSectors: ['Technology', 'Healthcare'],
    maxEventCapacity: '500',
    peopleMeetingCriteria: 'Interested in Technology Advances',
    landingPageLink: 'https://example.com/tech-conference',
    salesKitLink: 'https://example.com/sales-kit',
    hailoLink: 'https://example.com/hailo',
    publishedDate: '1900',
    lastEditedDate: '1900'
  },];
  

  try {
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   credentials: 'include',
    //   headers: {
    //     'Content-Type': 'text/plain',
    //   },
    //   body: JSON.stringify({ queryName: queryEventData, message: 'get-data', 
    // }),
    // });

    // if (!response.ok) {
    //   throw new Error(`Network response was not ok (${response.status})`);
    // }

    // const data = await response.json();
    // console.log(data.data);
    // console.log('CHECK');
    // if (!data || !data.data || data.data.length === 0) {
    //   console.log('No data: returning dummy data');
    //   return emptyDataTemplate;
    // } else {
    //   console.log('Data is not empty', JSON.stringify(data.data, null, 2));
    //   return data.data;
    // }
    return [
      {
        "eventId": "cb6e5934-96c6-420e-ab4d-9a867a52022a",
        "title": "TEST",
        "description": "adfdsf",
        "emoji": "😃",
        "organisedBy": [
          "(aayushsharmaa)"
        ],
        "startDate": "2024-04-13T12:43:07.748Z",
        "endDate": "2024-04-13T12:43:07.748Z",
        "marketingProgramInstanceId": "sdfdsfd",
        "eventType": "Online Event",
        "region": [
          "GLOBAL"
        ],
        "subRegion": [
          "Benelux"
        ],
        "country": [
          "BE",
          "NL"
        ],
        "activityOwner": [],
        "speakers": [],
        "eventSeries": "no",
        "emailLanguage": "English",
        "emailText": "",
        "languagesAndTemplates": [],
        "customerUse": "yes",
        "okr": [
          "CHAMPION DEI & CULTURE"
        ],
        "gep": [
          "Infrastructure Modernization",
          "Not Application (Not tied to Any Global Engagement Plays)"
        ],
        "audiencePersona": [
          "Developer",
          "Finance Decision Maker",
          "Finance Executive"
        ],
        "audienceSeniority": [
          "Practitioner"
        ],
        "accountSectors": "commercial sector",
        "accountSegments": "{\"corporate\":true,\"enterprise\":true,\"smb\":false}",
        "maxEventCapacity": "342",
        "peopleMeetingCriteria": "424324",
        "landingPageLink": "https://cloudhub.googleplex.com/create-event",
        "salesKitLink": "https://cloudhub.googleplex.com/links",
        "hailoLink": "https://cloudhub.googleplex.com/links",
        "otherDocumentsLink": "https://cloudhub.googleplex.com/links",
        "isHighPriority": "true",
        "marketingActivityType": ""
      },
      {
        "eventId": "63963647-8aae-42f1-8a3e-3fa50c1e9cd9",
        "title": "Test 2",
        "description": "this is a test, this is a test,this is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a testthis is a test",
        "emoji": "🐵",
        "organisedBy": [
          "(abigailvasquez)",   "(abigailvasquez)"
        ],
        "startDate": "2024-04-14T10:29:52.886Z",
        "endDate": "2024-04-20T10:15:52.000Z",
        "marketingProgramInstanceId": "abcdefg",
        "eventType": "Physical Event",
        "region": [
          "GLOBAL"
        ],
        "subRegion": [
          "Alps",
          "Benelux",
          "CEE",
          "France"
        ],
        "country": [
          "AT",
          "CH",
          "BE",
          "NL",
          "PL",
          "FR"
        ],
        "activityOwner": [],
        "speakers": [],
        "eventSeries": "no",
        "emailLanguage": "English",
        "emailText": "Hello world",
        "languagesAndTemplates": [],
        "customerUse": "no",
        "okr": [
          "LIFT MINDSHARE",
          "SOURCE DEMAND",
          "SCALED ACQUISITION"
        ],
        "gep": [
          "Infrastructure Modernization",
          "Not Application (Not tied to Any Global Engagement Plays)"
        ],
        "audiencePersona": [
          "Data Executive",
          "Developer",
          "Finance Decision Maker"
        ],
        "audienceSeniority": [
          "Practitioner",
          "Executive"
        ],
        "accountSectors": "commercial sector",
        "accountSegments": "{\"corporate\":true,\"enterprise\":true,\"smb\":false}",
        "maxEventCapacity": "1000000",
        "peopleMeetingCriteria": "2332",
        "landingPageLink": "https://cloudhub.googleplex.com/create-event",
        "salesKitLink": "https://cloudhub.googleplex.com/create-event",
        "hailoLink": "https://cloudhub.googleplex.com/create-event",
        "otherDocumentsLink": "https://cloudhub.googleplex.com/create-event",
        "isHighPriority": "false",
        "marketingActivityType": ""
      }
    ]
    
    
  } catch (error) {
    console.error('Error fetching data from the server:', error);
    throw error;
  }
}



