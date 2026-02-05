import React from 'react';
import { Alert } from '@/lib/types';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface AlertCardProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700',
  },
  error: {
    icon: XCircleIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
  },
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
  },
};

export default function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.titleColor}`}>{alert.title}</h3>
          <p className={`mt-1 text-sm ${config.textColor}`}>{alert.message}</p>
          <p className="mt-2 text-xs text-gray-500">
            {new Date(alert.createdAt).toLocaleString('fr-FR')}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            aria-label="Fermer l'alerte"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
