import { sessionExpiresInSeconds } from '@/src/constants';
import { Session } from '@/types/session';

import { pool, sql } from './index';


export const insertSession = (session: Session) => {
  return pool.query(sql.typeAlias('void')`
    INSERT INTO session (id, secret_hash, created_at) 
    VALUES (${session.id}, ${session.secretHash}, ${session.createdAt})
  `);
};

export const getSession = async (sessionId: string) => {
  const now = new Date();

  const session = await pool.one(sql.type(Session)`
    SELECT * FROM session WHERE id = ${sessionId}
  `);

  if (now.getTime() - (session.createdAt * 1000) >= sessionExpiresInSeconds * 1000) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
};

export const deleteSession = (sessionId: string) => {
  return pool.query(sql.typeAlias('void')`
    DELETE FROM session WHERE id = ${sessionId}
  `);
};
