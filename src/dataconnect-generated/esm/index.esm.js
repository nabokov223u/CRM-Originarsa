import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'crmoriginarsa',
  location: 'southamerica-west1'
};

export const createOrganizationRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganization');
}
createOrganizationRef.operationName = 'CreateOrganization';

export function createOrganization(dc) {
  return executeMutation(createOrganizationRef(dc));
}

export const listOrganizationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOrganizations');
}
listOrganizationsRef.operationName = 'ListOrganizations';

export function listOrganizations(dc) {
  return executeQuery(listOrganizationsRef(dc));
}

export const updateContactRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateContact', inputVars);
}
updateContactRef.operationName = 'UpdateContact';

export function updateContact(dcOrVars, vars) {
  return executeMutation(updateContactRef(dcOrVars, vars));
}

export const getUserInteractionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserInteractions');
}
getUserInteractionsRef.operationName = 'GetUserInteractions';

export function getUserInteractions(dc) {
  return executeQuery(getUserInteractionsRef(dc));
}

