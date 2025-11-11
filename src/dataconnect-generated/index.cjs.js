const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'crmoriginarsa',
  location: 'southamerica-west1'
};
exports.connectorConfig = connectorConfig;

const createOrganizationRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganization');
}
createOrganizationRef.operationName = 'CreateOrganization';
exports.createOrganizationRef = createOrganizationRef;

exports.createOrganization = function createOrganization(dc) {
  return executeMutation(createOrganizationRef(dc));
};

const listOrganizationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOrganizations');
}
listOrganizationsRef.operationName = 'ListOrganizations';
exports.listOrganizationsRef = listOrganizationsRef;

exports.listOrganizations = function listOrganizations(dc) {
  return executeQuery(listOrganizationsRef(dc));
};

const updateContactRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateContact', inputVars);
}
updateContactRef.operationName = 'UpdateContact';
exports.updateContactRef = updateContactRef;

exports.updateContact = function updateContact(dcOrVars, vars) {
  return executeMutation(updateContactRef(dcOrVars, vars));
};

const getUserInteractionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserInteractions');
}
getUserInteractionsRef.operationName = 'GetUserInteractions';
exports.getUserInteractionsRef = getUserInteractionsRef;

exports.getUserInteractions = function getUserInteractions(dc) {
  return executeQuery(getUserInteractionsRef(dc));
};
