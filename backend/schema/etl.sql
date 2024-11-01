MERGE `google.com:cloudhub.data.master-event-data` T
USING (
  WITH EventData AS (
    SELECT
      GENERATE_UUID() AS eventId,
      'launchpoint' AS source,
      COALESCE(L.tactic_id, '') AS tacticId,
      COALESCE(L.tactic_title, '') AS title,
      COALESCE(L.tactic_detail, '') AS description,
      '' AS emoji,
      ARRAY<STRING>[COALESCE(L.owner, '')] AS organisedBy,
      IFNULL(CAST(L.event_start_date AS STRING), '') AS startDate,
      IFNULL(CAST(L.event_end_date AS STRING), '') AS endDate,
      COALESCE(L.tactic_id, '') AS marketingProgramInstanceId,
      COALESCE(L.event_format, '') AS eventType,
      COALESCE(D.region, '') AS region,


      -- Aggregate distinct country values into an array
            ARRAY_AGG(DISTINCT COALESCE(CASE
        WHEN GCC.country_geography_country_code IN ('AT', 'CH') THEN 'Alps'
        WHEN GCC.country_geography_country_code IN ('BE', 'LU', 'NL') THEN 'Benelux'
        WHEN GCC.country_geography_country_code IN ('BG', 'CY', 'CZ', 'EE', 'GR', 'HU', 'LT', 'LV', 'PL', 'RO', 'RU', 'SK', 'UA') THEN 'CEE'
        WHEN GCC.country_geography_country_code = 'FR' THEN 'France'
        WHEN GCC.country_geography_country_code = 'DE' THEN 'Germany'
        WHEN GCC.country_geography_country_code = 'IT' THEN 'Italy'
        WHEN GCC.country_geography_country_code IN ('ES', 'PT') THEN 'Iberia'
        WHEN GCC.country_geography_country_code = 'IL' THEN 'Israel'
        WHEN GCC.country_geography_country_code IN ('AE', 'EG', 'KE', 'KW', 'NG', 'OM', 'QA', 'SA', 'TR', 'ZA') THEN 'MEA'
        WHEN GCC.country_geography_country_code IN ('DK', 'FI', 'NO', 'SE') THEN 'Nordics'
        WHEN GCC.country_geography_country_code IN ('GB', 'IE') THEN 'UK/IE'
        ELSE ''
      END, '')) AS subRegion,

      ARRAY_AGG(DISTINCT COALESCE(GCC.country_geography_country_code, '')) AS country,

     
      ARRAY<STRING>[COALESCE(L.owner, '')] AS activityOwner,
      ARRAY<STRING>[] AS speakers,
      FALSE AS isEventSeries,
      ARRAY<STRUCT<platform STRING, language STRING, template STRING, subjectLine STRING>>[] AS languagesAndTemplates,

      -- Subquery to avoid using DISTINCT on STRUCT
      (SELECT ARRAY_AGG(STRUCT(okr_pillar, '100'))
       FROM (
         SELECT DISTINCT okr_pillar
         FROM `cloud-marketing-mrm.Anaplan.tactic_okr` O
         WHERE O.tactic_id = L.tactic_id
       )) AS okr,

      -- Aggregating distinct campaign_name values from GEPE table
      ARRAY_AGG(DISTINCT COALESCE(GEPE.campaign_name, '')) AS gep,

      ARRAY_AGG(DISTINCT COALESCE(BUY.target_buyer_segment, '')) AS audienceSeniority,

      ARRAY<STRING>[] AS audiencePersona,
      STRUCT(
        FALSE AS commercial,
        FALSE AS public
      ) AS accountSectors,

      STRUCT(
        STRUCT(
          CAST(REGEXP_EXTRACT(L.account_segment, r'Corporate: (\d+)%') IS NOT NULL AS BOOL) AS selected,
          CAST(REGEXP_EXTRACT(L.account_segment, r'Corporate: (\d+)%') AS STRING) AS percentage
        ) AS Corporate,
        STRUCT(
          CAST(REGEXP_EXTRACT(L.account_segment, r'SMB: (\d+)%') IS NOT NULL AS BOOL) AS selected,
          CAST(REGEXP_EXTRACT(L.account_segment, r'SMB: (\d+)%') AS STRING) AS percentage
        ) AS SMB,
        STRUCT(
          CAST(REGEXP_EXTRACT(L.account_segment, r'Select: (\d+)%') IS NOT NULL AS BOOL) AS selected,
          CAST(REGEXP_EXTRACT(L.account_segment, r'Select: (\d+)%') AS STRING) AS percentage
        ) AS `Select`,
        STRUCT(
          CAST(REGEXP_EXTRACT(L.account_segment, r'Enterprise: (\d+)%') IS NOT NULL AS BOOL) AS selected,
          CAST(REGEXP_EXTRACT(L.account_segment, r'Enterprise: (\d+)%') AS STRING) AS percentage
        ) AS Enterprise,
        STRUCT(
          CAST(REGEXP_EXTRACT(L.account_segment, r'Startups: (\d+)%') IS NOT NULL AS BOOL) AS selected,
          CAST(REGEXP_EXTRACT(L.account_segment, r'Startups: (\d+)%') AS STRING) AS percentage
        ) AS Startups
      ) AS accountSegments,

      COALESCE(CAST(ATT.expected_registrations AS STRING), '') AS maxEventCapacity,
      '' AS peopleMeetingCriteria,
      ARRAY<STRING>[COALESCE(ATT.registration_link, '')] AS landingPageLinks,
      ARRAY<STRING>[COALESCE(ATT.sales_kit_link, '')] AS salesKitLinks,
      ARRAY<STRING>[] AS hailoLinks,
      ARRAY<STRING>[] AS otherDocumentsLinks,

      COALESCE(L.is_partner_involved, 0) = 1 AS isApprovedForCustomerUse,
      TRUE AS isDraft,
      FALSE AS isPublished,
      FALSE AS isHighPriority,
      COALESCE(L.is_partner_involved, 0) = 1 AS isPartneredEvent,
      COALESCE(ATT.partner_responsibility, '') AS partnerRole,

      STRUCT(
        STRUCT(
          CAST(REGEXP_EXTRACT(L.company_type, r'Digital Natives: (\d+)%') IS NOT NULL AS BOOL) AS selected,
         COALESCE(CAST(REGEXP_EXTRACT(L.company_type, r'Digital Natives: (\d+)%') AS STRING), '') AS percentage
        ) AS `Digital Native`,
        STRUCT(

          CAST(REGEXP_EXTRACT(L.company_type, r'Traditional: (\d+)%') IS NOT NULL AS BOOL) AS selected,
          COALESCE(CAST(REGEXP_EXTRACT(L.company_type, r'Traditional: (\d+)%') AS STRING), '') AS percentage
        ) AS `Traditional`
      ) AS accountCategory,

      STRUCT(
        STRUCT(COALESCE(L.is_product_gcp, 0) = 1 AS selected, COALESCE(CAST(L.is_product_gcp * 100 AS STRING), '') AS percentage) AS GCP,
        STRUCT(COALESCE(L.is_product_gws, 0) = 1 AS selected, COALESCE(CAST(L.is_product_gws * 100 AS STRING), '') AS percentage) AS GWS
      ) AS productAlignment,

      -- Use a subquery to ensure AI vs Core is a single value, choosing AI if both exist
      (SELECT 
        CASE 
          WHEN ARRAY_LENGTH(ARRAY_AGG(DISTINCT AI2.core_messaging)) > 1 AND 'AI' IN UNNEST(ARRAY_AGG(DISTINCT AI2.core_messaging)) THEN 'AI'
          ELSE ARRAY_AGG(DISTINCT AI2.core_messaging)[SAFE_OFFSET(0)]
        END 
       FROM `cloud-marketing-mrm.Anaplan.tactic_ai_or_core` AS AI2 
       WHERE AI2.tactic_id = L.tactic_id) AS aiVsCore,

      ARRAY<STRING>[COALESCE(L.industry, '')] AS industry,
      COALESCE(D.city, '') AS city,
      '' AS locationVenue,
      '' AS marketingActivityType,
      'Europe/London' AS userTimezone
    FROM
      `cloud-marketing-mrm.Anaplan.vActivation_Launchpoint` AS L
    LEFT JOIN
      `cloud-marketing-mrm.Anaplan.vGCMA_Location_Details` AS D
      ON L.tactic_id = D.tactic_id
    LEFT JOIN
      `cloud-marketing-mrm.Anaplan.tactic_okr` AS O
      ON L.tactic_id = O.tactic_id
    LEFT JOIN `cloud-marketing-mrm.Anaplan.tactic_buyer_segment_rollup` AS BUY
      ON L.tactic_id = BUY.tactic_id
    LEFT JOIN `cloud-marketing-mrm.Anaplan.tactic_program_alignment` AS GEPE
      ON L.tactic_id = GEPE.tactic_id
    LEFT JOIN `cloud-marketing-mrm.Anaplan.tactic_attributes` AS ATT
      ON L.tactic_id = ATT.tactic_id
    LEFT JOIN `cloud-marketing-mrm.Anaplan.dim_geography_country_code` AS GCC
      ON D.country = GCC.country_geography_country_name
    WHERE
      L.is_event = 1.0
      AND L.event_start_date IS NOT NULL
      AND L.event_end_date IS NOT NULL
      AND D.region IN ('EMEA', 'GLOBAL')
      AND PARSE_DATE('%Y-%m-%d', CAST(L.event_start_date AS STRING)) >= '2024-10-01'
  GROUP BY
    L.tactic_id, L.tactic_title, L.tactic_detail, L.owner, L.event_start_date,
    L.event_end_date, L.event_format, D.region,
    L.account_segment, L.is_partner_involved, L.partner_involved, L.company_type,
    L.is_product_gcp, L.is_product_gws, L.industry, D.city, ATT.partner_responsibility,
    ATT.registration_link, ATT.sales_kit_link, ATT.expected_registrations

  )
  SELECT DISTINCT
    *
  FROM EventData
) AS NewData
ON T.tacticId = NewData.tacticId
WHEN MATCHED AND T.dateUpdatedCloudHub IS NULL AND T.source = 'launchpoint' THEN
UPDATE SET
  T.eventId = NewData.eventId,
  T.tacticId = NewData.tacticId,
  T.title = NewData.title,
  T.description = NewData.description,
  T.emoji = NewData.emoji,
  T.organisedBy = NewData.organisedBy,
  T.startDate = NewData.startDate,
  T.endDate = NewData.endDate,
  T.marketingProgramInstanceId = NewData.marketingProgramInstanceId,
  T.eventType = NewData.eventType,
  T.region = NewData.region,
  T.subRegion = NewData.subRegion,
  T.country = NewData.country,
  T.activityOwner = NewData.activityOwner,
  T.speakers = NewData.speakers,
  T.isEventSeries = NewData.isEventSeries,
  T.languagesAndTemplates = NewData.languagesAndTemplates,
  T.okr = NewData.okr,
  T.gep = NewData.gep,
  T.audienceSeniority = NewData.audienceSeniority,
  T.audiencePersona = NewData.audiencePersona,
  T.accountSectors = NewData.accountSectors,
  T.accountSegments = NewData.accountSegments,
  T.maxEventCapacity = NewData.maxEventCapacity,
  T.peopleMeetingCriteria = NewData.peopleMeetingCriteria,
  T.landingPageLinks = NewData.landingPageLinks,
  T.salesKitLinks = NewData.salesKitLinks,
  T.hailoLinks = NewData.hailoLinks,
  T.otherDocumentsLinks = NewData.otherDocumentsLinks,
  T.isApprovedForCustomerUse = NewData.isApprovedForCustomerUse,
  T.isDraft = NewData.isDraft,
  T.isPublished = NewData.isPublished,
  T.isHighPriority = NewData.isHighPriority,
  T.isPartneredEvent = NewData.isPartneredEvent,
  T.partnerRole = NewData.partnerRole,
  T.accountCategory = NewData.accountCategory,
  T.productAlignment = NewData.productAlignment,
  T.aiVsCore = NewData.aiVsCore,
  T.industry = NewData.industry,
  T.city = NewData.city,
  T.locationVenue = NewData.locationVenue,
  T.marketingActivityType = NewData.marketingActivityType,
  T.userTimezone = NewData.userTimezone,
  T.dateUpdatedCloudHub = NULL,
  T.isDeleted = FALSE

WHEN NOT MATCHED THEN
INSERT (
  eventId, tacticId, title, description, emoji, organisedBy, startDate, endDate,
  marketingProgramInstanceId, eventType, region, subRegion, country, activityOwner,
  speakers, isEventSeries, languagesAndTemplates, okr, gep, audienceSeniority, audiencePersona,
  accountSectors, accountSegments, maxEventCapacity, peopleMeetingCriteria, landingPageLinks,
  salesKitLinks, hailoLinks, otherDocumentsLinks, isApprovedForCustomerUse, isDraft, isPublished,
  isHighPriority, isPartneredEvent, partnerRole, accountCategory, productAlignment, aiVsCore,
  industry, city, locationVenue, marketingActivityType, userTimezone, dateUpdatedCloudHub, isDeleted, source
)
VALUES (
  NewData.eventId, NewData.tacticId, NewData.title, NewData.description, NewData.emoji, NewData.organisedBy,
  NewData.startDate, NewData.endDate, NewData.marketingProgramInstanceId, NewData.eventType, NewData.region,
  NewData.subRegion, NewData.country, NewData.activityOwner, NewData.speakers, NewData.isEventSeries,
  NewData.languagesAndTemplates, NewData.okr, NewData.gep, NewData.audienceSeniority, NewData.audiencePersona,
  NewData.accountSectors, NewData.accountSegments, NewData.maxEventCapacity, NewData.peopleMeetingCriteria,
  NewData.landingPageLinks, NewData.salesKitLinks, NewData.hailoLinks, NewData.otherDocumentsLinks,
  NewData.isApprovedForCustomerUse, NewData.isDraft, NewData.isPublished, NewData.isHighPriority,
  NewData.isPartneredEvent, NewData.partnerRole, NewData.accountCategory, NewData.productAlignment, NewData.aiVsCore,
  NewData.industry, NewData.city, NewData.locationVenue, NewData.marketingActivityType, NewData.userTimezone,
  NULL, FALSE, 'launchpoint'
);