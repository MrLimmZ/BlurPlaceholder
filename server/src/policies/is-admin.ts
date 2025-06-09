export default async (policyContext, config, { strapi }) => {
  if (policyContext.state.user.role.name === 'Administrator') {
    return true;
  }
  return false;
};