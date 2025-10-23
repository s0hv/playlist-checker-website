import { json } from '@tanstack/react-start';

export const throwBadRequestError = (body: unknown): never => {
  throw json(body, { status: 400 });
};
