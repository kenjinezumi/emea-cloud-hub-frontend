const initialFormData = {
  eventId: '', // STRING
  tacticId: '', // STRING
  title: '', // STRING
  description: '', // STRING
  emoji: '', // STRING
  organisedBy: [], // ARRAY<STRING>
  startDate: null, // STRING, but initializing with Date object for user inputs
  endDate: null, // STRING, but initializing with Date object for user inputs
  marketingProgramInstanceId: '', // STRING
  eventType: '', // STRING
  region: '', // STRING
  subRegion: [], // ARRAY<STRING>
  country: [], // ARRAY<STRING>
  activityOwner: [], // ARRAY<STRING>
  speakers: [], // ARRAY<STRING>
  isEventSeries: false, // BOOL
  languagesAndTemplates: [], // ARRAY of STRUCT { platform: '', language: '', template: '' }
  okr: [], // ARRAY of STRUCT { type: '', percentage: '' }
  gep: [], // ARRAY<STRING>
  audiencePersona: [], // ARRAY<STRING>
  audienceSeniority: [], // ARRAY<STRING>
  accountSectors: {
    commercial: false, // BOOL
    public: false, // BOOL
  },
  accountSegments: {
    Corporate: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    SMB: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    Select: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    Enterprise: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    Startup: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
  },
  maxEventCapacity: '', // STRING
  peopleMeetingCriteria: '', // STRING
  landingPageLinks: [], // ARRAY<STRING>
  salesKitLinks: [], // ARRAY<STRING>
  hailoLinks: [], // ARRAY<STRING>
  otherDocumentsLinks: [], // ARRAY<STRING>
  isApprovedForCustomerUse: false, // BOOL
  isDraft: true, // BOOL
  isPublished: false, // BOOL
  isHighPriority: false, // BOOL
  isPartneredEvent: false, // BOOL
  partnerRole: '', // STRING
  accountCategory: {
    "Digital Native": { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    "Traditional": { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
  },
  accountType: {
    Greenfield: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    "Existing Customer": { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
  },
  productAlignment: {
    GCP: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
    GWS: { selected: false, percentage: '' }, // STRUCT { selected: BOOL, percentage: STRING }
  },
  aiVsCore: '', // STRING
  industry: '', // STRING
  city: '', // STRING
  locationVenue: '', // STRING
  marketingActivityType: '', // STRING
  userTimezone: '', // STRING
};

export { initialFormData };
