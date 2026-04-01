'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReflexiveNotes, type Participant } from '@/hooks/useReflexiveNotes';
import SessionsList from '@/components/reflexive-notes/SessionsList';
import ParticipantsList from '@/components/reflexive-notes/ParticipantsList';
import ParticipantDetailsModal from '@/components/reflexive-notes/ParticipantDetailsModal';

export default function AttribuerNotesReflexives() {
  const router = useRouter();

  const handleUnauthorized = useCallback(() => {
    router.push('/login');
  }, [router]);

  const {
    step,
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
  } = useReflexiveNotes(handleUnauthorized);

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {error && (
        <div className="mx-auto max-w-5xl px-4 pt-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}
      {step === 'sessions' && (
        <SessionsList
          sessions={sessions}
          onSelect={handleSelectSession}
        />
      )}

      {step === 'participants' && selectedSession && (
        <ParticipantsList
          selectedSession={selectedSession}
          participants={participants}
          notes={notes}
          loading={loading}
          pendingCount={pendingUpdates.size}
          isBatchSaving={isBatchSaving}
          onBack={handleBackToSessions}
          onSave={handleSaveAllNotes}
          onUpdateNote={updateNote}
          onOpenDetails={(participant) => {
            setSelectedParticipant(participant);
            setShowDetailsModal(true);
          }}
        />
      )}

      {showDetailsModal && selectedParticipant && (
        <ParticipantDetailsModal
          participant={selectedParticipant}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedParticipant(null);
          }}
        />
      )}
    </div>
  );
}
