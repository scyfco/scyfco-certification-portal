'use client';

import { useCallback, useEffect, useState } from 'react';

export type Intervenant = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  sessions: string[];
  equipe: string;
};

export type Session = {
  id: string;
  name: string;
  date: string;
  status: string;
  participants: string[];
};

export type Participant = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  noteReflexive: number | null;
  analyserPrevenir?: string;
  definirPlan?: string;
  gererRelations?: string;
  apportsFormation?: string;
  qualiteAnimation?: string;
  qualiteConditions?: string;
  aLissue?: string;
  probabiliteRecommandation?: string;
  interetAutreFormation?: string;
  autorisationContact?: string;
  pointsAmelioration?: string;
  outilsPrincipes?: string;
  temoignage?: string;
  apprisAnalyse?: string;
  apprisPriseDecision?: string;
  pistesAmelioration?: string;
};

export type Step = 'sessions' | 'participants' | 'success';

const getErrorMessage = (status: number, serverMessage?: string) => {
  if (status === 401 || status === 403) {
    return 'Accès refusé. Veuillez vous reconnecter.';
  }
  return serverMessage || 'Erreur serveur.';
};

export const useReflexiveNotes = (onUnauthorized?: () => void) => {
  const [step, setStep] = useState<Step>('sessions');
  const [intervenant, setIntervenant] = useState<Intervenant | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: number | null }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  const fetchSessions = useCallback(async (sessionIds: string[]) => {
    try {
      const url = sessionIds.length > 0 
        ? `/api/airtable/sessions?ids=${sessionIds.join(',')}` 
        : '/api/airtable/sessions';
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setSessions(data.sessions);
        setError('');
      } else {
        const message = getErrorMessage(response.status, data?.error);
        setError(message);
        if (response.status === 401 || response.status === 403) {
          onUnauthorized?.();
        }
      }
    } catch (err) {
      setError('Erreur de chargement des sessions');
    }
  }, [onUnauthorized]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(getErrorMessage(response.status, data?.error));
          onUnauthorized?.();
          return;
        }
        const data = await response.json();
        setIntervenant(data.intervenant);
        fetchSessions(data.intervenant.sessions || []);
      } catch (err) {
        setError('Erreur de connexion au serveur');
        onUnauthorized?.();
      }
    };

    loadSession();
  }, [fetchSessions, onUnauthorized]);

  const handleSelectSession = useCallback(async (session: Session) => {
    setSelectedSession(session);
    setLoading(true);

    try {
      const url = `/api/airtable/participants?sessionName=${encodeURIComponent(session.name)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setParticipants(data.participants);
        setError('');
        const initialNotes: { [key: string]: number | null } = {};
        data.participants.forEach((p: Participant) => {
          initialNotes[p.id] = p.noteReflexive;
        });
        setNotes(initialNotes);
        setStep('participants');
      } else {
        const message = getErrorMessage(response.status, data?.error);
        setError(message);
        if (response.status === 401 || response.status === 403) {
          onUnauthorized?.();
        }
      }
    } catch (err) {
      setError('Erreur de chargement des participants');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  const executeBatchSave = useCallback(async () => {
    if (pendingUpdates.size === 0) {
      alert('Aucune modification à enregistrer');
      return;
    }

    setIsBatchSaving(true);
    const updates = Array.from(pendingUpdates).map((id) => ({
      participantId: id,
      note: notes[id],
    }));

    try {
      const response = await fetch('/api/airtable/notes-batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setParticipants((prev) =>
          prev.map((p) => {
            const update = updates.find((u) => u.participantId === p.id);
            return update ? { ...p, noteReflexive: update.note } : p;
          })
        );

        setPendingUpdates(new Set());
        setError('');
      } else {
        const firstError = result?.results?.find((r: { success: boolean }) => !r.success)?.error;
        const errorDetail = firstError?.details || firstError?.message || firstError?.type || '';
        const message =
          `Erreur lors de la sauvegarde: ${result.errorCount} échec(s) sur ${result.totalUpdates}` +
          (errorDetail ? ` Détail: ${errorDetail}` : '');
        setError(message);
      }
    } catch (err) {
      setError('Erreur de connexion lors de la sauvegarde');
    } finally {
      setIsBatchSaving(false);
    }
  }, [notes, pendingUpdates]);

  const handleSaveAllNotes = useCallback(async () => {
    await executeBatchSave();
  }, [executeBatchSave]);

  const updateNote = useCallback((participantId: string, value: number | null) => {
    setNotes((prev) => ({
      ...prev,
      [participantId]: value,
    }));

    setPendingUpdates((prev) => new Set([...prev, participantId]));
  }, []);

  const handleBackToSessions = useCallback(() => {
    setSelectedSession(null);
    setParticipants([]);
    setNotes({});
    setPendingUpdates(new Set());
    setStep('sessions');
  }, []);

  return {
    step,
    intervenant,
    sessions,
    selectedSession,
    participants,
    notes,
    loading,
    error,
    pendingUpdates,
    isBatchSaving,
    handleSelectSession,
    handleSaveAllNotes,
    updateNote,
    handleBackToSessions,
  };
};
