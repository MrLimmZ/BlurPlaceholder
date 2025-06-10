export default [
  {
    method: 'POST',
    path: '/force-update/:id',
    handler: 'controller.forceUpdate',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/hash/:id',
    handler: 'controller.hash',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/clear/:id',
    handler: 'controller.clear',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/set/:id',
    handler: 'controller.setHash',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 'config.get',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/config',
    handler: 'config.set',
    config: {
      policies: [],
    },
  },
];
