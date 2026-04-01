'use client';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

type Session = {
  id: string;
  name: string;
  date: string;
  status: string;
  participants: string[];
};

type Participant = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  noteReflexive: number | null;
};

type ParticipantsListProps = {
  selectedSession: Session;
  participants: Participant[];
  notes: { [key: string]: number | null };
  loading: boolean;
  pendingCount: number;
  isBatchSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onUpdateNote: (participantId: string, value: number | null) => void;
  onOpenDetails: (participant: Participant) => void;
};

export default function ParticipantsList({
  selectedSession,
  participants,
  notes,
  loading,
  pendingCount,
  isBatchSaving,
  onBack,
  onSave,
  onUpdateNote,
  onOpenDetails,
}: ParticipantsListProps) {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Retour aux sessions</span>
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              {selectedSession.name}
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Consultez les réponses des participants aux évaluations réflexives et attribuez une note sur 100.
              Cliquez sur "Ouvrir" pour lire l'évaluation complète d'un participant avant d'attribuer sa note.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Chargement des participants...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun participant dans cette session</p>
          </div>
        ) : (
          <>
            {pendingCount > 0 && (
              <div className="mb-4 flex">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isBatchSaving}
                  className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer sm:w-auto sm:ml-auto"
                >
                  {isBatchSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Enregistrer {pendingCount} modification{pendingCount > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="p-4 sm:p-5 flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {participant.firstName} {participant.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onOpenDetails(participant)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors active:scale-[0.99] cursor-pointer shrink-0"
                        >
                          Ouvrir
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{participant.email}</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                        <label
                          htmlFor={`note-${participant.id}`}
                          className="text-sm font-medium text-gray-700 sm:whitespace-nowrap"
                        >
                          Note réflexive
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id={`note-${participant.id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={notes[participant.id] ?? ''}
                            onChange={(e) =>
                              onUpdateNote(
                                participant.id,
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            placeholder="0-100"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                          <span className="text-sm text-gray-500">/ 100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
