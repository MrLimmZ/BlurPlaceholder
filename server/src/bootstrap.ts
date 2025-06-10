import type { Core } from '@strapi/strapi';
import sharp from 'sharp';
import { encode } from 'blurhash';
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';

let fetchFn: typeof fetch | null = null;

interface BlurhashConfig {
  autoload?: boolean;
}

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
    const localPath = path.join(strapi.dirs.static.public, file.url);
    if (!fs.existsSync(localPath)) {
      throw new Error(`Fichier local introuvable : ${localPath}`);
    }
    const buffer = fs.readFileSync(localPath);
    return getBlurhashFromBuffer(buffer);
  }

  throw new Error(`Provider non supporté : ${file.provider}`);
};

const updateMissingBlurhashes = async () => {
  logger.info('Starting to update missing blurhash...');

  const medias = (await strapi.entityService.findMany('plugin::upload.file', {
    filters: {
      mime: { $contains: 'image/' },
      $or: [
        { blurhash: null },
        { blurhash: '' }
      ]
    },
    fields: ['id', 'url', 'mime', 'provider'],
    limit: 1000,
  })) as Array<{ id: number; url: string; mime: string; provider: string }>;

  if (!Array.isArray(medias)) {
    logger.error('Les médias récupérés ne sont pas un tableau', medias);
    return;
  }

  const results: Array<{ file: string; hash: string; duration: string }> = [];
  let totalDurationMs = 0;

  for (const media of medias) {
    try {
      const start = Date.now();

      const blurhash = await getBlurhash(media);

      const durationMs = Date.now() - start;
      totalDurationMs += durationMs;

      const duration = `${durationMs}ms`;

      await strapi.entityService.update('plugin::upload.file', media.id, {
        data: { blurhash } as any,
      });

      results.push({ file: media.url.split('/').pop() || media.url, hash: blurhash, duration });
    } catch (error) {
      logger.error(`Erreur blurhash pour id=${media.id}, url=${media.url}`, error);
    }
  }

  if (results.length) {
    console.log("");
    logger.renderTable(results);
  }

  logger.success(`Blurhash update completed for ${results.length} file(s) (${totalDurationMs}ms)`);
  console.log("");
};

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const config = strapi.config.get('plugin::blur-placeholder') as BlurhashConfig;
  if (config?.autoload === false) {
    logger.error('Blurhash autoload disabled');
    return;
  } else {
    logger.success('Blurhash autoload enabled');
    logger.title('Autohash Service');
    strapi.db.lifecycles.subscribe({
      models: ['plugin::upload.file'],
      async afterCreate(event) {
        const { result } = event;

        if (result.mime.startsWith('image/')) {
          try {
            const blurhash = await getBlurhash(result);

            await strapi.entityService.update('plugin::upload.file', result.id, {
              data: { blurhash } as any,
            });

          } catch (error) {
            logger.error(`Erreur de calcul du blurhash pour id=${result.id}`, error);
          }
        } else {
          logger.warn('LIFECYCLE', `Fichier non-image ignoré (id=${result.id}, mime=${result.mime})`);
        }
      },
    });

    await updateMissingBlurhashes();
  }
};

export default bootstrap;