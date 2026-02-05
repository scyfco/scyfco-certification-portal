'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

type ParticipantDetails = {
  id: string;
  name: string;
  firstName: string;
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

type ParticipantDetailsModalProps = {
  participant: ParticipantDetails;
  onClose: () => void;
};

export default function ParticipantDetailsModal({ participant, onClose }: ParticipantDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Évaluation réflexive
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {participant.firstName} {participant.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 bg-gray-50">
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <QuestionBlock
                question="Analyser et prévenir les risques liés à une situation complexe"
                answer={participant.analyserPrevenir}
              />
              <QuestionBlock
                question="Définir un plan d'action collectif dans un environnement complexe"
                answer={participant.definirPlan}
              />
              <QuestionBlock
                question="Gérer les relations entre les parties prenantes dans le cadre du pilotage d'un projet complexe"
                answer={participant.gererRelations}
              />
              <QuestionBlock
                question="Les apports de la formation pour votre activité sont"
                answer={participant.apportsFormation}
              />
              <QuestionBlock
                question="La qualité de l'animation de la formation est"
                answer={participant.qualiteAnimation}
              />
              <QuestionBlock
                question="La qualité des conditions matérielles est selon vous"
                answer={participant.qualiteConditions}
              />
              <QuestionBlock
                question="A l'issue de la session, vous êtes"
                answer={participant.aLissue}
              />
              <QuestionBlock
                question="Quelle est la probabilité que vous recommandiez SCYFCO à un ami / collègue / collaborateur ou membre de la famille ?"
                answer={participant.probabiliteRecommandation}
                isNPS
              />
              <QuestionBlock
                question="Seriez-vous intéressé par une autre action de formation ?"
                answer={participant.interetAutreFormation}
              />
              <QuestionBlock
                question="Autorisez-vous SCYFCO à vous contacter afin de répondre à votre demande?"
                answer={participant.autorisationContact}
              />
              <QuestionBlock
                question="Quels seraient, selon vous, les points d'amélioration de la formation?"
                answer={participant.pointsAmelioration}
              />
              <QuestionBlock
                question="Quels outils ou principes pensez-vous mettre en application, demain, dans votre contexte professionnel ?"
                answer={participant.outilsPrincipes}
              />
              <QuestionBlock
                question="Votre témoignage - Libre expression"
                answer={participant.temoignage}
              />
              <QuestionBlock
                question="Qu'avez-vous appris sur l'analyse des situations complexes (Méthodes, outils...)?"
                answer={participant.apprisAnalyse}
              />
              <QuestionBlock
                question="Qu'avez-vous appris sur la prise de décision en situation complexe (Méthodes, outils...)?"
                answer={participant.apprisPriseDecision}
              />
              <QuestionBlock
                question="Quelles sont, selon vous, vos pistes personnelles d'amélioration?"
                answer={participant.pistesAmelioration}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionBlock({
  question,
  answer,
  isNPS = false,
}: {
  question: string;
  answer?: string;
  isNPS?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Question
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {question}
      </p>
      <div className="mt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Réponse
        </div>
        <div className="mt-1 rounded-md border border-gray-200 bg-white p-3 text-gray-900">
          {answer ? (
            isNPS ? (
              <div className="inline-flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600">{answer}</span>
                <span className="text-sm text-gray-500">/ 10</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
            )
          ) : (
            <span className="text-gray-400 italic text-sm">Non renseigné</span>
          )}
        </div>
      </div>
    </div>
  );
}
