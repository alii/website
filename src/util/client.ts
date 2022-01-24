import createAPIClient from 'nextkit/client';

import type Form from '../pages/api/form';

export const client = createAPIClient('/api');

export const form = client.define<typeof Form>('/form');
