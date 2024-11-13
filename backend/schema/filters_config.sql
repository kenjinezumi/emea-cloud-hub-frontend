CREATE TABLE `google.com:cloudhub.data.filters_config` (
  `id` STRING NOT NULL,
  `ldap` STRING NOT NULL,
  `filterName` STRING NOT NULL,  -- New column for the filter name
  `config` ARRAY<STRUCT<
    `regions` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>
    `subRegions` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `countries` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `gep` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `accountSectors` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `accountSegments` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `buyerSegmentRollup` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `productFamily` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `industry` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `partnerEvent` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>,
    `draftStatus` ARRAY<STRUCT<`label` STRING, `checked` BOOL>>
  >>
);