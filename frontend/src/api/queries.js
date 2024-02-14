// queries.js
module.exports = {
  fetchMarketingProgramInstanceId: "SELECT DISTINCT Sandbox_Program_Id FROM `google.com:cloudhub.data.marketing-program-dim`;",
  fetchOrganisedBy: "SELECT DISTINCT title, user_id FROM `google.com:cloudhub.data.account-team`;"
};
