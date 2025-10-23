import { json } from '@tanstack/react-start';

export const throwForbiddenError = (): never => {
  throw json({ error: 'Forbidden' }, { status: 403 });
};
