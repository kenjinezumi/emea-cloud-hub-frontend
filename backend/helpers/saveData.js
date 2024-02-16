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
      console.log(`Event ID ${eventId} found. Updating record.`);
      await updateBigQuery(formData, datasetId, tableId);
    } else {
      // Insert new record
      console.log(`Event ID ${eventId} not found. Inserting new record.`);
      await bigquery.dataset(datasetId).table(tableId).insert([preparedData]);
    }

    console.log('Operation successful');
  } catch (error) {
    console.error('ERROR in insertOrUpdateBigQuery:', error);
    throw error;
  }
}

async function updateBigQuery(formData, datasetId, tableId) {
  // Construct the update query based on formData
  // This is an example and should be adapted based on your actual data structure and needs
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
        eventSeries = @eventSeries,
        emailLanguage = @emailLanguage,
        emailText = @emailText,
        languagesAndTemplates = @languagesAndTemplates,
        customerUse = @customerUse,
        okr = @okr,
        gep = @gep,
        activityType = @activityType,
        audiencePersona = @audiencePersona,
        audienceSeniority = @audienceSeniority,
        accountSectors = @accountSectors,
        accountSegments = @accountSegments,
        maxEventCapacity = @maxEventCapacity,
        peopleMeetingCriteria = @peopleMeetingCriteria,
        landingPageLink = @landingPageLink,
        salesKitLink = @salesKitLink,
        hailoLink = @hailoLink,
        publishedDate = @publishedDate,
        lastEditedDate = @lastEditedDate
    WHERE eventId = @eventId
  `;

  const options = {
    query: updateQuery,
    params: {
      // Add all formData properties here
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
      eventSeries: formData.eventSeries,
      emailLanguage: formData.emailLanguage,
      emailText: formData.emailText,
      languagesAndTemplates: JSON.stringify(formData.languagesAndTemplates),
      customerUse: formData.customerUse,
      okr: formData.okr,
      gep: formData.gep,
      activityType: formData.activityType,
      audiencePersona: formData.audiencePersona,
      audienceSeniority: formData.audienceSeniority,
      accountSectors: formData.accountSectors,
      accountSegments: JSON.stringify(formData.accountSegments),
      maxEventCapacity: formData.maxEventCapacity,
      peopleMeetingCriteria: formData.peopleMeetingCriteria,
      landingPageLink: formData.landingPageLink,
      salesKitLink: formData.salesKitLink,
      hailoLink: formData.hailoLink,
      publishedDate: formData.publishedDate ? new Date(formData.publishedDate).toISOString() : null,
      lastEditedDate: formData.lastEditedDate ? new Date(formData.lastEditedDate).toISOString() : null,
    },
    location: 'US',
  };

  await bigquery.query(options);
}

module.exports = { insertOrUpdateBigQuery };
