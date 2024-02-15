export const eventTypeOptions = [
  {label: 'Online Event', checked: true},
  {label: 'Physical Event', checked: true},
  {label: 'Hybrid Event', checked: true},
  {label: 'Customer Story', checked: true},
  {label: 'Blog Post', checked: true},
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
    subregions: ['Alps', 'Benelux', 'CEE', 'France', 'Iberia', 'Israel', 'Italy', 'MEA', 'Nordics', 'UK/IE'],
  },
  {
    region: 'EMEA',
    subregions: ['Alps', 'Benelux', 'CEE', 'France', 'Iberia', 'Israel', 'Italy', 'MEA', 'Nordics', 'UK/IE'],
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
    countries: ['DE', 'NO', 'SE'],
  },
  {
    subregion: 'UK/IE',
    countries: ['GB'],
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
    subregion: 'Nordics',
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
    country: 'GB',
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
  'GB',
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
  'Data Decision Maker',
  'Data End User',
  'Data Executive',
  'Developer',
  'Finance Decision Maker',
  'Finance End User',
  'Finance Executive',
  'HR Decision Maker',
  'HR End User',
  'HR Executive',
  'Industry LOB - Edu DM',
  'Industry LOB - Edu End User',
  'Industry LOB - Edu Exec',
  'Industry LOB - FinServ DM',
  'Industry LOB - FinServ Exec',
  'Industry LOB - Gaming DM',
  'Industry LOB - Gaming Exec',
  'Industry LOB - Gov DM',
  'Industry LOB - Gov End User',
  'Industry LOB - Gov Exec',
  'Industry LOB - Healthcare DM',
  'Industry LOB - Healthcare Exec',
  'Industry LOB - Manufacturing DM',
  'Industry LOB - Manufacturing Exec',
  'Industry LOB - Media Entertainment DM',
  'Industry LOB - Media Entertainment Exec',
  'Industry LOB - Retail DM',
  'Industry LOB - Retail Exec',
  'Information Decision Maker',
  'Information End User',
  'Information Executive',
  'Legal Decision Maker',
  'Legal End User',
  'Legal Executive',
  'Marketing Decision Maker',
  'Marketing End User',
  'Marketing Executive',
  'Operations Decision Maker',
  'Operations End User',
  'Operations Executive',
  'Other Decision Maker',
  'Other End User',
  'Other Executive',
  'Product Decision Maker',
  'Product End User',
  'Product Executive',
  'Sales Decision Maker',
  'Sales End User',
  'Sales Executive',
  'Security Decision Maker',
  'Security End User',
  'Security Executive',
  'Technology Decision Maker',
  'Technology End User',
  'Technology Executive',
];
