export interface NavItem {
  label: string;
  path: string;
}

/** Top-level views, in header order. */
export const navItems: NavItem[] = [
  { label: 'The room', path: '/' },
  { label: 'History', path: '/history' },
  { label: 'Shared rooms', path: '/rooms' },
];
