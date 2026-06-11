export interface User {
  id: string;
  name: string;
  email?: string;
  teamId: string;
  isActive: boolean;
  isAuditor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  isAdmin?: boolean;
}

export type CreateUserParams = {
  userId: string;
  teamId: string;
  botToken: string;
};
