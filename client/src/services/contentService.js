import api, { unwrap } from './api';

/** Public site content: categories, agents, testimonials, settings, contact and newsletter. */
export const contentService = {
  categories: () => unwrap(api.get('/categories')),
  agents: (params) => unwrap(api.get('/agents', { params })),
  featuredAgents: () => unwrap(api.get('/agents/featured')),
  agent: (id) => unwrap(api.get(`/agents/${id}`)),
  testimonials: () => unwrap(api.get('/testimonials')),
  settings: () => unwrap(api.get('/settings')),
  stats: () => unwrap(api.get('/stats')),
  contact: (payload) => unwrap(api.post('/contact', payload)),
  subscribe: (email) => unwrap(api.post('/newsletter/subscribe', { email })),
  unsubscribe: (email) => unwrap(api.post('/newsletter/unsubscribe', { email })),
};

export default contentService;
