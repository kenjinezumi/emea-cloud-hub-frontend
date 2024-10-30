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
    countries: ['BE', 'LU', 'NL'],
  },
  {
    subregion: 'CEE',
    countries: [
      'BG', 'CY', 'CZ', 'EE', 'GR', 'HU', 'LT', 'LV', 'PL', 
      'RO', 'RU', 'SK', 'UA'
    ],
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
    countries: ['AE', 'EG', 'KE', 'KW', 'NG', 'OM', 'QA', 'SA', 'TR', 'ZA'],
  },
  {
    subregion: 'Nordics',
    countries: ['DK', 'FI', 'NO', 'SE'],
  },
  {
    subregion: 'UK/IE',
    countries: ['GB', 'IE'],
  },
];
export const countriesData = [
  {
    country: 'AT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Alps',
  },
  {
    country: 'CH',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Alps',
  },
  {
    country: 'BE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Benelux',
  },
  {
    country: 'LU',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Benelux',
  },
  {
    country: 'NL',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Benelux',
  },
  {
    country: 'BG',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'CY',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'CZ',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'EE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'GR',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'HU',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'LT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'LV',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'PL',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'RO',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'RU',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'SK',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'UA',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'CEE',
  },
  {
    country: 'FR',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'France',
  },
  {
    country: 'DE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Germany',
  },
  {
    country: 'IT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Italy',
  },
  {
    country: 'ES',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Iberia',
  },
  {
    country: 'PT',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Iberia',
  },
  {
    country: 'IL',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Israel',
  },
  {
    country: 'AE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'EG',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'KE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'KW',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'NG',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'OM',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'QA',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'SA',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'TR',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'ZA',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'MEA',
  },
  {
    country: 'DK',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Nordics',
  },
  {
    country: 'FI',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Nordics',
  },
  {
    country: 'NO',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Nordics',
  },
  {
    country: 'SE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'Nordics',
  },
  {
    country: 'GB',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'UK/IE',
  },
  {
    country: 'IE',
    region: ['EMEA', 'GLOBAL'],
    subregion: 'UK/IE',
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
  'AT', 'CH', 'BE', 'LU', 'NL', 'BG', 'CY', 'CZ', 'EE', 'GR', 'HU', 
  'LT', 'LV', 'PL', 'RO', 'RU', 'SK', 'UA', 'FR', 'DE', 'IT', 'ES', 
  'PT', 'IL', 'AE', 'EG', 'KE', 'KW', 'NG', 'OM', 'QA', 'SA', 'TR', 
  'ZA', 'DK', 'FI', 'NO', 'SE', 'GB', 'IE'
];


export const languageOptions = [
  'English',
  'French',
  'German',
  'Italian',
  'Spanish',
];

export const okrOptions = [
  { label: 'Acquire Revenue', checked: true },
  { label: 'Champion Culture', checked: true },
  { label: 'Improve Efficiency', checked: true },
  { label: 'Lift Mindshare', checked: true },
  { label: 'Source Demand', checked: true },
];


export const gepOptions = [
  'AI & Analytics Platform (BigQuery, Gemini, Vertex)',
  'AI For Marketing',
  'AI Infra',
  'AI for Security',
  'AI x Security for Executives (non CISO)',
  'API Solutions',
  'API Solutions (Legacy)',
  'Accelerate innovation with modern collaboration',
  'Accomplish more with Gemini',
  'All Stages (Legacy)',
  'Boosting Productivity with Gemini AI (Gemini GWS + GCP for CXO)',
  'Born Digital (Legacy)',
  'Build Modern Apps',
  'Build What’s Next (Legacy)',
  'Business Intelligence (Looker)',
  'CISO Focused',
  'Cloud First with Managed Containers (Legacy)',
  'Cloud Security',
  'Cost Optimization (Legacy)',
  'Databases',
  'Dev Productivity with Gemini',
  'Fraud Protection Solutions',
  'Gen AI',
  'Gen AI (Legacy)',
  'Gen AI (Legacy)_Build Modern Apps (Legacy)',
  'Gen AI (Legacy)_Digital Natives - Early Stage Startups (Legacy)',
  'Gen AI (Legacy)_Digital Natives - Mid Stage Startups (Legacy)',
  'Gen AI (Legacy)_Infrastructure Modernization (Legacy)',
  'Gen AI_AI',
  'Gen AI_Developer',
  'General',
  'General_AI',
  'General_Data Cloud',
  'General_Developer',
  'General_Digital Natives - Mid Stage Startups (Legacy)',
  'General_Google Workspace',
  'General_Infrastructure Modernization (Legacy)',
  'General_Modern Infrastructure and Apps',
  'General_Not tied to any Global Campaign',
  'Generic (Legacy)',
  'Generic (Legacy)_Build Modern Apps (Legacy)',
  'Generic (Legacy)_Digital Natives - Mid Stage Startups (Legacy)',
  'Generic (Legacy)_Infrastructure Modernization (Legacy)',
  'Human Powered Software (Legacy)',
  'Hybrid Multi-cloud / Anthos (Legacy)',
  'Idea Stage (Legacy)',
  'Infra for AI (Legacy)',
  'Infrastructure Modernization',
  'Level up your security and privacy',
  'Lift and Transform (Legacy)',
  'Modern Apps and Databases (Legacy)',
  'Modernize Apps & Platforms (Legacy)',
  'Not Applicable (Not tied to Any Global Campaign)',
  'Not tied to any Global Campaign',
  'Pre-seed (Legacy)',
  'Ready for Modern Threats',
  'Responsible AI',
  'Spanner / BigTable / Firestore (Legacy)',
  'Sustainability',
  'Threat Ready with Mandiant',
  'Transforming SecOps',
];


export const audienceSeniorityOptions = [
  { label: 'Practitioner', checked: true },
  { label: 'Decision Maker', checked: true },
  { label: 'Executive', checked: true },
  { label: 'Line of Business Target Titles', checked: true },
  { label: 'Partner', checked: true },
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
  { label: 'Practitioner', checked: false },
  { label: 'Decision Maker', checked: false },
  { label: 'Executive', checked: false },
  { label: 'Line of Business Target Titles', checked: false },
  { label: 'Partner', checked: false },
];

export const productFamilyOptions = [
  { label: 'GCP', checked: false },
  { label: 'GWS', checked: false },
];

export const industryOptions = [
  'Telco, Media & Gaming',
  'Financial Services',
  'Manufacturing',
  'Public Sector',
  'Retail',
  'x-Industry',
  'Health Care',
];


export const partnerEventOptions = [
  { label: 'Yes', value: true, checked: false },
  { label: 'No', value: false, checked: false },
];

export const draftStatusOptions = [
  { label: 'Draft', value: 'Draft', checked: false },
  { label: 'Finalized', value: 'Finalized', checked: false },
  { label: 'Invite available', value: 'Invite available', checked: false },
];

