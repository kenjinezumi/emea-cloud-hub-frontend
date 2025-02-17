export const eventTypeOptions = [
  {label: 'Online Event', checked: true},
  {label: 'Physical Event', checked: true},
  {label: 'Hybrid Event', checked: true},
  {label: 'Prospecting Sprint', checked: true},

];

export const regionFilters = [
  { label: 'EMEA', checked: true },
  { label: 'LATAM', checked: true },
  { label: 'NORTHAM', checked: true },
  { label: 'JAPAC', checked: true },
];


export const regionOptions = [
  'EMEA',
  'LATAM',
  'NORTHAM',
  'JAPAC',
];

export const regionsData = [
  {
    region: 'EMEA',
    subregions: ['Alps', 'Benelux', 'CEE', 'France', 'Germany', 'Iberia', 'Israel', 'Italy', 'MEA', 'Nordics', 'UK/IE'],
  },
  {
    region: 'JAPAC',
    subregions: ['AuNZ', 'Greater China', 'India', 'Japan', 'Korea', 'SEA'],
  },
  {
    region: 'LATAM',
    subregions: ['Brazil', 'MCO', 'Mexico'],
  },
];

export const subregionsData = [
  { subregion: 'Alps', countries: ['AT', 'CH'] },
  { subregion: 'Benelux', countries: ['BE', 'LU', 'NL'] },
  { subregion: 'CEE', countries: ['BG', 'CY', 'CZ', 'EE', 'GR', 'HU', 'LT', 'LV', 'PL', 'RO', 'RU', 'SK', 'UA'] },
  { subregion: 'France', countries: ['FR'] },
  { subregion: 'Germany', countries: ['DE'] },
  { subregion: 'Iberia', countries: ['ES', 'PT'] },
  { subregion: 'Israel', countries: ['IL'] },
  { subregion: 'Italy', countries: ['IT'] },
  { subregion: 'MEA', countries: ['AE', 'EG', 'KE', 'KW', 'NG', 'OM', 'QA', 'SA', 'TR', 'ZA'] },
  { subregion: 'Nordics', countries: ['DK', 'FI', 'NO', 'SE'] },
  { subregion: 'UK/IE', countries: ['GB', 'IE'] },

  // JAPAC Subregions
  { subregion: 'AuNZ', countries: ['AS', 'AU', 'CX', 'CC', 'CK', 'FJ', 'PF', 'TF', 'GU', 'HM', 'KI', 'NR', 'NC', 'NZ', 'NU', 'NF', 'MP', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU'] },
  { subregion: 'Greater China', countries: ['CN', 'HK', 'MO', 'MN', 'TW'] },
  { subregion: 'India', countries: ['IN', 'MH', 'PK', 'LK'] },
  { subregion: 'Japan', countries: ['JP'] },
  { subregion: 'Korea', countries: ['KP', 'KR'] },
  { subregion: 'SEA', countries: ['BD', 'BT', 'BN', 'KH', 'ID', 'LA', 'MY', 'MV', 'FM', 'MM', 'NP', 'PW', 'PG', 'PH', 'SG', 'TH', 'TL', 'VN'] },

  // LATAM Subregions
  { subregion: 'Brazil', countries: ['BR'] },
  { subregion: 'MCO', countries: ['AR', 'AI', 'AG', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BQ', 'KY', 'CR', 'CW', 'DM', 'DO', 'EC', 'SV', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 'MQ', 'NI', 'PA', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'VE', 'VG', 'VI', 'CU', 'FK', 'GF', 'MS', 'SX', 'GS', 'UM', 'PE', 'PY', 'UY', 'CL', 'CO'] },
  { subregion: 'Mexico', countries: ['MX'] },
];

export const countriesData = [
  // EMEA
  { country: 'AT', region: ['EMEA'], subregion: 'Alps' },
  { country: 'CH', region: ['EMEA'], subregion: 'Alps' },
  { country: 'BE', region: ['EMEA'], subregion: 'Benelux' },
  { country: 'LU', region: ['EMEA'], subregion: 'Benelux' },
  { country: 'NL', region: ['EMEA'], subregion: 'Benelux' },
  { country: 'BG', region: ['EMEA'], subregion: 'CEE' },
  { country: 'CY', region: ['EMEA'], subregion: 'CEE' },
  { country: 'CZ', region: ['EMEA'], subregion: 'CEE' },
  { country: 'EE', region: ['EMEA'], subregion: 'CEE' },
  { country: 'GR', region: ['EMEA'], subregion: 'CEE' },
  { country: 'HU', region: ['EMEA'], subregion: 'CEE' },
  { country: 'LT', region: ['EMEA'], subregion: 'CEE' },
  { country: 'LV', region: ['EMEA'], subregion: 'CEE' },
  { country: 'PL', region: ['EMEA'], subregion: 'CEE' },
  { country: 'RO', region: ['EMEA'], subregion: 'CEE' },
  { country: 'RU', region: ['EMEA'], subregion: 'CEE' },
  { country: 'SK', region: ['EMEA'], subregion: 'CEE' },
  { country: 'UA', region: ['EMEA'], subregion: 'CEE' },
  { country: 'FR', region: ['EMEA'], subregion: 'France' },
  { country: 'DE', region: ['EMEA'], subregion: 'Germany' },
  { country: 'IT', region: ['EMEA'], subregion: 'Italy' },
  { country: 'ES', region: ['EMEA'], subregion: 'Iberia' },
  { country: 'PT', region: ['EMEA'], subregion: 'Iberia' },
  { country: 'IL', region: ['EMEA'], subregion: 'Israel' },
  { country: 'AE', region: ['EMEA'], subregion: 'MEA' },
  { country: 'EG', region: ['EMEA'], subregion: 'MEA' },
  { country: 'KE', region: ['EMEA'], subregion: 'MEA' },
  { country: 'KW', region: ['EMEA'], subregion: 'MEA' },
  { country: 'NG', region: ['EMEA'], subregion: 'MEA' },
  { country: 'OM', region: ['EMEA'], subregion: 'MEA' },
  { country: 'QA', region: ['EMEA'], subregion: 'MEA' },
  { country: 'SA', region: ['EMEA'], subregion: 'MEA' },
  { country: 'TR', region: ['EMEA'], subregion: 'MEA' },
  { country: 'ZA', region: ['EMEA'], subregion: 'MEA' },
  { country: 'DK', region: ['EMEA'], subregion: 'Nordics' },
  { country: 'FI', region: ['EMEA'], subregion: 'Nordics' },
  { country: 'NO', region: ['EMEA'], subregion: 'Nordics' },
  { country: 'SE', region: ['EMEA'], subregion: 'Nordics' },
  { country: 'GB', region: ['EMEA'], subregion: 'UK/IE' },
  { country: 'IE', region: ['EMEA'], subregion: 'UK/IE' },

  // JAPAC - AuNZ
  { country: 'AS', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'AU', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'CX', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'CC', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'CK', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'FJ', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'PF', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'TF', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'GU', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'HM', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'KI', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'NR', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'NC', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'NZ', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'NU', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'NF', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'MP', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'PN', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'WS', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'SB', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'TK', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'TO', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'TV', region: ['JAPAC'], subregion: 'AuNZ' },
  { country: 'VU', region: ['JAPAC'], subregion: 'AuNZ' },

  // JAPAC - Greater China
  { country: 'CN', region: ['JAPAC'], subregion: 'Greater China' },
  { country: 'HK', region: ['JAPAC'], subregion: 'Greater China' },
  { country: 'MO', region: ['JAPAC'], subregion: 'Greater China' },
  { country: 'MN', region: ['JAPAC'], subregion: 'Greater China' },
  { country: 'TW', region: ['JAPAC'], subregion: 'Greater China' },

  // JAPAC - India
  { country: 'IN', region: ['JAPAC'], subregion: 'India' },
  { country: 'MH', region: ['JAPAC'], subregion: 'India' },
  { country: 'PK', region: ['JAPAC'], subregion: 'India' },
  { country: 'LK', region: ['JAPAC'], subregion: 'India' },

  // JAPAC - Japan
  { country: 'JP', region: ['JAPAC'], subregion: 'Japan' },

  // JAPAC - Korea
  { country: 'KP', region: ['JAPAC'], subregion: 'Korea' },
  { country: 'KR', region: ['JAPAC'], subregion: 'Korea' },

  // JAPAC - SEA
  { country: 'BD', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'BT', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'BN', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'KH', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'ID', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'LA', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'MY', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'MV', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'FM', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'MM', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'NP', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'PW', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'PG', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'PH', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'SG', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'TH', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'TL', region: ['JAPAC'], subregion: 'SEA' },
  { country: 'VN', region: ['JAPAC'], subregion: 'SEA' },

  // LATAM - Brazil
  { country: 'BR', region: ['LATAM'], subregion: 'Brazil' },

  // LATAM - MCO
  { country: 'AR', region: ['LATAM'], subregion: 'MCO' },
  { country: 'AI', region: ['LATAM'], subregion: 'MCO' },
  { country: 'AG', region: ['LATAM'], subregion: 'MCO' },
  { country: 'AW', region: ['LATAM'], subregion: 'MCO' },
  { country: 'BS', region: ['LATAM'], subregion: 'MCO' },
  { country: 'BB', region: ['LATAM'], subregion: 'MCO' },
  { country: 'BZ', region: ['LATAM'], subregion: 'MCO' },
  { country: 'BM', region: ['LATAM'], subregion: 'MCO' },
  { country: 'BO', region: ['LATAM'], subregion: 'MCO' },
  { country: 'BQ', region: ['LATAM'], subregion: 'MCO' },
  { country: 'KY', region: ['LATAM'], subregion: 'MCO' },
  { country: 'CR', region: ['LATAM'], subregion: 'MCO' },
  { country: 'CW', region: ['LATAM'], subregion: 'MCO' },
  { country: 'DM', region: ['LATAM'], subregion: 'MCO' },
  { country: 'DO', region: ['LATAM'], subregion: 'MCO' },
  { country: 'EC', region: ['LATAM'], subregion: 'MCO' },
  { country: 'SV', region: ['LATAM'], subregion: 'MCO' },
  { country: 'GD', region: ['LATAM'], subregion: 'MCO' },
  { country: 'GP', region: ['LATAM'], subregion: 'MCO' },
  { country: 'GT', region: ['LATAM'], subregion: 'MCO' },
  { country: 'GY', region: ['LATAM'], subregion: 'MCO' },
  { country: 'HT', region: ['LATAM'], subregion: 'MCO' },
  { country: 'HN', region: ['LATAM'], subregion: 'MCO' },
  { country: 'JM', region: ['LATAM'], subregion: 'MCO' },
  { country: 'MQ', region: ['LATAM'], subregion: 'MCO' },
  { country: 'NI', region: ['LATAM'], subregion: 'MCO' },
  { country: 'PA', region: ['LATAM'], subregion: 'MCO' },
  { country: 'KN', region: ['LATAM'], subregion: 'MCO' },
  { country: 'LC', region: ['LATAM'], subregion: 'MCO' },
  { country: 'MF', region: ['LATAM'], subregion: 'MCO' },
  { country: 'PM', region: ['LATAM'], subregion: 'MCO' },
  { country: 'VC', region: ['LATAM'], subregion: 'MCO' },
  { country: 'SR', region: ['LATAM'], subregion: 'MCO' },
  { country: 'TT', region: ['LATAM'], subregion: 'MCO' },
  { country: 'TC', region: ['LATAM'], subregion: 'MCO' },
  { country: 'VE', region: ['LATAM'], subregion: 'MCO' },
  { country: 'VG', region: ['LATAM'], subregion: 'MCO' },
  { country: 'VI', region: ['LATAM'], subregion: 'MCO' },
  { country: 'CU', region: ['LATAM'], subregion: 'MCO' },
  { country: 'FK', region: ['LATAM'], subregion: 'MCO' },
  { country: 'GF', region: ['LATAM'], subregion: 'MCO' },
  { country: 'MS', region: ['LATAM'], subregion: 'MCO' },
  { country: 'SX', region: ['LATAM'], subregion: 'MCO' },
  { country: 'GS', region: ['LATAM'], subregion: 'MCO' },
  { country: 'UM', region: ['LATAM'], subregion: 'MCO' },
  { country: 'PE', region: ['LATAM'], subregion: 'MCO' },
  { country: 'PY', region: ['LATAM'], subregion: 'MCO' },
  { country: 'UY', region: ['LATAM'], subregion: 'MCO' },
  { country: 'CL', region: ['LATAM'], subregion: 'MCO' },
  { country: 'CO', region: ['LATAM'], subregion: 'MCO' },
  // LATAM - Mexico
  { country: 'MX', region: ['LATAM'], subregion: 'Mexico' },
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
  'AuNZ',
  'Greater China',
  'India',
  'Japan',
  'Korea',
  'SEA',
  'Brazil',
  'MCO',
  'Mexico',
];



export const countryOptions = [
  // EMEA
  'AT', 'CH', 'BE', 'LU', 'NL', 'BG', 'CY', 'CZ', 'EE', 'GR', 'HU', 
  'LT', 'LV', 'PL', 'RO', 'RU', 'SK', 'UA', 'FR', 'DE', 'IT', 'ES', 
  'PT', 'IL', 'AE', 'EG', 'KE', 'KW', 'NG', 'OM', 'QA', 'SA', 'TR', 
  'ZA', 'DK', 'FI', 'NO', 'SE', 'GB', 'IE',
  
  // JAPAC - AuNZ
  'AS', 'AU', 'CX', 'CC', 'CK', 'FJ', 'PF', 'TF', 'GU', 'HM', 'KI', 'NR', 
  'NC', 'NZ', 'NU', 'NF', 'MP', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU',

  // JAPAC - Greater China
  'CN', 'HK', 'MO', 'MN', 'TW',

  // JAPAC - India
  'IN', 'MH', 'PK', 'LK',

  // JAPAC - Japan
  'JP',

  // JAPAC - Korea
  'KP', 'KR',

  // JAPAC - SEA
  'BD', 'BT', 'BN', 'KH', 'ID', 'LA', 'MY', 'MV', 'FM', 'MM', 'NP', 'PW', 
  'PG', 'PH', 'SG', 'TH', 'TL', 'VN',

  // LATAM - Brazil
  'BR',

  // LATAM - MCO
  'AR', 'AI', 'AG', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BQ', 'KY', 'CR', 
  'CW', 'DM', 'DO', 'EC', 'SV', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 
  'MQ', 'NI', 'PA', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'VE', 
  'VG', 'VI', 'CU', 'FK', 'GF', 'MS', 'SX', 'GS', 'UM', 'PE', 'PY', 'UY', 
  'CL', 'CO',

  // LATAM - Mexico
  'MX'
];

export const regionsFilterData = [

  {
    region: 'EMEA',
    subregions: [
      { label: 'Alps', countries: ['AT', 'CH'] },
      { label: 'Benelux', countries: ['BE', 'LU', 'NL'] },
      { label: 'CEE', countries: ['BG', 'CY', 'CZ', 'EE', 'GR', 'HU', 'LT', 'LV', 'PL', 'RO', 'RU', 'SK', 'UA'] },
      { label: 'France', countries: ['FR'] },
      { label: 'Germany', countries: ['DE'] },
      { label: 'Iberia', countries: ['ES', 'PT'] },
      { label: 'Israel', countries: ['IL'] },
      { label: 'Italy', countries: ['IT'] },
      { label: 'MEA', countries: ['AE', 'EG', 'KE', 'KW', 'NG', 'OM', 'QA', 'SA', 'TR', 'ZA'] },
      { label: 'Nordics', countries: ['DK', 'FI', 'NO', 'SE'] },
      { label: 'UK/IE', countries: ['GB', 'IE'] },
    ],
  },
  {
    region: 'JAPAC',
    subregions: [
      { label: 'AuNZ', countries: ['AU', 'NZ'] },
      { label: 'Greater China', countries: ['CN', 'HK', 'MO'] },
      { label: 'India', countries: ['IN', 'MH', 'PK', 'LK'] },
      { label: 'Japan', countries: ['JP'] },
      { label: 'Korea', countries: ['KP', 'KR'] },
      { label: 'SEA', countries: ['BD', 'BT', 'BN', 'KH', 'ID', 'LA', 'MY', 'MV', 'FM', 'MM', 'NP', 'PW', 'PG', 'PH', 'SG', 'TH', 'TL', 'VN'] },
    ],
  },
  {
    region: 'LATAM',
    subregions: [
      { label: 'Brazil', countries: ['BR'] },
      { label: 'MCO', countries: [
        'AR', 'AI', 'AG', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BQ', 'KY', 'CR', 
        'CW', 'DM', 'DO', 'EC', 'SV', 'GD', 'GP', 'GT', 'GY', 'HT', 'HN', 'JM', 
        'MQ', 'NI', 'PA', 'KN', 'LC', 'MF', 'PM', 'VC', 'SR', 'TT', 'TC', 'VE', 
        'VG', 'VI', 'CU', 'FK', 'GF', 'MS', 'SX', 'GS', 'UM', 'PE', 'PY', 'UY', 
        'CL', 'CO'
      ] },
      { label: 'Mexico', countries: ['MX'] },
    ],
  },
];


export const languageOptions = [
  'Cantonese',
  'English',
  'French',
  'German',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Mandarin',
  'Portuguese',
  'Russian',
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
  'AI',
  'Data & Analytics',
  'Developer',
  'Google Workspace',
  'Modern Infrastructure and Apps',
  'Not Applicable (Not tied to Any Global Campaign)',
  'Security',
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
  { label: "Commercial", checked: false },
  { label: "Public Sector", checked: false, isPublic: true },
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
  { label: 'Finalized', value: 'Finalized', checked: true },
  { label: 'Invite available', value: 'Invite available', checked: true },
];

export const programNameOptions = [
  "Accomplish more with Gemini",
  "Accelerate innovation with modern collaboration",
  "AI & Analytics Platform (BigQuery, Gemini, Vertex)",
  "AI for Marketing",
  "AI for Security",
  "AI Infra",
  "AI x Security for Executives (non CISO)",
  "API Solutions",
  "Boosting Productivity with Gemini AI (Gemini GWS + GCP for CXO)",
  "Build Modern Apps",
  "Business Intelligence (Looker)",
  "CISO Focused",
  "Cloud Security",
  "Databases",
  "Dev Productivity with Gemini",
  "Fraud Protection Solutions",
  "General",
  "Gen AI",
  "Infrastructure Modernization",
  "Level up your security and privacy",
  "Not Applicable (Not tied to any global campaign)",
  "Ready for Modern Threats",
  "Responsible AI",
  "Sustainability",
  "Threat Ready with Mandiant",
  "Transforming SecOps",
]

export const newlyCreatedOptions = [
  { label: "Yes", value: true, checked: false },
  { label: "No", value: false, checked: false },
];