import type { Core } from '@strapi/strapi';
import sharp from 'sharp';
import { encode } from 'blurhash';
import fs from 'fs';
import path from 'path';

async function getFetch() {
  const mod = await import('node-fetch');
  return mod.default as unknown as typeof fetch;
}

const getBlurhashFromBuffer = async (
  buffer: Buffer,
  force: number = 4
): Promise<string> => {
  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  return encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    force,
    force
  );
};

const getBlurhash = async (file: any, force: number = 4): Promise<string> => {
  // Cas Cloudinary (URL publique)
  if (file.provider === '@strapi/provider-upload-cloudinary') {
    const fetch = await getFetch();
    const response = await fetch(file.url);
    if (!response.ok) throw new Error(`Erreur téléchargement image : ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return getBlurhashFromBuffer(buffer, force);
  }

  // Cas local (chemin disque)
  if (file.provider === 'local') {
    const localPath = path.join(strapi.dirs.static.public, file.url);
    if (!fs.existsSync(localPath)) {
      throw new Error(`Fichier local introuvable : ${localPath}`);
    }
    const buffer = fs.readFileSync(localPath);
    return getBlurhashFromBuffer(buffer, force);
  }

  throw new Error(`Provider non supporté : ${file.provider}`);
};

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async forceUpdate(ctx) {
    const id = Number(ctx.params.id);
    const file = await strapi.entityService.findOne('plugin::upload.file', id);
    const { force } = ctx.request.body;
    if (!file) {
      return ctx.notFound('Fichier non trouvé');
    }

    if (!file.mime.startsWith('image/')) {
      return ctx.badRequest('Le fichier n\'est pas une image');
    }

    try {
      const blurhash = await getBlurhash(file, force);

      const updated = await strapi.entityService.update('plugin::upload.file', id, {
        data: { blurhash } as any,
      });

      ctx.body = updated;
    } catch (error) {
      console.error('Erreur blurhash:', error);
      ctx.internalServerError('Erreur lors du calcul du blurhash');
    }
  },
  async clear(ctx) {
    const id = Number(ctx.params.id);

    const file = await strapi.entityService.findOne('plugin::upload.file', id);
    if (!file) return ctx.notFound('Fichier non trouvé');

    try {
      const updated = await strapi.entityService.update('plugin::upload.file', id, {
        data: { blurhash: "" } as any,
      });
      ctx.body = updated;
    } catch (err) {
      console.error('Erreur suppression blurhash:', err);
      ctx.internalServerError('Erreur lors de la suppression du blurhash');
    }
  },
  async setHash(ctx) {
    const id = Number(ctx.params.id);
    const { blurhash } = ctx.request.body;

    // Récupérer le fichier
    const file = await strapi.entityService.findOne('plugin::upload.file', id);
    if (!file) {
      return ctx.notFound('Fichier non trouvé');
    }

    if (!file.mime.startsWith('image/')) {
      return ctx.badRequest('Le fichier n\'est pas une image');
    }

    try {
      // Mettre à jour le blurhash
      const updated = await strapi.entityService.update('plugin::upload.file', id, {
        data: { blurhash } as any,
      });

      ctx.body = updated;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du blurhash :', error);
      ctx.internalServerError('Erreur lors de la mise à jour du blurhash');
    }
  },
  async hash(ctx) {
    const id = Number(ctx.params.id);
    const file = await strapi.entityService.findOne('plugin::upload.file', id);
    const { force } = ctx.request.body;

    if (!file) {
      return ctx.notFound('Fichier non trouvé');
    }

    if (!file.mime.startsWith('image/')) {
      return ctx.badRequest('Le fichier n\'est pas une image');
    }

    try {
      const blurhash = await getBlurhash(file, force);

      ctx.body = blurhash;
    } catch (error) {
      console.error('Erreur blurhash:', error);
      ctx.internalServerError('Erreur lors du calcul du blurhash');
    }
  },
});

export default controller;