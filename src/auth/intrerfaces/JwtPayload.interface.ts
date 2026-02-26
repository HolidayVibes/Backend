import { UserRole } from '@prisma/client';

export interface JWTPayload {
  id: string;
  isEmailVerified: boolean;
  role: UserRole;
}
