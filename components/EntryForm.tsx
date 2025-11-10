import React, { useState } from 'react';
import type { DailyEntry, Translations, WorkerProfile } from '../types';

interface EntryFormProps {
  onAddEntry: (entry: Omit<DailyEntry, 'id' | 'dailyTotal'>) => void;
  translations: Translations;
  workers: string[];
  workerProfiles: WorkerProfile[];
}

const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry, translations, workers, workerProfiles }) => {
  const [workerName, setWorkerName] = useState('');
  const [date, setDate] = useState(getLocalDate());
  const [items, setItems] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const itemsNum = parseFloat(items);
    const priceNum = parseFloat(price);

    if (!workerName.trim()) {
      alert(translations.formValidation.workerName);
      setIsSubmitting(false);
      return;
    }
    if (!date) {
      alert(translations.formValidation.date);
      setIsSubmitting(false);
      return;
    }
    if (isNaN(itemsNum) || itemsNum <= 0) {
      alert(translations.formValidation.items);
      setIsSubmitting(false);
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) { // Price can be 0
      alert(translations.formValidation.price);
      setIsSubmitting(false);
      return;
    }
    
    await onAddEntry({ workerName: workerName.trim(), date, items: itemsNum, price: priceNum });
    setWorkerName('');
    setItems('');
    setPrice('');
    setIsSubmitting(false);
  };

  const dailyTotal = (parseFloat(items) || 0) * (parseFloat(price) || 0);

  const uniqueWorkersForDatalist = [...new Set([...workers, ...workerProfiles.map(p => p.name)])];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-slate-800">{translations.addEntry}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="workerName" className="block text-sm font-medium text-slate-700">{translations.workerName}</label>
          <input
            type="text"
            id="workerName"
            list="workers-list"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            required
            autoComplete="off"
          />
          <datalist id="workers-list">
            {uniqueWorkersForDatalist.map(w => <option key={w} value={w} />)}
          </datalist>
        </div>

        {workerProfiles.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{translations.quickSelect}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {workerProfiles.map(profile => (
                <button
                  type="button"
                  key={profile.name}
                  onClick={() => setWorkerName(profile.name)}
                  className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  {profile.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">{translations.date}</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="items" className="block text-sm font-medium text-slate-700">{translations.itemsDelivered}</label>
          <input
            type="number"
            id="items"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            min="1"
            step="1"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700">{`${translations.pricePerItem} (${translations.currency})`}</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="pt-2 text-lg font-semibold text-slate-700">
            {translations.dailyTotal}: <span className="text-slate-800 font-bold">{dailyTotal.toFixed(2)} {translations.currency}</span>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:bg-slate-400"
        >
          {isSubmitting ? translations.loading : translations.submit}
        </button>
      </form>
    </div>
  );
};

export default EntryForm;