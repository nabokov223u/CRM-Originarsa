# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListOrganizations*](#listorganizations)
  - [*GetUserInteractions*](#getuserinteractions)
- [**Mutations**](#mutations)
  - [*CreateOrganization*](#createorganization)
  - [*UpdateContact*](#updatecontact)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListOrganizations
You can execute the `ListOrganizations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listOrganizations(): QueryPromise<ListOrganizationsData, undefined>;

interface ListOrganizationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrganizationsData, undefined>;
}
export const listOrganizationsRef: ListOrganizationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrganizations(dc: DataConnect): QueryPromise<ListOrganizationsData, undefined>;

interface ListOrganizationsRef {
  ...
  (dc: DataConnect): QueryRef<ListOrganizationsData, undefined>;
}
export const listOrganizationsRef: ListOrganizationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrganizationsRef:
```typescript
const name = listOrganizationsRef.operationName;
console.log(name);
```

### Variables
The `ListOrganizations` query has no variables.
### Return Type
Recall that executing the `ListOrganizations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrganizationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListOrganizationsData {
  organizations: ({
    id: UUIDString;
    name: string;
    createdAt: TimestampString;
  } & Organization_Key)[];
}
```
### Using `ListOrganizations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrganizations } from '@dataconnect/generated';


// Call the `listOrganizations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrganizations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrganizations(dataConnect);

console.log(data.organizations);

// Or, you can use the `Promise` API.
listOrganizations().then((response) => {
  const data = response.data;
  console.log(data.organizations);
});
```

### Using `ListOrganizations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrganizationsRef } from '@dataconnect/generated';


// Call the `listOrganizationsRef()` function to get a reference to the query.
const ref = listOrganizationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrganizationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.organizations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.organizations);
});
```

## GetUserInteractions
You can execute the `GetUserInteractions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserInteractions(): QueryPromise<GetUserInteractionsData, undefined>;

interface GetUserInteractionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserInteractionsData, undefined>;
}
export const getUserInteractionsRef: GetUserInteractionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserInteractions(dc: DataConnect): QueryPromise<GetUserInteractionsData, undefined>;

interface GetUserInteractionsRef {
  ...
  (dc: DataConnect): QueryRef<GetUserInteractionsData, undefined>;
}
export const getUserInteractionsRef: GetUserInteractionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserInteractionsRef:
```typescript
const name = getUserInteractionsRef.operationName;
console.log(name);
```

### Variables
The `GetUserInteractions` query has no variables.
### Return Type
Recall that executing the `GetUserInteractions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserInteractionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserInteractionsData {
  interactions: ({
    id: UUIDString;
    subject?: string | null;
    notes?: string | null;
    timestamp: TimestampString;
    type: string;
  } & Interaction_Key)[];
}
```
### Using `GetUserInteractions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserInteractions } from '@dataconnect/generated';


// Call the `getUserInteractions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserInteractions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserInteractions(dataConnect);

console.log(data.interactions);

// Or, you can use the `Promise` API.
getUserInteractions().then((response) => {
  const data = response.data;
  console.log(data.interactions);
});
```

### Using `GetUserInteractions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserInteractionsRef } from '@dataconnect/generated';


// Call the `getUserInteractionsRef()` function to get a reference to the query.
const ref = getUserInteractionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserInteractionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.interactions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.interactions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateOrganization
You can execute the `CreateOrganization` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createOrganization(): MutationPromise<CreateOrganizationData, undefined>;

interface CreateOrganizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateOrganizationData, undefined>;
}
export const createOrganizationRef: CreateOrganizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrganization(dc: DataConnect): MutationPromise<CreateOrganizationData, undefined>;

interface CreateOrganizationRef {
  ...
  (dc: DataConnect): MutationRef<CreateOrganizationData, undefined>;
}
export const createOrganizationRef: CreateOrganizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrganizationRef:
```typescript
const name = createOrganizationRef.operationName;
console.log(name);
```

### Variables
The `CreateOrganization` mutation has no variables.
### Return Type
Recall that executing the `CreateOrganization` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrganizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrganizationData {
  organization_insert: Organization_Key;
}
```
### Using `CreateOrganization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrganization } from '@dataconnect/generated';


// Call the `createOrganization()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrganization();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrganization(dataConnect);

console.log(data.organization_insert);

// Or, you can use the `Promise` API.
createOrganization().then((response) => {
  const data = response.data;
  console.log(data.organization_insert);
});
```

### Using `CreateOrganization`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrganizationRef } from '@dataconnect/generated';


// Call the `createOrganizationRef()` function to get a reference to the mutation.
const ref = createOrganizationRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrganizationRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.organization_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.organization_insert);
});
```

## UpdateContact
You can execute the `UpdateContact` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateContact(vars: UpdateContactVariables): MutationPromise<UpdateContactData, UpdateContactVariables>;

interface UpdateContactRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateContactVariables): MutationRef<UpdateContactData, UpdateContactVariables>;
}
export const updateContactRef: UpdateContactRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateContact(dc: DataConnect, vars: UpdateContactVariables): MutationPromise<UpdateContactData, UpdateContactVariables>;

interface UpdateContactRef {
  ...
  (dc: DataConnect, vars: UpdateContactVariables): MutationRef<UpdateContactData, UpdateContactVariables>;
}
export const updateContactRef: UpdateContactRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateContactRef:
```typescript
const name = updateContactRef.operationName;
console.log(name);
```

### Variables
The `UpdateContact` mutation requires an argument of type `UpdateContactVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateContactVariables {
  id: UUIDString;
  firstName?: string | null;
  lastName?: string | null;
}
```
### Return Type
Recall that executing the `UpdateContact` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateContactData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateContactData {
  contact_update?: Contact_Key | null;
}
```
### Using `UpdateContact`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateContact, UpdateContactVariables } from '@dataconnect/generated';

// The `UpdateContact` mutation requires an argument of type `UpdateContactVariables`:
const updateContactVars: UpdateContactVariables = {
  id: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
};

// Call the `updateContact()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateContact(updateContactVars);
// Variables can be defined inline as well.
const { data } = await updateContact({ id: ..., firstName: ..., lastName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateContact(dataConnect, updateContactVars);

console.log(data.contact_update);

// Or, you can use the `Promise` API.
updateContact(updateContactVars).then((response) => {
  const data = response.data;
  console.log(data.contact_update);
});
```

### Using `UpdateContact`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateContactRef, UpdateContactVariables } from '@dataconnect/generated';

// The `UpdateContact` mutation requires an argument of type `UpdateContactVariables`:
const updateContactVars: UpdateContactVariables = {
  id: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
};

// Call the `updateContactRef()` function to get a reference to the mutation.
const ref = updateContactRef(updateContactVars);
// Variables can be defined inline as well.
const ref = updateContactRef({ id: ..., firstName: ..., lastName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateContactRef(dataConnect, updateContactVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.contact_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.contact_update);
});
```

