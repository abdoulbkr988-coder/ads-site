# ADS – Abdoul Digital Solutions

Site web de l'entreprise : présentation, liste des services et commande directe sur WhatsApp
avec un message personnalisé contenant le nom du service choisi.

**Technologies** : HTML, CSS, JavaScript, Node.js, Express, Helmet (sécurité), Compression.

## Lancer le site

```bash
npm install
npm start
```

Puis ouvrez http://localhost:3000 (Node.js 18 ou plus récent).
Pour relancer automatiquement à chaque modification : `npm run dev`.

## Modifier le contenu

Tout se trouve dans **`data/site.json`** :

- `whatsapp.number` : numéro au format international, sans « + » (actuellement 2290158947766)
- `whatsapp.messageTemplate` : le message envoyé ; `{service}` est remplacé par le nom du service
- `contact` : lieu (actuellement « Zè plaque, Bénin »), horaires, e-mail (laissé vide, il n'apparaît pas tant que vous n'en ajoutez pas un)
- `services` : ajoutez, retirez ou modifiez les services (titre, description, points clés)
  Icônes disponibles : `globe`, `cv`, `mail`, `printer`, `briefcase`, `cap`, `pen`, `monitor`

## Ajouter vos photos de réalisations

Les balises `<img>` sont déjà écrites dans `public/index.html` (cherchez « PROJET 1 »).

1. Copiez votre photo dans le dossier `public/img/projets/`.
2. Nommez-la `projet-1.jpg`, `projet-2.jpg`... ou changez le nom dans `src="..."` (png et webp fonctionnent aussi).
3. Dans `index.html`, modifiez la catégorie, le titre, le texte `alt` et la description (`data-desc`).

Une photo absente est cachée automatiquement. Tant qu'aucune photo n'est ajoutée, la section « Nos réalisations » et son lien du menu restent invisibles. Pour un nouveau projet, copiez le modèle à la fin de la liste.

Conseils : photos d'environ 1200 px de large et moins de 300 Ko (chargement rapide sur téléphone) ; pour les CV et documents, masquez les informations personnelles ou demandez l'accord du client.

Les textes de présentation (À propos, étapes, questions fréquentes) sont dans `public/index.html`,
les couleurs dans `public/css/style.css` (variables en haut du fichier).

## Mettre en ligne

Le site est une application Node.js : hébergez-la sur Render, Railway, un VPS, etc.
Commande de démarrage : `npm start`. Le port est lu dans la variable `PORT`.
