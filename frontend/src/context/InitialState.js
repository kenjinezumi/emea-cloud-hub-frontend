const initialFormData = {
  eventId: '',
  title: '',
  description: '',
  emoji: '',
  organisedBy: [],
  startDate: new Date(),
  endDate: new Date(),
  marketingProgramInstanceId: '',
  eventType: '',
  region: [],
  subRegion: [],
  country: [],
  activityOwner: [],
  speakers: [],
  eventSeries: 'no',
  emailLanguage: 'English',
  emailText: '',
  languagesAndTemplates: [],  // platform, language, and template
  customerUse: 'yes',
  okr: [],  // OKR array
  gep: [],  // GEP array
  audiencePersona: [],
  audienceSeniority: [],
  accountSectors: {
    commercial: false,
    public: false,
  },
  accountSegments: {
    Corporate: { selected: false, percentage: '' },
    SMB: { selected: false, percentage: '' },
    Select: { selected: false, percentage: '' },
    Enterprise: { selected: false, percentage: '' },
    Startup: { selected: false, percentage: '' },
  },
  productAlignment: {
    GCP: { selected: false, percentage: '' },
    GWS: { selected: false, percentage: '' },
  },
  maxEventCapacity: '',
  peopleMeetingCriteria: '',
  landingPageLink: '',
  salesKitLink: '',
  hailoLink: '',
  otherDocumentsLink: '',
  isHighPriority: false,
  isPartneredEvent: false,   // For partnered events
  partnerRole: '',           // Role in partnered events
  accountCategory: {
    "Digital Native": { selected: false, percentage: '' },
    "Traditional": { selected: false, percentage: '' },
  },
  aiVsCore: '',              // AI vs Core field
  industry: '',              // Industry type field
  city: '',                  // Event location city
  locationVenue: '',         // Venue location
  marketingActivityType: '', // Marketing activity type
  isDraft: true,             // Draft status
};

export { initialFormData };
