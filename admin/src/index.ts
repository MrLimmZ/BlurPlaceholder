import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

// Traduction Chinois
import zh from './translations/zh.json';

// Traduction Ukrainien
import uk from './translations/uk.json';

// Traduction Turc
import tr from './translations/tr.json';

// Traduction Thaï
import th from './translations/th.json';

// Traduction Slovaque
import sk from './translations/sk.json';

// Traduction Russe
import ru from './translations/ru.json';

// Traduction Portugais
import pt from './translations/pt.json';

// Traduction Polonais
import pl from './translations/pl.json';

// Traduction Malais
import ms from './translations/ms.json';

// Traduction Coréen
import ko from './translations/ko.json';

// Traduction Japonais
import ja from './translations/ja.json';

// Traduction Italien
import it from './translations/it.json';

// Traduction Hébreu
import he from './translations/he.json';

// Traduction Francais
import fr from './translations/fr.json';

// Traduction Espagnol
import es from './translations/es.json';

// Traduction Anglais
import en from './translations/en.json';

// Traduction Danois
import dk from './translations/dk.json';

// Traduction Allemand
import de from './translations/de.json';

// Traduction Catalan
import ca from './translations/ca.json';

const translations: Record<string, any> = {
  zh,
  uk,
  tr,
  th,
  sk,
  ru,
  pt,
  pl,
  ms,
  ko,
  ja,
  it,
  he,
  fr,
  es,
  en,
  dk,
  de,
  ca,
};

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        return {
          data: translations[locale] || {},
          locale,
        };
      })
    );
  },
};
