/**
 * UserAction holds every permitted action that a user is allowed to perform on a given `Resource`
 */
export enum UserAction {
  All = 'all',
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

/**
 * User roles as defined by Copilot
 */
export enum UserRole {
  Client = 'client',
  IU = 'internalUser',
}
