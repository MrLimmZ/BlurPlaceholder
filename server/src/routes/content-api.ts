export default [
  {
    method: 'POST',
    path: '/force-update/:id',
    handler: 'controller.forceUpdate',
    config: {
      policies: ['plugin::blur-placeholder.is-admin'],
    },
  },
  {
    method: 'POST',
    path: '/clear/:id',
    handler: 'controller.clear',
    config: {
      policies: ['plugin::blur-placeholder.is-admin'],
    },
  },
  {
    method: 'POST',
    path: '/set/:id',
    handler: 'controller.setHash',
    config: {
      policies: ['plugin::blur-placeholder.is-admin'],
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'config.get',
    config: {
      policies: ['plugin::blur-placeholder.is-admin'],
    },
  },
  {
    method: 'POST',
    path: '/config',
    handler: 'config.set',
    config: {
      policies: ['plugin::blur-placeholder.is-admin'],
    },
  },
];
