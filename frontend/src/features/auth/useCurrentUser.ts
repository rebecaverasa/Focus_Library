import { placeholderUser, type CurrentUser } from './placeholderUser';

/** Signed-in user. Returns a placeholder until FE-2 wires the auth context. */
export function useCurrentUser(): CurrentUser {
  return placeholderUser;
}
