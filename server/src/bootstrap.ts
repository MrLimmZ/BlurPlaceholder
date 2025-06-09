import type { Core } from '@strapi/strapi';
import sharp from 'sharp';
import { encode } from 'blurhash';
import fs from 'fs';
import path from 'path';

let fetchFn: typeof fetch | null = null;

async function getFetch() {
  if (!fetchFn) {
    const mod = await import('node-fetch');
    fetchFn = mod.default as unknown as typeof fetch;
  }
  return fetchFn;
}

const getBlurhashFromBuffer = async (buffer: Buffer): Promise<string> => {
  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
};

// 🔁 Fonction qui prend maintenant un média complet pour savoir s'il est local ou Cloudinary
const getBlurhash = async (file: { url: string; provider: string }): Promise<string> => {
  // Cloudinary : télécharger via URL
  if (file.provider === '@strapi/provider-upload-cloudinary') {
    const fetch = await getFetch();
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Erreur téléchargement image : ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return getBlurhashFromBuffer(buffer);
  }

  // Local : lire depuis le disque
  if (file.provider === 'local' || file.provider === 'Local') {
    const localPath = path.join(strapi.dirs.static.public, file.url); // e.g. /uploads/image.jpg
    if (!fs.existsSync(localPath)) {
      throw new Error(`Fichier local introuvable : ${localPath}`);
    }
    const buffer = fs.readFileSync(localPath);
    return getBlurhashFromBuffer(buffer);
  }

  throw new Error(`Provider non supporté : ${file.provider}`);
};

const updateMissingBlurhashes = async () => {
  console.log('🔄 Début de mise à jour des blurhash manquants...');

  const medias = (await strapi.entityService.findMany('plugin::upload.file', {
    filters: { mime: { $contains: 'image/' }, blurhash: null },
    fields: ['id', 'url', 'mime', 'provider'],
    limit: 1000,
  })) as Array<{ id: number; url: string; mime: string; provider: string }>;

  if (!Array.isArray(medias)) {
    console.error('Les médias récupérés ne sont pas un tableau:', medias);
    return;
  }

  for (const media of medias) {
    try {
      console.log(`🔹 Calcul blurhash pour média id=${media.id}, url=${media.url}`);
      const blurhash = await getBlurhash(media);
      await strapi.entityService.update('plugin::upload.file', media.id, {
        data: { blurhash } as any,
      });
      console.log(`✅ Blurhash ajouté pour id=${media.id}`);
    } catch (error) {
      console.error(`❌ Erreur blurhash média id=${media.id} url=${media.url}`);
      console.error(error);
    }
  }

  console.log('✔️ Mise à jour des blurhash terminée.');
};

const enableDefaultPermissions = async () => {
  const roles = await strapi
    .query('plugin::users-permissions.role')
    .findMany();

  const adminRole = roles.find(r => r.name === 'Administrator');

  if (!adminRole) return;

const enableDefaultPermissions = async () => {
  const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {});

  const adminRole = roles.find(r => r.name === 'Administrator');
  if (!adminRole) return;

  const actionsToEnable = [
    'plugin::blur-placeholder.force-update',
    'plugin::blur-placeholder.clear',
    'plugin::blur-placeholder.setHash',
    // ajoute les autres actions nécessaires
  ];

  for (const action of actionsToEnable) {
    // Chercher si la permission existe
    const existingPerms = await strapi.entityService.findMany('plugin::users-permissions.permission', {
      filters: { role: adminRole.id, action },
      limit: 1,
    });

    if (existingPerms.length === 0) {
      // Créer la permission si elle n'existe pas
      await strapi.entityService.create('plugin::users-permissions.permission', {
        data: {
          role: adminRole.id,
          action,
          enabled: true,
        },
      });
    } else {
      // Sinon mettre à jour si besoin
      const perm = existingPerms[0];
      if (!perm.enabled) {
        await strapi.entityService.update('plugin::users-permissions.permission', perm.id, {
          data: { enabled: true },
        });
      }
    }
  }
};


  for (const perm of permissionsToEnable) {
    await strapi.query('plugin::users-permissions.permission').createOrUpdate({
      where: { role: perm.role, action: perm.action },
      create: { role: perm.role, action: perm.action, enabled: true },
      update: { enabled: true },
    });
  }
};


const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    async afterCreate(event) {
      const { result } = event;
      console.log('🆕 Nouveau média importé:', result);

      if (result.mime.startsWith('image/')) {
        try {
          const blurhash = await getBlurhash(result);
          console.log('🔹 Blurhash calculé:', blurhash);

          await strapi.entityService.update('plugin::upload.file', result.id, {
            data: { blurhash } as any,
          });

          console.log('✅ Blurhash sauvegardé');
        } catch (error) {
          console.error('Erreur calcul blurhash:', error);
        }
      } else {
        console.log('Le fichier importé n\'est pas une image, pas de blurhash calculé.');
      }
    },
  });

  await updateMissingBlurhashes();
  await enableDefaultPermissions;
};

export default bootstrap;