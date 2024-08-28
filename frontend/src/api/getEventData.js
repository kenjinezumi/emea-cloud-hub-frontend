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
        "eventId": "d8a0567a-44c6-479e-9474-0e44877e0966",
        "title": "test",
        "description": "TESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST",
        "emoji": "",
        "organisedBy": [
          "(abduljelil)",
          "(abemiller)",
          "(abgentile)",
          "(abhishekpande)"
        ],
        "startDate": "2024-08-05T16:51:57.906Z",
        "endDate": "2024-09-05T16:51:57.906Z",
        "marketingProgramInstanceId": "TTEST",
        "eventType": "Physical Event",
        "region": "GLOBAL",
        "subRegion": [
          "Alps",
          "Benelux"
        ],
        "country": [
          "AT",
          "CH",
          "BE",
          "NL"
        ],
        "activityOwner": [],
        "speakers": [],
        "eventSeries": "no",
        "languagesAndTemplates": [
          {
            "language": "",
            "template": "FSFSF"
          },
          {
            "language": "Spanish",
            "template": "ASFSDFSD"
          }
        ],
        "customerUse": "yes",
        "okr": [
          "LIFT MINDSHARE",
          "SOURCE DEMAND"
        ],
        "gep": [
          "Infrastructure Modernization",
          "Not Application (Not tied to Any Global Engagement Plays)",
          "Reimagine FSI"
        ],
        "audiencePersona": [
          "Industry LOB - Edu",
          "Industry LOB - Gaming",
          "Industry LOB - Gov"
        ],
        "audienceSeniority": [
          "Practitioner",
          "Executive"
        ],
        "accountSectors": {
          "commercial": true,
          "public": true
        },
        "accountSegments": {
          "enterprise": true,
          "corporate": true
        },
        "maxEventCapacity": "232432432",
        "peopleMeetingCriteria": "",
        "landingPageLinks": [],
        "salesKitLinks": [],
        "hailoLinks": [],
        "otherDocumentsLinks": [],
        "isDraft": false
      },
      {
        "eventId": "073dcb2f-b2af-4d6b-81a7-0fe1afa72600",
        "title": "234234",
        "description": "",
        "emoji": "",
        "organisedBy": [],
        "startDate": "2024-06-05T21:38:27.950Z",
        "endDate": "2024-06-05T21:38:27.950Z",
        "marketingProgramInstanceId": "",
        "eventType": "Online Event",
        "region": null,
        "subRegion": [],
        "country": [],
        "activityOwner": [],
        "speakers": [],
        "eventSeries": null,
        "languagesAndTemplates": [],
        "customerUse": null,
        "okr": [],
        "gep": [],
        "audiencePersona": [],
        "audienceSeniority": [],
        "accountSectors": null,
        "accountSegments": null,
        "maxEventCapacity": null,
        "peopleMeetingCriteria": null,
        "landingPageLinks": [],
        "salesKitLinks": [],
        "hailoLinks": [],
        "otherDocumentsLinks": [],
        "isDraft": true
      },
      {
        "eventId": "563c7134-0031-46e2-9583-959e6b335110",
        "title": "TEST",
        "description": "SFSFDSFDSA",
        "emoji": "🎆",
        "organisedBy": [
          "(abemiller)",
          "(abgentile)",
          "(abhineetk)",
          "(abhishekpande)",
          "(abigailvasquez)",
          "(abiodunb)"
        ],
        "startDate": "2024-06-05T21:53:36.736Z",
        "endDate": "2024-06-05T21:53:36.736Z",
        "marketingProgramInstanceId": "23423432",
        "eventType": "Online Event",
        "region": "GLOBAL",
        "subRegion": [
          "Benelux",
          "CEE",
          "France",
          "Iberia"
        ],
        "country": [
          "BE",
          "NL",
          "PL",
          "FR",
          "ES",
          "PT"
        ],
        "activityOwner": [],
        "speakers": [],
        "eventSeries": "no",
        "languagesAndTemplates": [
          {
            "language": "",
            "template": "SFSDF"
          },
          {
            "language": "Spanish",
            "template": "SDFSFD"
          }
        ],
        "customerUse": "yes",
        "okr": [
          "CHAMPION DEI & CULTURE",
          "SCALED ACQUISITION"
        ],
        "gep": [
          "Infrastructure Modernization",
          "Not Application (Not tied to Any Global Engagement Plays)"
        ],
        "audiencePersona": [
          "HR",
          "Industry LOB - FinServ",
          "Industry LOB - Gaming"
        ],
        "audienceSeniority": [
          "Decision Maker",
          "Practitioner",
          "Executive"
        ],
        "accountSectors": {
          "commercial": true,
          "public": true
        },
        "accountSegments": {
          "enterprise": true,
          "corporate": true
        },
        "maxEventCapacity": "4335345",
        "peopleMeetingCriteria": "",
        "landingPageLinks": [
          "https://cloudhub.googleplex.com/links",
          "https://cloudhub.googleplex.com/links",
          "https://cloudhub.googleplex.com/links"
        ],
        "salesKitLinks": [
          "https://cloudhub.googleplex.com/links",
          "https://cloudhub.googleplex.com/links"
        ],
        "hailoLinks": [
          "https://cloudhub.googleplex.com/links",
          "https://cloudhub.googleplex.com/links"
        ],
        "otherDocumentsLinks": [
          "https://cloudhub.googleplex.com/links",
          "https://cloudhub.googleplex.com/links"
        ],
        "isDraft": true
      }
    ]
    
    
  } catch (error) {
    console.error('Error fetching data from the server:', error);
    throw error;
  }
}



