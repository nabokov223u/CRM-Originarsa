import { CreateOrganizationData, ListOrganizationsData, UpdateContactData, UpdateContactVariables, GetUserInteractionsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateOrganization(options?: useDataConnectMutationOptions<CreateOrganizationData, FirebaseError, void>): UseDataConnectMutationResult<CreateOrganizationData, undefined>;
export function useCreateOrganization(dc: DataConnect, options?: useDataConnectMutationOptions<CreateOrganizationData, FirebaseError, void>): UseDataConnectMutationResult<CreateOrganizationData, undefined>;

export function useListOrganizations(options?: useDataConnectQueryOptions<ListOrganizationsData>): UseDataConnectQueryResult<ListOrganizationsData, undefined>;
export function useListOrganizations(dc: DataConnect, options?: useDataConnectQueryOptions<ListOrganizationsData>): UseDataConnectQueryResult<ListOrganizationsData, undefined>;

export function useUpdateContact(options?: useDataConnectMutationOptions<UpdateContactData, FirebaseError, UpdateContactVariables>): UseDataConnectMutationResult<UpdateContactData, UpdateContactVariables>;
export function useUpdateContact(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateContactData, FirebaseError, UpdateContactVariables>): UseDataConnectMutationResult<UpdateContactData, UpdateContactVariables>;

export function useGetUserInteractions(options?: useDataConnectQueryOptions<GetUserInteractionsData>): UseDataConnectQueryResult<GetUserInteractionsData, undefined>;
export function useGetUserInteractions(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserInteractionsData>): UseDataConnectQueryResult<GetUserInteractionsData, undefined>;
