import type { Core } from '@strapi/strapi';

const config = ({ strapi }) => ({
    async get(ctx) {
        const config = await strapi
            .store({ type: 'plugin', name: 'blur-placeholder' })
            .get({ key: 'config' }) || {};

        ctx.send({
            blurhashForce: config.blurhashForce ?? 4,
            tools: config.tools ?? null,
        });
    },

    async set(ctx) {
        const { blurhashForce, tools } = ctx.request.body;

        // Validation des entrées
        const hasBlurhashForce = typeof blurhashForce !== 'undefined';
        const hasTools = typeof tools !== 'undefined';

        if (!hasBlurhashForce && !hasTools) {
            return ctx.badRequest('Aucune donnée fournie pour la mise à jour');
        }

        if (hasBlurhashForce && (typeof blurhashForce !== 'number' || blurhashForce < 1 || blurhashForce > 9)) {
            return ctx.badRequest('blurhashForce doit être un nombre entre 1 et 9 inclus');
        }

        if (hasTools && typeof tools !== 'string') {
            return ctx.badRequest('tools doit être une chaîne de caractères');
        }

        // Récupération de la config existante
        const store = strapi.store({ type: 'plugin', name: 'blur-placeholder' });
        const existingConfig = (await store.get({ key: 'config' })) || {};

        // Construction de la nouvelle config
        const newConfig = {
            ...existingConfig,
            ...(hasBlurhashForce ? { blurhashForce } : {}),
            ...(hasTools ? { tools } : {}),
        };

        // Sauvegarde même si valeurs identiques
        await store.set({ key: 'config', value: newConfig });

        ctx.send({ message: 'Configuration mise à jour', config: newConfig });
    }




});

export default config;