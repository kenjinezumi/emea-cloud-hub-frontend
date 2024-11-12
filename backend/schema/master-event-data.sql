CREATE TABLE `google.com:cloudhub.data.master-event-data` (
  `eventId` STRING NOT NULL,
  `tacticId` STRING,
  `title` STRING,
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
  `speakers` ARRAY<STRING>,
  `isEventSeries` BOOL,
  `languagesAndTemplates` ARRAY<STRUCT<
    `platform` STRING,
    `language` STRING,
    `template` STRING,
    `subjectLine` STRING
  >>,
  `okr` ARRAY<STRUCT<
    `type` STRING,
    `percentage` STRING
  >>,
  `gep` ARRAY<STRING>,
  `audiencePersona` ARRAY<STRING>,
  `audienceSeniority` ARRAY<STRING>,
  `accountSectors` STRUCT<
    `commercial` BOOL,
    `public` BOOL
  >,
  `accountSegments` STRUCT<
    `Corporate` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `SMB` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `Select` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `Enterprise` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `Startup` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >
  >,
  `maxEventCapacity` STRING,
  `peopleMeetingCriteria` STRING,
  `landingPageLinks` ARRAY<STRING>,
  `salesKitLinks` ARRAY<STRING>,
  `hailoLinks` ARRAY<STRING>,
  `otherDocumentsLinks` ARRAY<STRING>,
  `isApprovedForCustomerUse` BOOL,
  `isDraft` BOOL,
  `isPublished` BOOL,
  `isHighPriority` BOOL,
  `isPartneredEvent` BOOL,
  `partnerRole` STRING,
  `accountCategory` STRUCT<
    `Digital Native` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `Traditional` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >
  >,
  `accountType` STRUCT<
    `Greenfield` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `Existing Customer` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >
  >,
  `productAlignment` STRUCT<
    `GCP` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >,
    `GWS` STRUCT<
      `selected` BOOL,
      `percentage` STRING
    >
  >,
  `aiVsCore` STRING,
  `industry` ARRAY<STRING>,
  `city` STRING,
  `locationVenue` STRING,
  `marketingActivityType` STRING,
  `userTimezone` STRING
  `dateUpdatedCloudHub` STRING
  `isDeleted` BOOL
  `source` STRING
  `programName` STRING

);
