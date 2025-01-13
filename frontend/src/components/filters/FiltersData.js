export const eventTypeOptions = [
  {label: 'Online Event', checked: true},
  {label: 'Physical Event', checked: true},
  {label: 'Hybrid Event', checked: true},
  {label: 'Prospecting Sprint', checked: true},

];

export const regionFilters = [
  { label: 'EMEA', checked: true },
  { label: 'GLOBAL', checked: true },
  { label: 'LATAM', checked: true },
  { label: 'NORTHAM', checked: true },
  { label: 'JAPAC', checked: true },
];


export const regionOptions = [
  'GLOBAL',
  'EMEA',
  'LATAM',
  'NORTHAM',
  'JAPAC',
];

export const regionsData = [
  {
    region: 'GLOBAL',
    subregions: ['Alps', 'Benelux', 'CEE', 'France', 'Germany', 'Iberia', 'Israel', 'Italy', 'MEA', 'Nordics', 'UK/IE'],
  },
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
  { country: 'AT', region: ['EMEA', 'GLOBAL'], subregion: 'Alps' },
  { country: 'CH', region: ['EMEA', 'GLOBAL'], subregion: 'Alps' },
  { country: 'BE', region: ['EMEA', 'GLOBAL'], subregion: 'Benelux' },
  { country: 'LU', region: ['EMEA', 'GLOBAL'], subregion: 'Benelux' },
  { country: 'NL', region: ['EMEA', 'GLOBAL'], subregion: 'Benelux' },
  { country: 'BG', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'CY', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'CZ', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'EE', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'GR', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'HU', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'LT', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'LV', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'PL', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'RO', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'RU', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'SK', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'UA', region: ['EMEA', 'GLOBAL'], subregion: 'CEE' },
  { country: 'FR', region: ['EMEA', 'GLOBAL'], subregion: 'France' },
  { country: 'DE', region: ['EMEA', 'GLOBAL'], subregion: 'Germany' },
  { country: 'IT', region: ['EMEA', 'GLOBAL'], subregion: 'Italy' },
  { country: 'ES', region: ['EMEA', 'GLOBAL'], subregion: 'Iberia' },
  { country: 'PT', region: ['EMEA', 'GLOBAL'], subregion: 'Iberia' },
  { country: 'IL', region: ['EMEA', 'GLOBAL'], subregion: 'Israel' },
  { country: 'AE', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'EG', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'KE', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'KW', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'NG', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'OM', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'QA', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'SA', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'TR', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'ZA', region: ['EMEA', 'GLOBAL'], subregion: 'MEA' },
  { country: 'DK', region: ['EMEA', 'GLOBAL'], subregion: 'Nordics' },
  { country: 'FI', region: ['EMEA', 'GLOBAL'], subregion: 'Nordics' },
  { country: 'NO', region: ['EMEA', 'GLOBAL'], subregion: 'Nordics' },
  { country: 'SE', region: ['EMEA', 'GLOBAL'], subregion: 'Nordics' },
  { country: 'GB', region: ['EMEA', 'GLOBAL'], subregion: 'UK/IE' },
  { country: 'IE', region: ['EMEA', 'GLOBAL'], subregion: 'UK/IE' },

  // JAPAC - AuNZ
  { country: 'AS', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'AU', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'CX', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'CC', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'CK', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'FJ', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'PF', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'TF', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'GU', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'HM', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'KI', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'NR', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'NC', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'NZ', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'NU', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'NF', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'MP', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'PN', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'WS', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'SB', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'TK', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'TO', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'TV', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },
  { country: 'VU', region: ['JAPAC', 'GLOBAL'], subregion: 'AuNZ' },

  // JAPAC - Greater China
  { country: 'CN', region: ['JAPAC', 'GLOBAL'], subregion: 'Greater China' },
  { country: 'HK', region: ['JAPAC', 'GLOBAL'], subregion: 'Greater China' },
  { country: 'MO', region: ['JAPAC', 'GLOBAL'], subregion: 'Greater China' },
  { country: 'MN', region: ['JAPAC', 'GLOBAL'], subregion: 'Greater China' },
  { country: 'TW', region: ['JAPAC', 'GLOBAL'], subregion: 'Greater China' },

  // JAPAC - India
  { country: 'IN', region: ['JAPAC', 'GLOBAL'], subregion: 'India' },
  { country: 'MH', region: ['JAPAC', 'GLOBAL'], subregion: 'India' },
  { country: 'PK', region: ['JAPAC', 'GLOBAL'], subregion: 'India' },
  { country: 'LK', region: ['JAPAC', 'GLOBAL'], subregion: 'India' },

  // JAPAC - Japan
  { country: 'JP', region: ['JAPAC', 'GLOBAL'], subregion: 'Japan' },

  // JAPAC - Korea
  { country: 'KP', region: ['JAPAC', 'GLOBAL'], subregion: 'Korea' },
  { country: 'KR', region: ['JAPAC', 'GLOBAL'], subregion: 'Korea' },

  // JAPAC - SEA
  { country: 'BD', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'BT', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'BN', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'KH', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'ID', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'LA', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'MY', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'MV', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'FM', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'MM', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'NP', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'PW', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'PG', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'PH', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'SG', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'TH', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'TL', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },
  { country: 'VN', region: ['JAPAC', 'GLOBAL'], subregion: 'SEA' },

  // LATAM - Brazil
  { country: 'BR', region: ['LATAM', 'GLOBAL'], subregion: 'Brazil' },

  // LATAM - MCO
  { country: 'AR', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'AI', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'AG', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'AW', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'BS', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'BB', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'BZ', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'BM', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'BO', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'BQ', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'KY', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'CR', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'CW', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'DM', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'DO', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'EC', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'SV', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'GD', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'GP', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'GT', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'GY', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'HT', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'HN', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'JM', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'MQ', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'NI', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'PA', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'KN', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'LC', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'MF', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'PM', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'VC', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'SR', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'TT', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'TC', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'VE', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'VG', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'VI', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'CU', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'FK', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'GF', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'MS', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'SX', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'GS', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'UM', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'PE', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'PY', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'UY', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'CL', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  { country: 'CO', region: ['LATAM', 'GLOBAL'], subregion: 'MCO' },
  // LATAM - Mexico
  { country: 'MX', region: ['LATAM', 'GLOBAL'], subregion: 'Mexico' },
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
    region: 'GLOBAL',
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
  { label: 'Commercial', checked: false },
  { label: 'Public Sector', checked: false, isPublic: true },
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