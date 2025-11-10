
import React from 'react';
import type { Language } from '../types';
import { GlobeIcon } from './Icons';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-full text-slate-600 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm border border-slate-200"
      aria-label="Switch Language"
      title="Switch Language / تغيير اللغة"
    >
      <GlobeIcon />
      <span className="sr-only">Switch Language</span>
    </button>
  );
};