Prompt de génération – Microservice Utilisateur (Authentification & Rôles)

Tu es un ingénieur backend senior spécialisé en Node.js, Express et architecture microservices.

Ta mission est de générer un microservice complet pour la gestion des utilisateurs, de l’authentification et des rôles dans une application de gestion hospitalière.

🔗 Contexte global

Ce microservice doit être compatible avec une architecture microservices existante comprenant :

Un API Gateway (déjà implémenté)
D’autres services (patient-service, consultation-service)

👉 Toutes les requêtes passent par le Gateway via :

/api/users → redirigé vers ce service
🎯 Objectif du microservice

Ce service gère :

la création des utilisateurs
l’authentification (login)
la gestion des rôles
les autorisations selon le rôle
👥 Rôles à gérer

Le système contient 3 rôles principaux :

🔹 Administrateur
Peut créer d’autres administrateurs
Peut créer tous les utilisateurs
Accès complet
🔹 Médecin
Peut consulter les dossiers patients
Peut créer et modifier des consultations
Ne peut pas gérer les utilisateurs
🔹 ServiceAccueil
Peut créer un patient
Peut rechercher un patient
Accès très limité
Ne peut pas modifier les consultations
🔐 Gestion des autorisations

Le système doit inclure une logique comme :

if (user.role === "ADMIN") → accès total
if (user.role === "MEDECIN") → accès consultations
if (user.role === "ACCUEIL") → accès limité

👉 Implémenter cela via des middlewares d’autorisation propres et réutilisables

⚙️ Exigences techniques
Utiliser Node.js avec Express
Utiliser MongoDB avec Mongoose
Implémenter JWT pour l’authentification
Hasher les mots de passe avec bcrypt
Utiliser dotenv pour la configuration
Structurer le code de manière modulaire
Ajouter une gestion globale des erreurs
Ajouter des validations simples (email, password)
📡 API attendue
Authentification
POST /login
POST /register (admin uniquement)
Utilisateurs
GET /users (admin uniquement)
GET /users/
PUT /users/
DELETE /users/ (admin uniquement)
📁 Structure du projet attendue

user-service/
│
├── src/
│ ├── controllers/
│ │ └── user.controller.js
│ │
│ ├── routes/
│ │ └── user.routes.js
│ │
│ ├── models/
│ │ └── user.model.js
│ │
│ ├── services/
│ │ └── auth.service.js
│ │
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ └── role.middleware.js
│ │
│ ├── config/
│ │ └── db.js
│ │
│ ├── utils/
│ │ └── generateToken.js
│ │
│ └── server.js
│
├── .env.example
├── package.json

🔐 Middleware attendu
auth.middleware.js
Vérifie le token JWT
Ajoute user dans req.user
role.middleware.js
Vérifie le rôle
Exemple :
allowRoles("ADMIN")
allowRoles("MEDECIN")
📦 Contenu attendu

Générer :

Toute la structure du projet
Le serveur Express complet
Le modèle User avec :
nom
email
password
role
Les routes complètes
Les contrôleurs
Les middlewares (auth + role)
Le système JWT
Le fichier .env exemple
Le package.json
🔄 Contraintes
Code simple et compréhensible (niveau étudiant)
Bien commenter les parties importantes
Ne pas surcharger inutilement
🔗 Intégration avec le Gateway

Le service doit être prêt à être connecté à un API Gateway via :

/api/users

🎁 Bonus (optionnel)
Rafraîchissement de token
Gestion des erreurs avancée
Logs améliorés
🎯 Résultat attendu

Un microservice fonctionnel, clair et prêt à être :

testé localement
connecté au gateway
déployé sur Render
