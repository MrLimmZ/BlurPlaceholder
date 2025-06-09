export const formatProvider = (provider: string): string => {
  if (provider === 'local') return 'local';
  if (provider.includes('cloudinary')) return 'cloudinary';
  return provider.replace('@strapi/provider-upload-', '');
};