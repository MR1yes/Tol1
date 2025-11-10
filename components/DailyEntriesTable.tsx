import React from 'react';
import type { DailyEntry, Translations, WorkerProfile } from '../types';

interface DailyEntriesTableProps {
  entries: DailyEntry[];
  translations: Translations;
  workerProfiles: WorkerProfile[];
}

const DailyEntriesTable: React.FC<DailyEntriesTableProps> = ({ entries, translations, workerProfiles }) => {
  
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
      <h2 className="text-xl font-bold mb-4 text-slate-800">{translations.dailyLog}</h2>
      {entries.length === 0 ? (
        <p className="text-slate-500 text-center py-4">{translations.noEntries}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.date}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.workerName}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.itemsDelivered}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.pricePerItem}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{translations.dailyTotal}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {entries.map((entry) => {
                const profile = workerProfiles.find(p => p.name === entry.workerName);
                return (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{entry.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {profile?.photo ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={profile.photo} alt={entry.workerName} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {getWorkerInitials(entry.workerName)}
                          </div>
                        )}
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-slate-900">{entry.workerName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{entry.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{entry.price.toFixed(2)} {translations.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{entry.dailyTotal.toFixed(2)} {translations.currency}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DailyEntriesTable;