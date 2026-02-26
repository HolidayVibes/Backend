export interface RequestWithUser extends Request {
  user: { id: string; isEmailVerified: boolean };
}
