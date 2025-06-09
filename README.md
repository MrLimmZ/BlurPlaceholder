# Blur Placeholder Plugin for Strapi


**Version :** 1.0.0  
**Compatible avec Strapi :** ≥ 5.14.0  
**Licence :** MIT  
**Gratuit et open-source**


## 🖼️ Présentation

Le plugin **Blur Placeholder** ajoute une couche d’expérience utilisateur moderne à vos sites front-end en générant automatiquement des placeholders flous pour vos images. 

Ces placeholders sont intégrés directement dans la réponse JSON de vos médias via un nouveau champ `blurhash`. Cela permet un affichage progressif et fluide des images sur votre site, optimisant le temps de chargement et la perception utilisateur.

Le plugin est **compatible avec le provider local et Cloudinary**.


## ✨ Fonctionnalités

- 🔄 **Génération automatique** de blurhash lors :
  - Du démarrage du serveur (pour les médias existants sans hash)
  - De l’upload d’un nouveau média

- ⚙️ **Interface de configuration** :
  - Nouvel onglet dans l’admin `Blur Placeholder`
  - Choisissez vos algorithmes et votre provider
  - Appliquez ces réglages à tous les médias en un clic

- 🧩 **Gestion individuelle des médias** :
  - Visualisation, édition manuelle et génération au cas par cas

- 🌍 **Support multi-langues** (initial)

- 🤝 **Ouvert aux contributions** (voir contact ci-dessous)


## 🔧 Technologies utilisées

Le plugin prend en charge plusieurs méthodes de génération de placeholder :

- [LQIP (Low Quality Image Placeholder)](https://github.com/zouhir/lqip)
- [Blurhash](https://blurha.sh)
- [Color Thief](https://lokeshdhakar.com/projects/color-thief/)
- [SQIP (SVG-based LQIP)](https://github.com/axe312ger/sqip)


## 📦 Installation

```bash
npm install strapi-plugin-blur-placeholder
ou
yarn add strapi-plugin-blur-placeholder
```


## 🧰 Configuration

Une fois installé :

1. Accédez à l’onglet Blur Placeholder dans l’administration

2. Choisissez vos paramètres de génération (type, qualité, etc.)

3. Appliquez globalement ou gérez les médias un par un

Aucune configuration manuelle de fichiers n’est nécessaire.


## ✅ Compatibilité

- Strapi v5.14.0 ou plus récent
- Provider local
- Provider Cloudinary


## 📧 Contact & Contributions

Améliorations, bugs ou idées ? Contactez-moi :

- Email : contact@michelaxel.fr
- Site web : michelaxel.fr
- Contributions bienvenues via PR ou issues sur le dépôt GitHub


## 📄 Licence

Ce plugin est distribué sous licence MIT. Utilisation libre et gratuite.