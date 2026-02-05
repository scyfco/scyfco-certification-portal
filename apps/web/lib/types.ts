// Types pour le portail SCYFCO - Interface DS/Mentors

export type UserRole = 'DS' | 'Mentor';

export type SessionStatus = 'En cours' | 'Planifiée' | 'Terminée' | 'Annulée';

export type ParticipantStatus = 'Actif' | 'En attente' | 'Certifié' | 'Non certifié' | 'Abandon';

export type EvaluationStatus = 'À compléter' | 'En cours' | 'Complète' | 'Validée';

export type DecisionStatus = 'En attente' | 'Validé' | 'Refusé' | 'En révision';

export type DocumentType = 'Certificat' | 'Attestation' | 'Feuille de présence' | 'Rapport' | 'Contrat';

export type InscriptionStatus = 'Inscrit' | 'Actif' | 'Certifié' | 'Non certifié' | 'Abandon';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Equipe {
  id: string;
  nom: string;
  sessionId: string;
  mentorId: string;
  description?: string;
}

export interface Inscription {
  id: string;
  participantId: string;
  sessionId: string;
  equipeId: string;
  status: InscriptionStatus;
  dateInscription: string;
  qcmScore?: number;
  qcmStatus: EvaluationStatus;
  reflectiveStatus: EvaluationStatus;
  experientialStatus: EvaluationStatus;
  decisionStatus: DecisionStatus;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  status: SessionStatus;
  startDate: string;
  endDate: string;
  location: string;
  nps?: number;
  completionRate?: number;
  participantCount: number;
  mentorId: string;
  dsId: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sessionId: string;
  teamName?: string;
  status: ParticipantStatus;
  qcmScore?: number;
  qcmStatus: EvaluationStatus;
  reflectiveStatus: EvaluationStatus;
  experientialStatus: EvaluationStatus;
  decisionStatus: DecisionStatus;
  enrollmentDate: string;
  avatar?: string;
}

export interface QCMEvaluation {
  id: string;
  participantId: string;
  score: number;
  maxScore: number;
  completedAt?: string;
  questions: QCMQuestion[];
}

export interface QCMQuestion {
  id: string;
  question: string;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect?: boolean;
}

export interface ReflectiveEvaluation {
  id: string;
  participantId: string;
  status: EvaluationStatus;
  submittedAt?: string;
  responses: ReflectiveResponse[];
}

export interface ReflectiveResponse {
  id: string;
  question: string;
  answer: string;
  mentorComment?: string;
}

export interface ExperientialEvaluation {
  id: string;
  participantId: string;
  status: EvaluationStatus;
  evaluatedAt?: string;
  criteria: ExperientialCriteria[];
  overallScore?: number;
}

export interface ExperientialCriteria {
  id: string;
  name: string;
  description: string;
  score?: number;
  maxScore: number;
  comment?: string;
}

export interface JuryDecision {
  id: string;
  participantId: string;
  status: DecisionStatus;
  submittedAt?: string;
  validatedAt?: string;
  decision?: 'Certifié' | 'Non certifié' | 'En révision';
  juryMember?: string;
  comments?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  participantId?: string;
  sessionId?: string;
  generatedAt: string;
  generatedBy: string;
  url: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardStats {
  activeSessions: number;
  pendingEvaluations: number;
  pendingJuryDecisions: number;
  totalParticipants: number;
  certificationRate: number;
  averageNPS: number;
}
