import React from 'react';
import type { WorkerSummary, Translations, WorkerProfile } from '../types';
// FIX: Import `TrashIcon` instead of the unused `CloseIcon`.
import { ExportIcon, CheckCircleIcon, PencilIcon, TrashIcon } from './Icons';

interface SummaryTableProps {
  summary: WorkerSummary[];
  onExport: () => void;
  translations: Translations;
  workerProfiles: WorkerProfile[];
  onOpenPaymentModal: (workerName: string) => void;
  onUnmarkAsPaid: (workerName: string) => void;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ summary, onExport, translations, workerProfiles, onOpenPaymentModal, onUnmarkAsPaid }) => {
  const getWorkerInitials = (name: string): string => {
    if (typeof name !== 'string' || !name) {
        return '??';
    }
    const nameParts = name.trim().split(' ').filter(Boolean); // filter out empty strings from multiple spaces
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
    }
    return '??';
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">{translations.monthlySummary}</h2>
        {summary.length > 0 && (
          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <ExportIcon />
            <span className="ms-2">{translations.exportToCSV}</span>
          </button>
        )}
      </div>
      {summary.length === 0 ? (
        <p className="text-slate-500 text-center py-4">{translations.noSummary}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.workerName}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.totalItems}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.pieceworkSalary}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.baseSalary}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.advance}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.finalSalary}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {summary.map((item) => {
                const profile = workerProfiles.find(p => p.name === item.workerName);
                const status = item.paymentStatus;
                return (
                  <tr key={item.workerName} className={`hover:bg-slate-50 ${status ? 'bg-teal-50/50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                           {profile?.photo ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={profile.photo} alt={item.workerName} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                              {getWorkerInitials(item.workerName)}
                            </div>
                          )}
                        </div>
                        <div className="ms-4">
                          <div className="text-sm font-medium text-slate-900">{item.workerName}</div>
                          {status?.notes && <div className="text-xs text-slate-500" title={status.notes}>{translations.paymentNotes}: {status.notes.substring(0, 20)}{status.notes.length > 20 ? '...' : ''}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.totalItems}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.totalSalary.toFixed(2)} {translations.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(item.baseSalary || 0).toFixed(2)} {translations.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{(item.advance || 0).toFixed(2)} {translations.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{(item.finalSalary || item.totalSalary).toFixed(2)} {translations.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {status ? (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="flex items-center text-sm text-teal-700 font-medium" title={`${translations.paidOn} ${status.paidDate}`}>
                                <CheckCircleIcon />
                                <span className="ms-1.5 hidden sm:inline">{status.paidDate}</span>
                            </span>
                            <button onClick={() => onOpenPaymentModal(item.workerName)} className="p-1.5 text-slate-500 hover:text-slate-600 rounded-full hover:bg-slate-200" title={translations.editNotes}>
                                <PencilIcon />
                            </button>
                            <button onClick={() => onUnmarkAsPaid(item.workerName)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-200" title={translations.unmarkAsPaid}>
                                <TrashIcon />
                            </button>
                            </div>
                        ) : (
                            <button
                            onClick={() => onOpenPaymentModal(item.workerName)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800"
                            >
                            {translations.markAsPaid}
                            </button>
                        )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SummaryTable;