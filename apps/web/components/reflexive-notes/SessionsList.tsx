'use client';

import { ArrowRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

type Session = {
  id: string;
  name: string;
  date: string;
  status: string;
  participants: string[];
};

type SessionsListProps = {
  sessions: Session[];
  onSelect: (session: Session) => void;
};

export default function SessionsList({ sessions, onSelect }: SessionsListProps) {
  return (
    <div className="pt-4 px-6">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Vos Sessions</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune session trouvée</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelect(session)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <CalendarIcon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {session.name}
                    </h3>
                    {session.date && (
                      <p className="text-sm text-gray-500 mt-1">{session.date}</p>
                    )}
                    {session.status && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {session.status}
                      </span>
                    )}
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
