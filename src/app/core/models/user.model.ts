export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  initials: string;
  role?: 'owner' | 'admin' | 'member' | 'guest';
  online?: boolean;
}

export const CURRENT_USER: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex@company.com',
  color: '#7B68EE',
  initials: 'AJ',
  role: 'owner',
  online: true,
};
