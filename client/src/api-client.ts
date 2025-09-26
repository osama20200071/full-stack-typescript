import createClient from 'openapi-fetch';
// import createQueryClient from 'openapi-react-query';
import { paths } from './api.types';

// const fetchClient = createClient<paths>({ baseUrl: 'http://localhost:4001' });
// const $api = createQueryClient(fetchClient);

// integration with react query
// const {} = $api.useQuery('get', '/tasks', {
//   params: { query: { completed: true } },
// });
// $api.useQuery('delete', '/tasks/{id}', { params: { path: { id: 22 } } });
// $api.useQuery('post', '/tasks', { body: { title: 'we', description: 'ss' } });

const { GET, POST, DELETE, PUT } = createClient<paths>();

// GET('/tasks', { params: { query: { completed: 'true' } } });
GET('/tasks', { params: { query: { completed: true } } });
POST('/tasks', { body: { title: 'we', description: 'wewe' } });
// GET('/tasks/{id}', { params: { path: { id: "we" } } });
GET('/tasks/{id}', { params: { path: { id: 22 } } });
// DELETE('/tasks/{id}', { params: { query: '', path: { id: 22 } } });
DELETE('/tasks/{id}', { params: { path: { id: 22 } } });

PUT('/tasks/{id}', { params: { path: { id: 22 } }, body: { completed: true } });
