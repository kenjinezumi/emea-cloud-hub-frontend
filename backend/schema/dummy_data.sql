INSERT INTO `google.com:cloudhub.data.master-event-data`
(eventId, tacticId, description, emoji, organisedBy, startDate, endDate, marketingProgramInstanceId, eventType, region, subRegion, country, activityOwner, title, speakers, eventSeries, languagesAndTemplates, customerUse, okr, gep, audiencePersona, audienceSeniority, accountSectors, accountSegments, maxEventCapacity, peopleMeetingCriteria, landingPageLinks, salesKitLinks, hailoLinks, otherDocumentsLinks, approvedForCustomerUse, isDraft, isHighPriority, isPartneredEvent, partnerRole, accountCategory, accountType, productAlignment, aiVsCore, industry, city, locationVenue, marketingActivityType)
VALUES
(
  "event-001", 
  "tactic-001", 
  "This is a test event description.", 
  "🎉", 
  ["Org1", "Org2"], 
  "2024-09-19T10:00:00Z", 
  "2024-09-19T18:00:00Z", 
  "MP-001", 
  "Physical Event", 
  "GLOBAL", 
  ["Benelux", "Germany"], 
  ["BE", "DE"], 
  ["Owner1", "Owner2"], 
  "Sample Event Title", 
  ["speaker1@example.com", "speaker2@example.com"], 
  "no", 
  [STRUCT("Gmail", "English", "Template1"), STRUCT("Salesloft", "French", "Template2")], 
  "yes", 
  [STRUCT("CHAMPION DEI & CULTURE", "50"), STRUCT("SOURCE DEMAND", "50")], 
  ["GCP", "AI"], 
  ["Developer", "Finance"], 
  ["Decision Maker", "Practitioner"], 
  STRUCT(true, false), 
  STRUCT(
    STRUCT(true, "60"), 
    STRUCT(false, "0"), 
    STRUCT(true, "20"), 
    STRUCT(false, "0"), 
    STRUCT(true, "20")
  ), 
  "200", 
  "150", 
  ["http://landingpage1.com"], 
  ["http://saleskitlink1.com"], 
  ["http://hailolink1.com"], 
  ["http://otherdoclink1.com"], 
  true, 
  false, 
  true, 
  true, 
  "Host Event (Webinar, Townhall, Workshop, Demo)", 
  STRUCT(
    STRUCT(true, "100"), 
    STRUCT(false, "0")
  ), 
  STRUCT(
    STRUCT(true, "50"), 
    STRUCT(true, "50")
  ), 
  STRUCT(
    STRUCT(true, "70"), 
    STRUCT(true, "30")
  ), 
  "AI", 
  "Tech", 
  "London", 
  "O2 Arena", 
  "Marketing Activity Type 1"
);
