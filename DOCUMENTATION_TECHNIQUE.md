# Documentation technique - SCYFCO Certification Portal

## Aperçu

Ce dépôt contient une application web Next.js (App Router) située dans `apps/web` qui sert de portail de certification SCYFCO pour les DS/Mentors. L'application s'authentifie via Airtable (table `Intervenant`) et expose des pages internes ainsi que des vues Airtable embarquées (iframes). Une fonctionnalité interne majeure est l'attribution des notes réflexives.

## Stack

- Next.js `16.1.1` + React `19.2.3`
- TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Auth JWT avec `jose`
- Airtable API REST

## Structure du repo

- `apps/web/app` : App Router Next.js, pages et API routes.
- `apps/web/components` : composants UI (ProtectedRoute, notes réflexives, etc.).
- `apps/web/lib` : logique métier (auth, Airtable, RBAC, types).
- `apps/web/public` : assets (logo, illustration).
- `README.md` : instructions de démarrage local.

## Démarrage local

1. Définir les variables d'environnement.
2. Lancer l'application depuis `apps/web`.

```bash
cd apps/web
npm install
npm run dev
```

## Variables d'environnement

Valeurs à définir (ne pas mettre de secrets dans le repo) :

```env
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
JWT_SECRET=your-secret-key
```

Notes :

- `AIRTABLE_API_KEY` est obligatoire.
- `AIRTABLE_BASE_ID` a une valeur par défaut dans le code si absent, mais il est préférable de le définir explicitement.
- `JWT_SECRET` est obligatoire (sinon exception).

## Auth & session

- Auth "passwordless" par email : l'utilisateur saisit son email sur `/login`.
- Le backend vérifie l'email dans Airtable `Intervenant`.
- Si OK, un JWT est créé et stocké dans un cookie httpOnly `scyfco_session`, valable 7 jours.
- `middleware.ts` protège :
  - Pages : `/ds-mentors`
  - API : `/api/airtable/*`
- Le frontend utilise `/api/auth/me` pour vérifier la session.

Fichiers clés :

- `apps/web/lib/auth.ts`
- `apps/web/middleware.ts`
- `apps/web/app/api/auth/*`

## Flux principal (DS/Mentors)

Page d'entrée :

- `apps/web/app/page.tsx` : redirection vers `/ds-mentors` si session valide, sinon `/login`.

Page DS/Mentors :

- `apps/web/app/ds-mentors/page.tsx`
- Sidebar avec une liste de vues Airtable embarquées (iframes) + un composant interne "Attribuer des notes réflexives".
- Paramètre `?view=` pour sélectionner un menu item.
- `?embed=true` est lu mais non exploité actuellement.

## Fonctionnalité : notes réflexives

Composants principaux :

- `apps/web/components/AttribuerNotesReflexives.tsx`
- `apps/web/hooks/useReflexiveNotes.ts`
- `apps/web/components/reflexive-notes/*`

Étapes :

1. Récupérer l'intervenant via `/api/auth/me`.
2. Charger ses sessions autorisées via `/api/airtable/sessions`.
3. Sélection d'une session → chargement des participants via `/api/airtable/participants?sessionName=...`.
4. Saisie des notes (0-100), sauvegarde par lot via `/api/airtable/notes-batch`.

## API Routes

### Auth

- `POST /api/auth/login` : email → session JWT.
- `GET /api/auth/me` : infos intervenant (si session).
- `POST /api/auth/logout` : supprime le cookie.
- `POST /api/airtable/verify-intervenant` : vérifie un email Airtable (protégé).

### Airtable

- `GET /api/airtable/sessions` : sessions autorisées (filtrées par IDs de session de l'intervenant).
- `GET /api/airtable/participants` : participants filtrés par `sessionName` et `equipe`.
- `PATCH /api/airtable/notes` : update note d'un participant (non utilisé par l'UI actuelle).
- `PATCH /api/airtable/notes-batch` : batch update des notes (utilisé par l'UI).

## Airtable - tables et mapping

Tables attendues dans Airtable (définies dans `apps/web/lib/airtable/repository.ts`) :

- `Intervenant`
- `Sessions`
- `Evaluations_Reflexives`

Champs clés utilisés :

- Intervenant : `Email`, `Nom`/`Name`, `Sessions` (IDs), `Equipe`.
- Sessions : `Sessions de formation`/`Nom`/`Session`, `Date`, `Statut`, `Participants`.
- Evaluations_Reflexives : nombreux champs texte, dont la note réflexive.

La note réflexive est recherchée dans plusieurs champs possibles, avec fallback :

- `Note Reflexives`
- `Note Reflexive`
- `Note réflexive`
- `Note réflexives`

Lors des mises à jour, le backend tente automatiquement ces champs jusqu'à succès.

## Contrôle d'accès Airtable

- L'intervenant ne voit que ses sessions (`session.intervenant.sessions`).
- Le filtrage des participants inclut `Equipe` si disponible.
- Avant update, le backend vérifie que :
  - La session du participant est autorisée.
  - L'équipe correspond si `equipe` est renseignée.

## Fichiers importants

- UI :
  - `apps/web/app/ds-mentors/page.tsx`
  - `apps/web/components/AttribuerNotesReflexives.tsx`
  - `apps/web/components/reflexive-notes/*`
- Auth :
  - `apps/web/lib/auth.ts`
  - `apps/web/middleware.ts`
  - `apps/web/app/api/auth/*`
- Airtable :
  - `apps/web/lib/airtable/client.ts`
  - `apps/web/lib/airtable/repository.ts`
  - `apps/web/app/api/airtable/*`
- Types & mocks (non branchés dans l'UI actuelle) :
  - `apps/web/lib/types.ts`
  - `apps/web/lib/mock-data.ts`
  - `apps/web/lib/permissions.ts` (RBAC frontend uniquement, pas utilisé aujourd'hui)

## Qualité & tests

- Aucun test automatisé dans le repo.
- Pas de scripts de CI/CD identifiés.

## Sécurité / points d'attention

- Auth par email sans mot de passe : dépend entièrement d'Airtable.
- Le cookie est httpOnly + sameSite=lax, sécurisé en prod.
- Le fichier `.env` contient des secrets en clair dans ce workspace : éviter de le versionner. Rotation recommandée si exposé.

## Questions métier en suspens

- Comment fonctionne exactement l'attribution des notes réflexives par les mentors dans Airtable ?
- Y a-t-il des automatismes Airtable défaillants ou des soucis de synchronisation de champs ?
- Table `Evaluation reflexive (EN)` mentionnée comme point d'attention.

## Déploiement

- Aucun pipeline CI/CD ou config de déploiement explicitement présent dans le repo.
- Déploiement probable via Vercel ou serveur Node classique (Next.js).
