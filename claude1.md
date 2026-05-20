# Résumé du Projet API Gateway Getway

## Vue d'Ensemble

Ce projet est un **API Gateway** pour une application de gestion hospitalière basée sur une architecture microservices. Il sert de point d'entrée unique pour toutes les requêtes provenant du frontend et redirige les requêtes vers les microservices appropriés.

## Architecture

```
Frontend → API Gateway → Microservices
                    ├── user-service (port 3001)
                    ├── patient-service (port 3002)
                    └── consultation-service (port 3003)
```

## Structure du Projet

```
Getway/
├── src/
│   ├── server.js              # Fichier principal du serveur
│   ├── config/
│   │   └── proxies.js         # Configuration des proxys vers les microservices
│   └── middlewares/
│       ├── auth.js            # Middleware d'authentification
│       ├── logger.js          # Middleware de logging
│       ├── errorHandler.js    # Gestionnaire d'erreurs global
│       └── rateLimiter.js      # Rate limiting
├── .env                       # Variables d'environnement
├── package.json               # Dépendances du projet
├── claude.md                  # Prompt de génération original
└── claude1.md                # Résumé pour les services utilisateur
```

## Services et Routes

| Route                | Service Cible        | Fonctionnalités                                     |
| -------------------- | -------------------- | --------------------------------------------------- |
| `/api/users`         | user-service         | Authentification, gestion des utilisateurs et rôles |
| `/api/patients`      | patient-service      | Gestion des patients                                |
| `/api/consultations` | consultation-service | Gestion des consultations et dossiers médicaux      |

## Technologies Utilisées

- **Node.js** - Environnement d'exécution JavaScript
- **Express** - Framework web minimaliste
- **http-proxy-middleware** - Proxy des requêtes HTTP
- **dotenv** - Gestion des variables d'environnement
- **cors** - Autorisation des requêtes cross-origin
- **express-rate-limit** - Limitation des requêtes

## Configuration des Variables d'Environnement

```env
# Port et hôte
PORT=3000
HOST=localhost

# URLs des microservices
USER_SERVICE_URL=http://localhost:3001
PATIENT_SERVICE_URL=http://localhost:3002
CONSULTATION_SERVICE_URL=http://localhost:3003

# JWT
JWT_SECRET=votre_secret_jwt
NODE_ENV=development

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # 100 requêtes par fenêtre
```

## Middlewares Implémentés

### 1. Auth Middleware (`auth.js`)

- Vérification JWT des requêtes
- Routes publiques configurables
- Fonction `requireRole()` pour vérifier les rôles
- Mode développement pour tester sans token

### 2. Logger Middleware (`logger.js`)

- Journalisation des requêtes HTTP
- Affichage de la méthode, URL, IP et User-Agent

### 3. Error Handler (`errorHandler.js`)

- Gestion centralisée des erreurs
- Messages d'erreur personnalisés par code HTTP
- Format JSON de réponse d'erreur

### 4. Rate Limiter (`rateLimiter.js`)

- Limitation à 100 requêtes par 15 minutes (par défaut)
- Identifiant par IP cliente

## Configuration des Proxies

Chaque service est configuré avec:

- `target` - URL du service cible
- `changeOrigin: true` - Modification de l'en-tête Host
- `pathRewrite` - Retrait du préfixe API
- `onError` - Gestion des erreurs de proxy
- `onProxyReq` / `onProxyRes` - Logs de débogage

## Routage du Gateway

- `GET /health` - Vérification de santé du gateway
- `GET /` - Informations générales sur l'API

## Implémentation Actuelle de l'Authentification

L'authentification actuelle utilise un système simulé:

- Liste des routes publiques (login, register)
- Vérification simple du format du token
- Mode développement pour ignorer l'authentification
- Décodage simulé du token JWT

## Points d'Extension pour le Service Utilisateur

Pour créer le **user-service**, voici les éléments à implémenter:

### Modèle de Données Utilisateur

```javascript
{
  id: String,
  username: String,
  email: String,
  password: String (hashé),
  role: String, // 'admin' | 'medecin' | 'agent_accueil'
  createdAt: Date,
  updatedAt: Date
}
```

### Rôles Disponibles

1. **admin** - Accès complet à toutes les fonctionnalités
2. **medecin** - Gestion des patients et consultations
3. **agent_accueil** - Enregistrement des patients

### Endpoints à Créer

| Méthode | Route                 | Description                    | Rôle Requis    |
| ------- | --------------------- | ------------------------------ | -------------- |
| POST    | `/api/users/register` | Inscription nouvel utilisateur | -              |
| POST    | `/api/users/login`    | Connexion utilisateur          | -              |
| GET     | `/api/users`          | Liste tous les utilisateurs    | admin          |
| GET     | `/api/users/:id`      | Détails d'un utilisateur       | admin, medecin |
| PUT     | `/api/users/:id`      | Modifier un utilisateur        | admin          |
| DELETE  | `/api/users/:id`      | Supprimer un utilisateur       | admin          |
| GET     | `/api/users/roles`    | Liste des rôles disponibles    | -              |

### Fonctions de Sécurité Requises

1. **Hashage du mot de passe** - Utiliser bcrypt
2. **Génération JWT** - Avec expiration
3. **Vérification JWT** - Avec jsonwebtoken
4. **Vérification du rôle** - Middleware de vérification de rôle

### Structure du Token JWT

```javascript
{
  id: String,
  username: String,
  email: String,
  role: String,
  iat: Number,  // Date d'émission
  exp: Number  // Date d'expiration
}
```

## Résumé pour la Génération du User Service

Tu dois générer un service utilisateur complet avec:

1. **Structure de projet Node.js/Express** avec:
   - `src/server.js` - Point d'entrée
   - `src/models/User.js` - Modèle utilisateur avec Mongoose ou Sequelize
   - `src/routes/users.js` - Routes API
   - `src/controllers/userController.js` - Logique métier
   - `src/middlewares/auth.js` - Authentication JWT
   - `src/middlewares/roleCheck.js` - Vérification des rôles
   - `src/utils/jwt.js` - Utilitaires JWT
   - `src/utils/password.js` - Hashage du mot de passe

2. **Fonctionnalités**:
   - Inscription avec hashage bcrypt
   - Connexion avec génération JWT
   - CRUD utilisateurs
   - Gestion des rôles
   - Protection des routes par rôle

3. **Bonnes pratiques**:
   - Validation des données
   - Gestion des erreurs
   - Logging
   - Configuration via variables d'environnement

Le user-service doit être compatibles avec l'API Gateway existant et répondre aux routes configurées dans `/api/users`.
