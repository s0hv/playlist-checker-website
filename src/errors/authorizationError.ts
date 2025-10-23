import { json } from '@tanstack/react-start';

export const throwAuthorizationError = (): never => {
  throw json({ error: 'Unauthorized' }, { status: 401 });
};
