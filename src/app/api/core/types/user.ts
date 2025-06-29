/**
 * Enum of all permitted actions a user can perform on a given Resource.
 */
export enum UserAction {
  All = 'all',
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

/**
 * Enum of user roles as defined by Copilot.
 */
export enum UserRole {
  Client = 'client',
  IU = 'internalUser',
}
