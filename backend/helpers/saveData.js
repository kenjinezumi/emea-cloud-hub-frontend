const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function insertOrUpdateBigQuery(formData, datasetId, tableId) {
  const preparedData = prepareDataForBigQuery(formData);
  const eventId = preparedData.eventId;

  try {
    const existsQuery = `
      SELECT eventId
      FROM \`${datasetId}.${tableId}\`
      WHERE eventId = @eventId
    `;
    const options = {
      query: existsQuery,
      params: { eventId: eventId },
      location: 'US',
    };

    const [rows] = await bigquery.query(options);

    if (rows.length > 0) {
      // Update existing record
      await updateBigQuery(formData, datasetId, tableId);
    } else {
      // Insert new record
      await bigquery.dataset(datasetId).table(tableId).insert([preparedData]);
    }
  } catch (error) {
    throw error;
  }
}

async function updateBigQuery(formData, datasetId, tableId) {
  const updateQuery = `
    UPDATE \`${datasetId}.${tableId}\`
    SET title = @title,
        description = @description,
        emoji = @emoji,
        organisedBy = @organisedBy,
        startDate = @startDate,
        endDate = @endDate,
        marketingProgramInstanceId = @marketingProgramInstanceId,
        eventType = @eventType,
        region = @region,
        subRegion = @subRegion,
        country = @country,
        activityOwner = @activityOwner,
        speakers = @speakers,
        isEventSeries = @isEventSeries,
        languagesAndTemplates = @languagesAndTemplates,
        isApprovedForCustomerUse = @isApprovedForCustomerUse,
        okr = @okr,
        gep = @gep,
        audiencePersona = @audiencePersona,
        audienceSeniority = @audienceSeniority,
        accountSectors = @accountSectors,
        accountSegments = @accountSegments,
        maxEventCapacity = @maxEventCapacity,
        peopleMeetingCriteria = @peopleMeetingCriteria,
        landingPageLinks = @landingPageLinks,
        salesKitLinks = @salesKitLinks,
        hailoLinks = @hailoLinks,
        isHighPriority = @isHighPriority,
        isPartneredEvent = @isPartneredEvent,
        partnerRole = @partnerRole,
        accountCategory = @accountCategory,
        accountType = @accountType,
        productAlignment = @productAlignment,
        aiVsCore = @aiVsCore,
        industry = @industry,
        city = @city,
        locationVenue = @locationVenue,
        marketingActivityType = @marketingActivityType,
        userTimezone = @userTimezone,
        isDraft = @isDraft,
        isPublished = @isPublished
    WHERE eventId = @eventId
  `;

  const options = {
    query: updateQuery,
    params: {
      eventId: formData.eventId,
      title: formData.title,
      description: formData.description,
      emoji: formData.emoji,
      organisedBy: formData.organisedBy,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      marketingProgramInstanceId: formData.marketingProgramInstanceId,
      eventType: formData.eventType,
      region: formData.region,
      subRegion: formData.subRegion,
      country: formData.country,
      activityOwner: formData.activityOwner,
      speakers: formData.speakers,
      isEventSeries: formData.isEventSeries === true,
      languagesAndTemplates: JSON.stringify(formData.languagesAndTemplates),
      isApprovedForCustomerUse: formData.isApprovedForCustomerUse === true,
      okr: JSON.stringify(formData.okr),
      gep: formData.gep,
      audiencePersona: formData.audiencePersona,
      audienceSeniority: formData.audienceSeniority,
      accountSectors: JSON.stringify(formData.accountSectors),
      accountSegments: JSON.stringify(formData.accountSegments),
      maxEventCapacity: formData.maxEventCapacity,
      peopleMeetingCriteria: formData.peopleMeetingCriteria,
      landingPageLinks: formData.landingPageLinks,
      salesKitLinks: formData.salesKitLinks,
      hailoLinks: formData.hailoLinks,
      isHighPriority: formData.isHighPriority === true,
      isPartneredEvent: formData.isPartneredEvent === true,
      partnerRole: formData.partnerRole,
      accountCategory: JSON.stringify(formData.accountCategory),
      accountType: JSON.stringify(formData.accountType),
      productAlignment: JSON.stringify(formData.productAlignment),
      aiVsCore: formData.aiVsCore,
      industry: formData.industry,
      city: formData.city,
      locationVenue: formData.locationVenue,
      marketingActivityType: formData.marketingActivityType,
      userTimezone: formData.userTimezone,
      isDraft: formData.isDraft === true,
      isPublished: formData.isPublished === true,
    },
    location: 'US',
  };

  await bigquery.query(options);
}


module.exports = { insertOrUpdateBigQuery };
