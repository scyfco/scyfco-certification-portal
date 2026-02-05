import type { User, UserRole } from './types';

/**
 * Source de vérité RBAC (frontend-only).
 *
 * Objectif:
 * - Centraliser les permissions "atomiques" (lisibles et métier)
 * - Mapper les rôles -> permissions sans jamais faire `if (role === ...)` dans les pages/components
 *
 * Important:
 * - Sans backend, cette RBAC sert uniquement à la cohérence UX/produit (masquer/désactiver),
 *   pas à une sécurité réelle.
 * - Les notions de "scope" (mes sessions / mon équipe) doivent être gérées par le filtrage des données
 *   (mock-data) + UI, pas uniquement par des permissions.
 */

export const PERMISSIONS = {
  // --- Pages (navigation) DS/Mentors uniquement ---
  VIEW_SESSIONS: 'VIEW_SESSIONS',
  VIEW_SESSIONS_READONLY: 'VIEW_SESSIONS_READONLY',
  VIEW_PARTICIPANTS: 'VIEW_PARTICIPANTS',
  VIEW_PARTICIPANTS_TEAM_ONLY: 'VIEW_PARTICIPANTS_TEAM_ONLY', // mentor: ne voir que ses équipes
  VIEW_PARTICIPANT_DETAIL: 'VIEW_PARTICIPANT_DETAIL',
  VIEW_EVALUATIONS: 'VIEW_EVALUATIONS', // lecture (ds/mentor)
  EDIT_EVALUATIONS: 'EDIT_EVALUATIONS', // saisie (mentor)

  // --- Actions métier (boutons / opérations) ---
  // Sessions
  ASSIGN_MENTORS_TO_SESSION: 'ASSIGN_MENTORS_TO_SESSION', // DS: attribuer mentors à une session

  // Participants / équipes
  ADD_PARTICIPANTS_TO_SESSION: 'ADD_PARTICIPANTS_TO_SESSION', // DS
  ASSIGN_MENTORS_TO_TEAMS: 'ASSIGN_MENTORS_TO_TEAMS', // DS
  RELAUNCH_PARTICIPANTS_OR_MENTORS: 'RELAUNCH_PARTICIPANTS_OR_MENTORS',
  MONITOR_SESSION_COMPLETION: 'MONITOR_SESSION_COMPLETION', // DS: suivre la complétude

  // Documents
  GENERATE_SESSION_DOCUMENTS: 'GENERATE_SESSION_DOCUMENTS', // DS: générer documents pour ses sessions

  // Évaluations
  VIEW_ALL_EVALUATIONS: 'VIEW_ALL_EVALUATIONS', // DS: consulter toutes les évaluations
  EVALUATE_TEAM_PARTICIPANTS: 'EVALUATE_TEAM_PARTICIPANTS', // mentor: évaluer ses participants
  VIEW_TEAM_QCM_REFLECTIVE: 'VIEW_TEAM_QCM_REFLECTIVE', // mentor: voir QCM et évaluations réflexives
  VALIDATE_MENTOR_PROPOSALS: 'VALIDATE_MENTOR_PROPOSALS', // DS: valider propositions mentor
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Mapping ROLE -> permissions[]
 *
 * 🔹 DS (Directeur de Stage / Délégué Scyfco)
 * - Ajouter participants dans la session
 * - Suivre la complétude
 * - Relancer mentors ou participants
 * - Générer documents pour la session
 * - Attribuer mentors à des équipes et sessions
 * - Consulter toutes les évaluations
 * - Valider / contrôler les propositions Mentor
 *
 * 🔹 MENTOR
 * - Évaluer ses participants : évaluations mentor, évaluations expérientielles
 * - Voir les QCM et évaluations réflexives de ses participants
 * → Acteur opérationnel sur son équipe
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  // 🔹 DS (Directeur de Stage / Délégué Scyfco)
  DS: [
    // Pages
    PERMISSIONS.VIEW_SESSIONS,
    PERMISSIONS.VIEW_PARTICIPANTS,
    PERMISSIONS.VIEW_PARTICIPANT_DETAIL,
    PERMISSIONS.VIEW_EVALUATIONS,

    // Actions métier
    PERMISSIONS.ADD_PARTICIPANTS_TO_SESSION,
    PERMISSIONS.ASSIGN_MENTORS_TO_SESSION,
    PERMISSIONS.ASSIGN_MENTORS_TO_TEAMS,
    PERMISSIONS.RELAUNCH_PARTICIPANTS_OR_MENTORS,
    PERMISSIONS.MONITOR_SESSION_COMPLETION,
    PERMISSIONS.GENERATE_SESSION_DOCUMENTS,
    PERMISSIONS.VIEW_ALL_EVALUATIONS,
    PERMISSIONS.VALIDATE_MENTOR_PROPOSALS,
  ],

  // 🔹 MENTOR = acteur opérationnel sur son équipe
  Mentor: [
    // Pages
    PERMISSIONS.VIEW_SESSIONS_READONLY,
    PERMISSIONS.VIEW_PARTICIPANTS_TEAM_ONLY,
    PERMISSIONS.VIEW_PARTICIPANT_DETAIL,
    PERMISSIONS.VIEW_EVALUATIONS,

    // Actions métier
    PERMISSIONS.EVALUATE_TEAM_PARTICIPANTS,
    PERMISSIONS.VIEW_TEAM_QCM_REFLECTIVE,
  ],
} as const;

export const getUserPermissions = (user?: User | null): readonly Permission[] => {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role] ?? [];
};

/**
 * Helper 1: permission unique.
 * Usage: `hasPermission(user, PERMISSIONS.DECIDE_JURY)`
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  return getUserPermissions(user).includes(permission);
};

/**
 * Helper 2: au moins une permission.
 * Usage: `hasAnyPermission(user, [PERMISSIONS.VIEW_JURY, PERMISSIONS.DECIDE_JURY])`
 */
export const hasAnyPermission = (user: User | null, permissions: readonly Permission[]): boolean => {
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Utile pour `ProtectedRoute` quand on veut exiger toutes les permissions.
 */
export const hasAllPermissions = (user: User | null, permissions: readonly Permission[]): boolean => {
  const userPermissions = getUserPermissions(user);
  return permissions.every((permission) => userPermissions.includes(permission));
};

/**
 * EXEMPLES (concrets) — à copier/coller dans vos composants
 *
 * 1) Protection d'une route DS/Mentors
 *    <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_SESSIONS]} requireAll={false}>
 *      ...
 *    </ProtectedRoute>
 *
 * 2) Vérification permission unique
 *    const canEvaluate = hasPermission(user, PERMISSIONS.EDIT_EVALUATIONS);
 *
 * 3) Désactivation d'un bouton métier
 *    const canEvaluate = hasPermission(user, PERMISSIONS.EDIT_EVALUATIONS);
 *    <button disabled={!canEvaluate} className={canEvaluate ? '...' : '... cursor-not-allowed'}>
 *      Évaluer participant
 *    </button>
 */
