import createAPIClient from 'nextkit/client';

import type Form from '../pages/api/form';

export const client = createAPIClient('/api');

export const api = client.from<typeof Form>();
export const sendForm = api.endpoint('/form', 'POST');
