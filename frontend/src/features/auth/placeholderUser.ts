/**
 * Stand-in user until auth lands (BE-7 / FE-2). Swap `useCurrentUser` for the
 * real auth context then — the header only depends on this shape.
 */
export interface CurrentUser {
  name: string;
  initials: string;
}

export const placeholderUser: CurrentUser = {
  name: 'Marina',
  initials: 'MB',
};
