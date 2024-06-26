CREATE TABLE `google.com:cloudhub.data.master-event-data` (
  `eventId` STRING NOT NULL,
  `description` STRING,
  `emoji` STRING,
  `organisedBy` ARRAY<STRING>,
  `startDate` STRING,
  `endDate` STRING,
  `marketingProgramInstanceId` STRING,
  `eventType` STRING,
  `region` STRING,
  `subRegion` ARRAY<STRING>,
  `country` ARRAY<STRING>,
  `activityOwner` ARRAY<STRING>,
  `title` STRING,
  `speakers` ARRAY<STRING>,
  `eventSeries` STRING,
  `languagesAndTemplates` ARRAY<STRUCT<
    `language` STRING,
    `template` STRING
  >>,
  `customerUse` STRING,
  `okr` ARRAY<STRING>,
  `gep` ARRAY<STRING>,
  `audiencePersona` ARRAY<STRING>,
  `audienceSeniority` ARRAY<STRING>,
  `accountSectors` STRUCT<
    `commercial` BOOL,
    `public` BOOL
  >,
  `accountSegments` STRUCT<
    `enterprise` BOOL,
    `corporate` BOOL
  >,
  `maxEventCapacity` STRING,
  `peopleMeetingCriteria` STRING,
  `landingPageLinks` ARRAY<STRING>,
  `salesKitLinks` ARRAY<STRING>,
  `hailoLinks` ARRAY<STRING>,
  `otherDocumentsLinks` ARRAY<STRING>,
  `approvedForCustomerUse` BOOL,
  `isDraft` BOOL,
  `isHighPriority` BOOL
);
