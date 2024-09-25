export const eventTypeOptions = [
  {label: 'Online Event', checked: true},
  {label: 'Physical Event', checked: true},
  {label: 'Hybrid Event', checked: true},
];

export const regionFilters = [
  {label: 'APAC', checked: true},
  {label: 'EMEA', checked: true},
  {label: 'GLOBAL', checked: true},
  {label: 'JAPAN', checked: true},
  {label: 'LATAM', checked: true},
  {label: 'NORTHAM', checked: true},
];


export const regionOptions = [
  'GLOBAL',
  'APAC',
  'EMEA',
  'JAPAN',
  'LATAM',
  'NORTHAM',
];

export const regionsData = [
  {
    region: 'GLOBAL',
    subregions: ['Alps', 'Benelux', 'CEE', 'France', 'Germany' , 'Iberia', 'Israel', 'Italy', 'MEA', 'Nordics', 'UK/IE'],
  },
  {
    region: 'EMEA',
    subregions: ['Alps', 'Benelux', 'CEE', 'France', 'Germany' , 'Iberia', 'Israel', 'Italy', 'MEA', 'Nordics', 'UK/IE'],
  },
  // Add more regions with their respective subregions here
];

export const subregionsData = [
  {
    subregion: 'Alps',
    countries: ['AT', 'CH'],
  },
  {
    subregion: 'Benelux',
    countries: ['BE', 'NL'],
  },
  {
    subregion: 'CEE',
    countries: ['PL'],
  },
  {
    subregion: 'France',
    countries: ['FR'],
  },
  {
    subregion: 'Germany',
    countries: ['DE'],
  },
  {
    subregion: 'Iberia',
    countries: ['ES', 'PT'],
  },
  {
    subregion: 'Israel',
    countries: ['IL'],
  },
  {
    subregion: 'Italy',
    countries: ['IT'],
  },
  {
    subregion: 'MEA',
    countries: ['IL'],
  },
  {
    subregion: 'Nordics',
    countries: ['NO', 'SE'],
  },
  {
    subregion: 'UK/IE',
    countries: ['UK'],
  },

];


export const countriesData = [
  {
    country: 'AT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Alps',
  },
  {
    country: 'BE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Benelux',
  },
  {
    country: 'CH',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Alps',
  },
  {
    country: 'DE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Germany',
  },
  {
    country: 'ES',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Iberia',
  },
  {
    country: 'FR',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'France',
  },
  {
    country: 'UK',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'UK/IE',
  },
  {
    country: 'IL',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'IT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Italy',
  },
  {
    country: 'NL',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Benelux',
  },
  {
    country: 'NO',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Nordics',
  },
  {
    country: 'PL',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'PT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Iberia',
  },
  {
    country: 'SE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Nordics',
  },
];


export const subRegionOptions = [
  'Alps',
  'Benelux',
  'CEE',
  'France',
  'Germany',
  'Iberia',
  'Israel',
  'Italy',
  'MEA',
  'Nordics',
  'UK/IE',
];


export const countryOptions = [
  'AT',
  'BE',
  'CH',
  'DE',
  'ES',
  'FR',
  'UK',
  'IL',
  'IT',
  'NL',
  'NO',
  'PL',
  'PT',
  'SE',
];

export const languageOptions = [
  'English',
  'French',
  'German',
  'Italian',
  'Spanish',
];

export const okrOptions = [

  {label: 'CHAMPION DEI & CULTURE', checked: true},
  {label: 'LIFT MINDSHARE', checked: true},
  {label: 'SOURCE DEMAND', checked: true},
  {label: 'SCALED ACQUISITION', checked: true},
  {label: 'IMPROVE EFFICIENCY AND EFFECTIVENESS', checked: true},

];

export const gepOptions = [
  'Build Modern Apps',
  'Data Cloud',
  'Developer',
  'Digital Natives - Early Stage Startups',
  'Google Workspace',
  'Infrastructure Modernization',
  'Not Application (Not tied to Any Global Engagement Plays)',
  'Reimagine FSI',
  'Secure What Matters Most',
  'Solving for Innovation',
];

export const audienceSeniorityOptions = [
  {label: 'Decision Maker', checked: true},
  {label: 'Practitioner', checked: true},
  {label: 'Executive', checked: true},
];


export const audienceRoles = [
  'Chief Executive',
  'Data',
  'Developer',
  'Finance',
  'HR',
  'Industry LOB - Edu',
  'Industry LOB - FinServ',
  'Industry LOB - Gaming',
  'Industry LOB - Gov',
  'Industry LOB - Healthcare',
  'Industry LOB - Manufacturing',
  'Industry LOB - Media Entertainment',
  'Industry LOB - Retail',
  'Information',
  'Legal',
  'Marketing',
  'Operations',
  'Other',
  'Product',
  'Sales',
  'Security',
  'Technology',
];

export const accountSectorOptions = [
  { label: 'Commercial', checked: false },
  { label: 'Public', checked: false },
];

export const accountSegmentOptions = [
  { label: 'Corporate', checked: false },
  { label: 'SMB', checked: false},
  { label: 'Select', checked: false },
  { label: 'Enterprise', checked: false },
  { label: 'Startup', checked: false},
];

export const buyerSegmentRollupOptions = [
  { label: 'Decision Maker', checked: false },
  { label: 'Practitioner', checked: false },
  { label: 'Executive', checked: false },
];

export const productFamilyOptions = [
  { label: 'GCP', checked: false },
  { label: 'GWS', checked: false },
];

export const industryOptions = [
  'Manufacturing',
  'Healthcare',
  'Education',
  'Financial Services',
  'Government',
  'Retail',
];

export const partnerEventOptions = [
  { label: 'Partner Event', checked: false },
];

export const draftStatusOptions = [
  { label: 'Yes', value: true, checked: false },
  { label: 'No', value: false, checked: false },
];
