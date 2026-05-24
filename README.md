# MediSys - Microservice Utilisateur (user-service)

Service d'authentification et de gestion des utilisateurs pour l'application hospitalière MediSys. Fait partie d'une architecture microservices avec un API Gateway.

## Stack technique

- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB (via Mongoose) — instance MongoDB Atlas
- **Authentification** : JWT (jsonwebtoken) + bcryptjs
- **Emails** : Brevo API (envoi transactionnel via module `https` natif)
- **CORS** : Désactivé en production (géré par le Gateway)

## Structure du projet

```
backend/
├── .env                          # Variables d'environnement
├── package.json
├── src/
│   ├── server.js                 # Point d'entrée Express
│   ├── config/
│   │   └── db.js                 # Connexion MongoDB
│   ├── models/
│   │   ├── user.model.js         # Modèle User (name, email, password, role, hospital, specialty)
│   │   └── hospital.model.js     # Modèle Hospital (name, services)
│   ├── controllers/
│   │   ├── user.controller.js    # Handlers HTTP des endpoints utilisateurs
│   │   └── hospital.controller.js
│   ├── services/
│   │   ├── auth.service.js       # Logique métier : login, register, CRUD, changePassword
│   │   └── email.service.js      # Envoi d'emails via Brevo (temporaire, confirmation, notification)
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Vérification JWT
│   │   └── role.middleware.js     # Contrôle d'accès par rôle
│   ├── utils/
│   │   └── generateToken.js      # Création et vérification de tokens JWT
│   ├── seed.js                   # Seed : 3 utilisateurs par défaut (admin, medecin, accueil)
│   └── seed-hospitals.js         # Seed : 20 hôpitaux camerounais
└── dist/                         # Frontend buildé (servi en static)
```

## Scripts disponibles

```bash
npm start           # Démarre le serveur
npm run dev         # Mode développement
npm run seed        # Crée les 3 utilisateurs par défaut
npm run seed-hospitals  # Insère 20 hôpitaux camerounais
npm run req         # Lance le script de test REST
```

## Rôles utilisateur

| Rôle | Code | Description |
|------|------|-------------|
| Administrateur | `ADMIN` | Accès complet, création d'utilisateurs |
| Médecin | `MEDECIN` | Dossiers patients et consultations |
| Accueil | `ACCUEIL` | Enregistrement et recherche de patients |

## Endpoints API

### Publics
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Connexion (retourne token JWT) |
| POST | `/register/admin` | Création du premier admin (bootstrap) |

### Authentifiés (token requis)
| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/change-password` | * | Changer son mot de passe |
| POST | `/register` | ADMIN | Créer un utilisateur |
| GET | `/users?role=&search=` | ADMIN | Liste des utilisateurs |
| GET | `/users/:id` | ADMIN, MEDECIN | Détail d'un utilisateur |
| PUT | `/users/:id` | ADMIN | Modifier un utilisateur |
| DELETE | `/users/:id` | ADMIN | Supprimer un utilisateur |
| GET | `/hospitals?search=` | * | Liste des hôpitaux |
| GET | `/hospitals/:id` | * | Détail d'un hôpital |
| POST | `/hospitals` | * | Créer un hôpital |

## Variables d'environnement

```env
MONGODB_URI=               # URI MongoDB Atlas
JWT_SECRET=                # Clé secrète JWT (doit correspondre au Gateway)
JWT_EXPIRES_IN=24h         # Durée de validité du token
PORT=3001                  # Port du service
NODE_ENV=production        # Environnement
BREVO_API_KEY=             # Clé API Brevo (emails)
BREVO_SENDER_EMAIL=        # Expéditeur des emails
BREVO_SENDER_NAME=MediSys  # Nom de l'expéditeur
```

## Fonctionnalités clés

- Authentification JWT avec hash bcrypt
- Contrôle d'accès par rôle (RBAC) — 3 niveaux
- Création d'utilisateurs avec mot de passe temporaire
- Changement de mot de passe forcé à la première connexion
- Validation de mot de passe (8+ car., maj, min, chiffre, spécial)
- Notification par email à chaque connexion
- Gestion des hôpitaux (saisie libre ou suggestion)
- 24 spécialités médicales prédéfinies pour les médecins
- Service le frontend React buildé (`dist/`)
- Reconnexion automatique à MongoDB en cas d'échec

## Architecture

```
Frontend → API Gateway → /api/users/* → user-service (ce service) → MongoDB Atlas
```

Le service ne reçoit des requêtes que via le Gateway. En production, le CORS est désactivé car géré par le Gateway.
