import { z } from 'zod';

export const Session = z.object({
  id: z.string(),
  secretHash: z.string(),
  createdAt: z.number(),
});
export type Session = z.infer<typeof Session>;

export type SessionWithToken = Omit<Session, 'createdAt'> & {
  createdAt: Date
  token: string
};
