'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AttribuerNotesReflexives from '@/components/AttribuerNotesReflexives';
import {
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  HomeIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type MenuItem = {
  id: string;
  name: string;
  href?: string;
  iframeSrc?: string;
  icon: typeof UserIcon;
  description: string;
  isInternalComponent?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 'fichier-participants-inscriptions',
    name: 'Fichier participants_ Inscriptions',
    href: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrvNQmEw2DqKdYHp',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrvNQmEw2DqKdYHp',
    icon: HomeIcon,
    description: 'Accès au tableau de bord principal',
  },
  {
    id: 'qcm',
    name: 'QCM',
    href: 'https://airtable.com/appFxs2dtqdiAbGVM/shrZccpIj87PQ6BKA',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrZccpIj87PQ6BKA',
    icon: ClipboardDocumentCheckIcon,
    description: 'Gestion des questionnaires à choix multiples',
  },
  {
    id: 'synthese-reflexive',
    name: 'Synthèse Réflexive - vue globale',
    href: 'https://airtable.com/appFxs2dtqdiAbGVM/shriKy3UGi3dTnCUE4',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shriKy3UGi3dTnCUE',
    icon: DocumentTextIcon,
    description: 'Vue globale des synthèses réflexives',
  },
  {
    id: 'attribuer-notes-reflexives',
    name: 'Attribuer des notes réflexives',
    icon: PencilSquareIcon,
    description: 'Attribution des notes réflexives aux participants',
    isInternalComponent: true,
  },
  {
    id: 'TB-Evaluation-Reflexive',
    name: 'TB_Evaluation_Reflexive',
    href: 'https://airtable.com/appFxs2dtqdiAbGVM/shrH0qvZDsbKyyv5l',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrH0qvZDsbKyyv5l',
    icon: HomeIcon,
    description: 'Accès au tableau de bord principal',
  },
  {
    id: 'suivi-session',
    name: 'Suivi Session - NPS & Résultats',
    href: 'https://airtable.com/appFxs2dtqdiAbGVM/shrr2EiQVREFVVlrH',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrr2EiQVREFVVlrH',
    icon: ChartBarIcon,
    description: 'Suivi des sessions avec NPS et résultats',
  },
  {
    id: 'evaluation-experientielle',
    name: 'Évaluation Expérientielle',
    href: 'https://airtable.com/appFxs2dtqdiAbGVM/shrDjxW2JE6fytFxJ',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrDjxW2JE6fytFxJ',
    icon: AcademicCapIcon,
    description: 'Gestion des évaluations expérientielles',
  },
  {
    id: 'recap-note',
    name: 'Recap Note',
    href: 'https://airtable.com/appFxs2dtqdiAbGVM/shrN4SJBtNKrcVK0K',
    iframeSrc: 'https://airtable.com/embed/appFxs2dtqdiAbGVM/shrN4SJBtNKrcVK0K',
    icon: DocumentTextIcon,
    description: 'Récapitulatif des notes',
  },
];

export default function DSMentorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const embedMode = searchParams.get('embed') === 'true';
  const viewParam = searchParams.get('view');
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(
    viewParam ? menuItems.find(item => item.id === viewParam) || null : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState<string>('');

  // Charger le nom de l'utilisateur
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserName(data.intervenant?.name || data.intervenant?.email || '');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (selectedItem && !selectedItem.isInternalComponent) {
      setIsLoading(true);
    }
  }, [selectedItem]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleMenuClick = (item: MenuItem) => {
    setSelectedItem(item);
    window.history.pushState({}, '', `?view=${item.id}`);
  };

  const handleClose = () => {
    setSelectedItem(null);
    window.history.pushState({}, '', '/ds-mentors');
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .finally(() => router.push('/login'));
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80 md:w-96' : 'w-0'} bg-slate-800 text-white flex flex-col transition-all duration-300 overflow-hidden`}>
          {/* Header */}
          <div className="h-14 bg-slate-900 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg whitespace-nowrap">SCYFCO</span>
            </div>
            <button 
              className="p-1 hover:bg-slate-800 rounded"
              aria-label="Menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto pt-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors text-left
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="whitespace-normal break-words">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bouton de déconnexion */}
          <div className="border-t border-slate-700 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors text-left text-gray-300 hover:bg-slate-700 hover:text-white"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toggle button when sidebar is closed */}
          {!sidebarOpen && (
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
          
          {selectedItem ? (
            <>
              {/* Header bar */}
              <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <selectedItem.icon className="h-5 w-5 text-gray-600" />
                  <h1 className="font-semibold text-gray-900">{selectedItem.name}</h1>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Fermer"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white overflow-hidden relative">
                {selectedItem.isInternalComponent ? (
                  selectedItem.id === 'attribuer-notes-reflexives' ? (
                    <AttribuerNotesReflexives />
                  ) : null
                ) : (
                  <>
                    {isLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                          <p className="mt-4 text-gray-600">Chargement...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={selectedItem.iframeSrc}
                      className="w-full h-full border-0"
                      onLoad={handleIframeLoad}
                      title={selectedItem.name}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center max-w-2xl px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bienvenue {userName}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Accédez à l'ensemble de vos outils de certification depuis le menu de navigation. 
                  Gérez les inscriptions, suivez les évaluations, attribuez les notes réflexives 
                  et consultez les résultats de vos sessions de formation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
