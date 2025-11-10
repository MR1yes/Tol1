
import React, { useState } from 'react';
import type { Translations } from '../types';

interface ConfigScreenProps {
    onSaveUrl: (url: string) => void;
    translations: Translations;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ onSaveUrl, translations }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim().startsWith('https://script.google.com/macros/s/')) {
            onSaveUrl(url.trim());
        } else {
            alert(translations.urlRequired);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {translations.configTitle}
                </h1>
                <p className="text-slate-600 mb-6">
                    {translations.configInstructions}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="scriptUrl" className="sr-only">
                            {translations.appsScriptUrl}
                        </label>
                        <input
                            type="url"
                            id="scriptUrl"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-center"
                            placeholder={translations.appsScriptUrl}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                    >
                        {translations.saveUrl}
                    </button>
                </form>
            </div>
            <footer className="text-center mt-6 text-slate-500 text-sm">
                <p>Don't have a script? Follow the setup instructions in the `Code.gs` file.</p>
            </footer>
        </div>
    );
};

export default ConfigScreen;