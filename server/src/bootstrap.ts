import type { Core } from '@strapi/strapi';
import sharp from 'sharp';
import { encode } from 'blurhash';

// Variable pour stocker la fonction fetch importée une fois
let fetchFn: typeof fetch | null = null;

// Fonction pour récupérer fetch, import dynamique
async function getFetch() {
  if (!fetchFn) {
    const mod = await import('node-fetch');
    fetchFn = mod.default as unknown as typeof fetch;
  }
  return fetchFn;
}

const getBlurhash = async (imageUrl: string): Promise<string> => {
  const fetch = await getFetch(); // récupère fetch dynamiquement
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Erreur téléchargement image : ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
  return blurhash;
};

const updateMissingBlurhashes = async () => {
  console.log('🔄 Début de mise à jour des blurhash manquants...');
  
  const medias = (await strapi.entityService.findMany('plugin::upload.file', {
    filters: { mime: { $contains: 'image/' }, blurhash: null },
    fields: ['id', 'url', 'mime'],
    limit: 1000,
  })) as Array<{ id: number; url: string; mime: string }>;

  if (!Array.isArray(medias)) {
    console.error('Les médias récupérés ne sont pas un tableau:', medias);
    return;
  }

  for (const media of medias) {
    try {
      console.log(`🔹 Calcul blurhash pour média id=${media.id}, url=${media.url}`);
      const blurhash = await getBlurhash(media.url);
      await strapi.entityService.update('plugin::upload.file', media.id, {
        data: { blurhash } as any,
      });
      console.log(`✅ Blurhash ajouté pour id=${media.id}`);
    } catch (error) {
      console.error(`❌ Erreur blurhash média id=${media.id} url=${media.url}`);
    }
  }
  
  console.log('✔️ Mise à jour des blurhash terminée.');
};

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    async afterCreate(event) {
      const { result } = event;
      console.log('🆕 Nouveau média importé:', result);

      if (result.mime.startsWith('image/')) {
        try {
          const imageUrl = result.url;
          const blurhash = await getBlurhash(imageUrl);
          console.log('🔹 Blurhash calculé:', blurhash);

          await strapi.entityService.update('plugin::upload.file', result.id, {
            data: { blurhash } as any,
          });

          console.log('✅ Blurhash sauvegardé dans caption');
        } catch (error) {
          console.error('Erreur calcul blurhash:', error);
        }
      } else {
        console.log('Le fichier importé n\'est pas une image, pas de blurhash calculé.');
      }
    },
  });
  await updateMissingBlurhashes();
};

export default bootstrap;
