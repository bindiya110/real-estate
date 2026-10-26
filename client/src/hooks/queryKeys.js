/** Central query keys so mutations can invalidate exactly what they change. */
export const queryKeys = {
  me: ['auth', 'me'],
  properties: {
    all: ['properties'],
    search: (params) => ['properties', 'search', params],
    featured: ['properties', 'featured'],
    latest: (type) => ['properties', 'latest', type ?? 'all'],
    locations: ['properties', 'locations'],
    detail: (slug) => ['properties', 'detail', slug],
    byId: (id) => ['properties', 'id', id],
    similar: (id) => ['properties', 'similar', id],
  },
  my: {
    all: ['my'],
    properties: (params) => ['my', 'properties', params],
    stats: ['my', 'stats'],
    inquiries: (params) => ['my', 'inquiries', params],
  },
  favorites: {
    all: ['favorites'],
    ids: ['favorites', 'ids'],
    list: (params) => ['favorites', 'list', params],
  },
  content: {
    categories: ['content', 'categories'],
    agents: (params) => ['content', 'agents', params],
    featuredAgents: ['content', 'agents', 'featured'],
    agent: (id) => ['content', 'agent', id],
    testimonials: ['content', 'testimonials'],
    settings: ['content', 'settings'],
    stats: ['content', 'stats'],
  },
  admin: {
    all: ['admin'],
    dashboard: ['admin', 'dashboard'],
    properties: (params) => ['admin', 'properties', params],
    property: (id) => ['admin', 'property', id],
    users: (params) => ['admin', 'users', params],
    user: (id) => ['admin', 'user', id],
    inquiries: (params) => ['admin', 'inquiries', params],
    messages: (params) => ['admin', 'messages', params],
    categories: ['admin', 'categories'],
    testimonials: ['admin', 'testimonials'],
    subscribers: (params) => ['admin', 'subscribers', params],
    settings: ['admin', 'settings'],
  },
};

export default queryKeys;
