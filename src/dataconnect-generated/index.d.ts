import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Contact_Key {
  id: UUIDString;
  __typename?: 'Contact_Key';
}

export interface CreateOrganizationData {
  organization_insert: Organization_Key;
}

export interface Deal_Key {
  id: UUIDString;
  __typename?: 'Deal_Key';
}

export interface GetUserInteractionsData {
  interactions: ({
    id: UUIDString;
    subject?: string | null;
    notes?: string | null;
    timestamp: TimestampString;
    type: string;
  } & Interaction_Key)[];
}

export interface Interaction_Key {
  id: UUIDString;
  __typename?: 'Interaction_Key';
}

export interface ListOrganizationsData {
  organizations: ({
    id: UUIDString;
    name: string;
    createdAt: TimestampString;
  } & Organization_Key)[];
}

export interface Organization_Key {
  id: UUIDString;
  __typename?: 'Organization_Key';
}

export interface UpdateContactData {
  contact_update?: Contact_Key | null;
}

export interface UpdateContactVariables {
  id: UUIDString;
  firstName?: string | null;
  lastName?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateOrganizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateOrganizationData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateOrganizationData, undefined>;
  operationName: string;
}
export const createOrganizationRef: CreateOrganizationRef;

export function createOrganization(): MutationPromise<CreateOrganizationData, undefined>;
export function createOrganization(dc: DataConnect): MutationPromise<CreateOrganizationData, undefined>;

interface ListOrganizationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrganizationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListOrganizationsData, undefined>;
  operationName: string;
}
export const listOrganizationsRef: ListOrganizationsRef;

export function listOrganizations(): QueryPromise<ListOrganizationsData, undefined>;
export function listOrganizations(dc: DataConnect): QueryPromise<ListOrganizationsData, undefined>;

interface UpdateContactRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateContactVariables): MutationRef<UpdateContactData, UpdateContactVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateContactVariables): MutationRef<UpdateContactData, UpdateContactVariables>;
  operationName: string;
}
export const updateContactRef: UpdateContactRef;

export function updateContact(vars: UpdateContactVariables): MutationPromise<UpdateContactData, UpdateContactVariables>;
export function updateContact(dc: DataConnect, vars: UpdateContactVariables): MutationPromise<UpdateContactData, UpdateContactVariables>;

interface GetUserInteractionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserInteractionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserInteractionsData, undefined>;
  operationName: string;
}
export const getUserInteractionsRef: GetUserInteractionsRef;

export function getUserInteractions(): QueryPromise<GetUserInteractionsData, undefined>;
export function getUserInteractions(dc: DataConnect): QueryPromise<GetUserInteractionsData, undefined>;

