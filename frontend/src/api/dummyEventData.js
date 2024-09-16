const dummyEventData = [
  {
    "eventId": "event-001",
    "tacticId": "tactic-001",
    "title": "Sample Event Title",
    "description": "This is a test event description.",
    "emoji": "🎉",
    "organisedBy": [
      "Org1",
      "Org2"
    ],
    "startDate": "2024-09-19T10:00:00Z",
    "endDate": "2024-09-19T18:00:00Z",
    "marketingProgramInstanceId": "MP-001",
    "eventType": "Physical Event",
    "region": "GLOBAL",
    "subRegion": [
      "Benelux",
      "Germany"
    ],
    "country": [
      "BE",
      "DE"
    ],
    "activityOwner": [
      "Owner1",
      "Owner2"
    ],
    "speakers": [
      "speaker1@example.com",
      "speaker2@example.com"
    ],
    "eventSeries": "no",
    "languagesAndTemplates": [
      {
        "platform": "Gmail",
        "language": "English",
        "template": "Template1"
      },
      {
        "platform": "Salesloft",
        "language": "French",
        "template": "Template2"
      }
    ],
    "customerUse": "yes",
    "okr": [
      {
        "type": "CHAMPION DEI & CULTURE",
        "percentage": "50"
      },
      {
        "type": "SOURCE DEMAND",
        "percentage": "50"
      }
    ],
"gep": ["Infrastructure Modernization", "Reimagine FSI"],
    "audiencePersona": [
      "Developer",
      "Finance"
    ],
    "audienceSeniority": [
      "Decision Maker",
      "Practitioner"
    ],
    "accountSectors": {
      "commercial": true,
      "public": false
    },
    "accountSegments": {
      "Corporate": {
        "selected": true,
        "percentage": "60"
      },
      "SMB": {
        "selected": false,
        "percentage": "0"
      },
      "Select": {
        "selected": true,
        "percentage": "20"
      },
      "Enterprise": {
        "selected": false,
        "percentage": "0"
      },
      "Startup": {
        "selected": true,
        "percentage": "20"
      }
    },
    "maxEventCapacity": "200",
    "peopleMeetingCriteria": "150",
    "landingPageLinks": [
      "http://landingpage1.com"
    ],
    "salesKitLinks": [
      "http://saleskitlink1.com"
    ],
    "hailoLinks": [
      "http://hailolink1.com"
    ],
    "otherDocumentsLinks": [
      "http://otherdoclink1.com"
    ],
    "approvedForCustomerUse": true,
    "isHighPriority": true,
    "isPartneredEvent": true,
    "partnerRole": "Host Event (Webinar, Townhall, Workshop, Demo)",
    "accountCategory": {
      "Digital Native": {
        "selected": true,
        "percentage": "100"
      },
      "Traditional": {
        "selected": false,
        "percentage": "0"
      }
    },
    "accountType": {
      "Greenfield": {
        "selected": true,
        "percentage": "50"
      },
      "Existing Customer": {
        "selected": true,
        "percentage": "50"
      }
    },
    "productAlignment": {
      "GCP": {
        "selected": true,
        "percentage": "70"
      },
      "GWS": {
        "selected": true,
        "percentage": "30"
      }
    },
    "aiVsCore": "AI",
    "industry": "Healthcare",
    "city": "London",
    "locationVenue": "O2 Arena",
    "marketingActivityType": "Marketing Activity Type 1",
    "isDraft": true
  },
  {
    "eventId": "event-002",
    "tacticId": "tactic-002",
    "title": "Matching Event",
    "description": "This event matches all filters.",
    "emoji": "📅",
    "organisedBy": [
      "Org3",
      "Org4"
    ],
    "startDate": "2024-10-05T09:00:00Z",
    "endDate": "2024-10-05T17:00:00Z",
    "marketingProgramInstanceId": "MP-002",
    "eventType": "Physical Event",
    "region": "EMEA",
    "subRegion": [
      "Benelux",
      "Germany"
    ],
    "country": [
      "BE",
      "DE"
    ],
    "activityOwner": [
      "Owner3",
      "Owner4"
    ],
    "speakers": [
      "speaker3@example.com"
    ],
    "eventSeries": "yes",
    "languagesAndTemplates": [
      {
        "platform": "Gmail",
        "language": "English",
        "template": "Template3"
      }
    ],
    "customerUse": "yes",
    "okr": [
      {
        "type": "CHAMPION DEI & CULTURE",
        "percentage": "60"
      },
      {
        "type": "SOURCE DEMAND",
        "percentage": "40"
      }
    ],
    "gep": ["Infrastructure Modernization", "Reimagine FSI"],
    "audiencePersona": [
      "Developer",
      "Finance"
    ],
    "audienceSeniority": [
      "Decision Maker",
      "Executive"
    ],
    "accountSectors": {
      "commercial": true,
      "public": true
    },
    "accountSegments": {
      "Corporate": {
        "selected": true,
        "percentage": "50"
      },
      "SMB": {
        "selected": true,
        "percentage": "30"
      }
    },
    "maxEventCapacity": "100",
    "peopleMeetingCriteria": "80",
    "landingPageLinks": [
      "http://landingpage2.com"
    ],
    "salesKitLinks": [
      "http://saleskitlink2.com"
    ],
    "hailoLinks": [
      "http://hailolink2.com"
    ],
    "otherDocumentsLinks": [
      "http://otherdoclink2.com"
    ],
    "approvedForCustomerUse": true,
    "isHighPriority": false,
    "isPartneredEvent": true,
    "partnerRole": "Co-Host",
    "accountCategory": {
      "Digital Native": {
        "selected": true,
        "percentage": "100"
      }
    },
    "accountType": {
      "Greenfield": {
        "selected": true,
        "percentage": "70"
      }
    },
    "productAlignment": {
      "GCP": {
        "selected": true,
        "percentage": "80"
      }
    },
    "aiVsCore": "AI",
    "industry": "Healthcare",
    "city": "Berlin",
    "locationVenue": "Berlin Conference Center",
    "marketingActivityType": "Workshop",
    "isDraft": true
  }
];

export default dummyEventData;
