'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AttribuerNotesReflexives from '@/components/AttribuerNotesReflexives';
import ConfirmDialog from '@/components/ConfirmDialog';
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
  iframeSrc?: string;
  icon: typeof UserIcon;
  description: string;
  isInternalComponent?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 'fichier-participants-inscriptions',
    name: 'Fichier participants inscriptions',
    iframeSrc: 'https://airtable.com/embed/appHPKxQTpdh4SBfs/shrx3vaPZWOyZW9k7',
    icon: HomeIcon,
    description: 'Accès au tableau de bord principal',
  },
  {
    id: 'qcm',
    name: 'QCM',
    iframeSrc: 'https://airtable.com/embed/appHPKxQTpdh4SBfs/shr2A0RUxugJ2vN9N',
    icon: ClipboardDocumentCheckIcon,
    description: 'Gestion des questionnaires à choix multiples',
  },
  {
    id: 'synthese-reflexive',
    name: 'Synthèse réflexive - vue globale',
    iframeSrc: 'https://airtable.com/embed/appHPKxQTpdh4SBfs/shrnCQ7kPHCDW7UyF',
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
    name: 'TB Evaluation réflexive',
    iframeSrc: 'https://airtable.com/embed/appHPKxQTpdh4SBfs/shrRit8BpYyc9Y34L',
    icon: HomeIcon,
    description: 'Accès au tableau de bord principal',
  },
  {
    id: 'evaluation-experientielle',
    name: 'Évaluation experientielle ',
    iframeSrc: 'https://airtable.com/embed/appHPKxQTpdh4SBfs/shrSpQXFuAcIN4UeP',
    icon: AcademicCapIcon,
    description: 'Gestion des évaluations expérientielles',
  },  
  {
    id: 'recap-note',
    name: 'Récap Note',
    iframeSrc: 'https://airtable.com/embed/appHPKxQTpdh4SBfs/shrdANBS0Gw4qok1r',
    icon: DocumentTextIcon,
    description: 'Récapitulatif des notes',
  },
];

export default function DSMentorsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const embedMode = searchParams.get('embed') === 'true';
  const viewParam = searchParams.get('view');
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(
    viewParam ? menuItems.find(item => item.id === viewParam) || null : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Charger le nom de l'utilisateur
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const firstName = data.intervenant?.firstName?.trim();
          const lastName = data.intervenant?.name?.trim();
          const displayName = firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || data.intervenant?.email || '';
          setUserName(displayName);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setSidebarOpen(true);
    }
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
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setIsLoggingOut(true);
    fetch('/api/auth/logout', { method: 'POST' })
      .finally(() => router.push('/login'));
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 relative">
        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-30 w-80 max-w-[85vw] bg-slate-800 text-white flex flex-col
            transform transition-transform duration-300 overflow-hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:static md:translate-x-0 md:max-w-none md:transition-none
            ${sidebarOpen ? 'md:w-96' : 'md:w-0'}
          `}
        >
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

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

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

        <ConfirmDialog
          open={isLogoutDialogOpen}
          title="Confirmer la déconnexion"
          message="Voulez-vous vraiment vous déconnecter ?"
          confirmLabel="Se déconnecter"
          loading={isLoggingOut}
          onConfirm={confirmLogout}
          onCancel={() => {
            if (isLoggingOut) return;
            setIsLogoutDialogOpen(false);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
