# MediSys — Hospital (user-service)

Service d'authentification et de gestion des utilisateurs et hôpitaux pour MediSys.

## Stack

- **Runtime** : Node.js
- **Framework** : Express
- **Base de données** : MongoDB (via Mongoose) — MongoDB Atlas
- **Authentification** : JWT (jsonwebtoken) + bcryptjs
- **Emails** : Brevo API

## Démarrage

```bash
cp .env.example .env
# éditer .env avec vos identifiants
npm install
npm run dev
```

Port par défaut : `5001`

## Variables d'environnement

| Variable | Description |
|---|---|
| `PORT` | Port du service (5001) |
| `DATABASE_URL` | URI MongoDB Atlas |
| `JWT_SECRET` | Clé secrète JWT |
| `JWT_EXPIRES_IN` | Durée du token (ex: 7d) |
| `BREVO_API_KEY` | Clé API Brevo |
| `BREVO_SENDER_EMAIL` | Expéditeur des emails |
| `FRONTEND_URL` | URL du frontend |
| `SUPPORT_EMAIL` | Email de support |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Mode développement |
| `npm start` | Production |
| `npm run seed` | Crée 3 utilisateurs par défaut (admin, medecin, accueil) |
| `npm run seed:hospitals` | Insère 20 hôpitaux camerounais |

## Rôles

| Rôle | Code | Description |
|---|---|---|
| Administrateur | `ADMIN` | Accès complet |
| Médecin | `MEDECIN` | Dossiers patients et consultations |
| Accueil | `ACCUEIL` | Enregistrement et recherche de patients |

## Endpoints API

### Publics
| Méthode | Route | Description |
|---|---|---|
| POST | `/login` | Connexion (retourne token JWT) |
| POST | `/register/admin` | Création du premier admin |
| POST | `/forgot-password` | Demande de réinitialisation |

### Authentifiés
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/change-password` | * | Changer son mot de passe |
| POST | `/register` | ADMIN | Créer un utilisateur |
| GET | `/users` | ADMIN | Liste des utilisateurs |
| GET | `/users/:id` | ADMIN, MEDECIN | Détail d'un utilisateur |
| PUT | `/users/:id` | ADMIN | Modifier un utilisateur |
| DELETE | `/users/:id` | ADMIN | Supprimer un utilisateur |
| GET | `/hospitals` | * | Liste des hôpitaux |
| POST | `/hospitals` | * | Créer un hôpital |
| GET | `/hospitals/:id` | * | Détail d'un hôpital |
| PUT | `/hospitals/:id` | * | Modifier un hôpital |
| DELETE | `/hospitals/:id` | * | Supprimer un hôpital |
| GET | `/password-reset-requests` | ADMIN | Demandes de réinitialisation |
| PUT | `/password-reset-requests/:id/approve` | ADMIN | Approuver une demande |
| PUT | `/password-reset-requests/:id/reject` | ADMIN | Rejeter une demande |

## Fonctionnalités clés

- Authentification JWT avec hash bcrypt
- 3 rôles avec permissions distinctes
- Mot de passe temporaire + changement forcé à la 1ère connexion
- Validation mot de passe (8+ car., maj., min., chiffre, spécial)
- Workflow de réinitialisation de mot de passe avec validation admin
- Notification email à chaque connexion
- Gestion des hôpitaux (CRUD complet)
- 24 spécialités médicales prédéfinies

## Dépôts liés

| Service | Dépôt |
|---|---|
| Frontend | [Dupont-fr/IN3_project-frontend](https://github.com/Dupont-fr/IN3_project-frontend) |
| Gateway | [Dupont-fr/api-getway](https://github.com/Dupont-fr/api-getway) |
| Patient-service | [Dupont-fr/patient-service](https://github.com/Dupont-fr/patient-service) |
| Consultation-service | [Dupont-fr/consultations-service](https://github.com/Dupont-fr/consultations-service) |
| Statistic-service | [Dupont-fr/Statistique-service](https://github.com/Dupont-fr/Statistique-service) |
