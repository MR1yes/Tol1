
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DailyEntry, WorkerSummary, Language, Translations, WorkerProfile, PaymentStatus } from './types';
import { translations } from './constants';
import EntryForm from './components/EntryForm';
import DailyEntriesTable from './components/DailyEntriesTable';
import SummaryTable from './components/SummaryTable';
import { LanguageSwitcher } from './components/Buttons';
import { SettingsIcon, ChatIcon, UsersIcon, CloseIcon, CashMinusIcon, UsersGroupIcon, TrashIcon, CameraIcon } from './components/Icons';
import ConfigScreen from './components/ConfigScreen';
import Chatbot from './components/Chatbot';
import Toast from './components/Toast';

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

interface WorkerManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    workerProfiles: WorkerProfile[];
    onUpdateProfile: (profile: WorkerProfile) => void;
    onDeleteProfile: (workerName: string) => void;
    translations: Translations;
}

const WorkerManagerModal: React.FC<WorkerManagerModalProps> = ({ isOpen, onClose, workerProfiles, onUpdateProfile, onDeleteProfile, translations }) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>, workerName: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("File is too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            onUpdateProfile({ name: workerName, photo: base64 });
        };
        reader.onerror = () => alert("Could not read file.");
        reader.readAsDataURL(file);
    };

    const handleDelete = (workerName: string) => {
        if (window.confirm(translations.confirmDeleteWorker)) {
            onDeleteProfile(workerName);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">{translations.manageWorkers}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200"><CloseIcon /></button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {workerProfiles.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {workerProfiles.map(profile => (
                                <li key={profile.name} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        {profile.photo ? (
                                            <img className="h-12 w-12 rounded-full object-cover" src={profile.photo} alt={profile.name} />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                                {getWorkerInitials(profile.name)}
                                            </div>
                                        )}
                                        <span className="ms-4 font-medium text-slate-800">{profile.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            // FIX: The ref callback should not return a value. Using a block body to prevent implicit return.
                                            ref={el => { fileInputRefs.current[profile.name] = el; }}
                                            onChange={(e) => handlePhotoChange(e, profile.name)}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRefs.current[profile.name]?.click()}
                                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                                        >
                                            <CameraIcon /> {translations.changePhoto}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(profile.name)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                            title={translations.deleteWorker}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-center">{translations.noWorkersYet}</p>
                    )}
                </main>
                <footer className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

interface SalaryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    workers: string[];
    baseSalaries: { [key: string]: number };
    onSave: (salaries: { [key: string]: number }) => void;
    translations: Translations;
    workerProfiles: WorkerProfile[];
}

const SalaryManagerModal: React.FC<SalaryManagerModalProps> = ({ isOpen, onClose, workers, baseSalaries, onSave, translations, workerProfiles }) => {
    const [localSalaries, setLocalSalaries] = useState(baseSalaries);

    useEffect(() => {
        if (isOpen) setLocalSalaries(baseSalaries);
    }, [baseSalaries, isOpen]);

    const handleSalaryChange = (workerName: string, value: string) => {
        const salary = parseFloat(value);
        setLocalSalaries(prev => ({ ...prev, [workerName]: isNaN(salary) || salary < 0 ? 0 : salary }));
    };

    const handleSave = () => { onSave(localSalaries); onClose(); };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b"><h2 className="text-lg font-bold">{translations.manageSalaries}</h2><button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200"><CloseIcon /></button></header>
                <main className="p-6 overflow-y-auto">
                    {workers.length > 0 ? (
                        <div className="space-y-4">
                            {workers.map(worker => {
                                const profile = workerProfiles.find(p => p.name === worker);
                                return (
                                <div key={worker} className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                                    <div className="flex items-center">
                                         {profile?.photo ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={profile.photo} alt={profile.name} />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                                {getWorkerInitials(worker)}
                                            </div>
                                        )}
                                        <label htmlFor={`salary-${worker}`} className="font-medium text-slate-700 whitespace-nowrap ms-3">{worker}</label>
                                    </div>
                                    <div className="relative">
                                        <input type="number" id={`salary-${worker}`} value={localSalaries[worker] || ''} onChange={e => handleSalaryChange(worker, e.target.value)} className="w-32 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-end" placeholder="0.00" min="0" step="0.01" />
                                        <span className="absolute inset-y-0 end-3 flex items-center text-sm text-slate-500 pointer-events-none">{translations.currency}</span>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : <p className="text-slate-500 text-center">{translations.noSummary}</p>}
                </main>
                <footer className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg space-x-2 rtl:space-x-reverse">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800">{translations.saveSalaries}</button>
                </footer>
            </div>
        </div>
    );
};

interface AdvanceManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    workers: string[];
    advances: { [key: string]: number };
    onSave: (advances: { [key: string]: number }) => void;
    translations: Translations;
    workerProfiles: WorkerProfile[];
}

const AdvanceManagerModal: React.FC<AdvanceManagerModalProps> = ({ isOpen, onClose, workers, advances, onSave, translations, workerProfiles }) => {
    const [localAdvances, setLocalAdvances] = useState(advances);

    useEffect(() => { if (isOpen) setLocalAdvances(advances) }, [advances, isOpen]);

    const handleAdvanceChange = (workerName: string, value: string) => {
        const advance = parseFloat(value);
        setLocalAdvances(prev => ({ ...prev, [workerName]: isNaN(advance) || advance < 0 ? 0 : advance }));
    };

    const handleSave = () => { onSave(localAdvances); onClose(); };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b"><h2 className="text-lg font-bold">{translations.manageAdvances}</h2><button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200"><CloseIcon /></button></header>
                <main className="p-6 overflow-y-auto">
                     {workers.length > 0 ? (
                        <div className="space-y-4">
                            {workers.map(worker => {
                                const profile = workerProfiles.find(p => p.name === worker);
                                return (
                                <div key={worker} className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                                    <div className="flex items-center">
                                         {profile?.photo ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={profile.photo} alt={profile.name} />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                                {getWorkerInitials(worker)}
                                            </div>
                                        )}
                                        <label htmlFor={`advance-${worker}`} className="font-medium text-slate-700 whitespace-nowrap ms-3">{worker}</label>
                                    </div>
                                    <div className="relative">
                                        <input type="number" id={`advance-${worker}`} value={localAdvances[worker] || ''} onChange={e => handleAdvanceChange(worker, e.target.value)} className="w-32 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-end" placeholder="0.00" min="0" step="0.01" />
                                        <span className="absolute inset-y-0 end-3 flex items-center text-sm text-slate-500 pointer-events-none">{translations.currency}</span>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : <p className="text-slate-500 text-center">{translations.noSummary}</p>}
                </main>
                <footer className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg space-x-2 rtl:space-x-reverse">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800">{translations.saveAdvances}</button>
                </footer>
            </div>
        </div>
    );
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    workerName: string | null;
    currentStatus: PaymentStatus | undefined;
    onConfirm: (workerName: string, notes: string) => void;
    translations: Translations;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, workerName, currentStatus, onConfirm, translations }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNotes(currentStatus?.notes || '');
        }
    }, [isOpen, currentStatus]);

    if (!isOpen || !workerName) return null;

    const handleConfirm = () => {
        onConfirm(workerName, notes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">{translations.confirmPaymentTitle} - {workerName}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200"><CloseIcon /></button>
                </header>
                <main className="p-6">
                    <label htmlFor="paymentNotes" className="block text-sm font-medium text-slate-700">{translations.paymentNotes}</label>
                    <textarea
                        id="paymentNotes"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                        placeholder={translations.paymentNotesPlaceholder}
                    />
                </main>
                <footer className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg space-x-2 rtl:space-x-reverse">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
                    <button onClick={handleConfirm} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800">{translations.confirmAndSave}</button>
                </footer>
            </div>
        </div>
    );
};


const getLocalMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
};

const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');
    const [scriptUrl, setScriptUrl] = useState<string | null>(() => localStorage.getItem('scriptUrl') || 'https://script.google.com/macros/s/AKfycbxVlH_3zTnm7CK3qK49GrgtT_or3ku8JdUXMpIVqpf5EzOZow9hIbul0Qm8hk1DL9c/exec');
    const [workers, setWorkers] = useState<string[]>([]);
    const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
    const [rawSummaryData, setRawSummaryData] = useState<WorkerSummary[]>([]);
    const [summaryData, setSummaryData] = useState<WorkerSummary[]>([]);
    const [currentMonth, setCurrentMonth] = useState<string>(getLocalMonth()); // 'YYYY-MM'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [isWorkerManagerOpen, setIsWorkerManagerOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [workerProfiles, setWorkerProfiles] = useState<WorkerProfile[]>(() => {
        const saved = localStorage.getItem('workerProfiles');
        return saved ? JSON.parse(saved) : [];
    });
    const [baseSalaries, setBaseSalaries] = useState<{ [key: string]: number }>(() => {
        const saved = localStorage.getItem('baseSalaries');
        return saved ? JSON.parse(saved) : {};
    });
    const [advances, setAdvances] = useState<{ [key: string]: number }>(() => {
        const saved = localStorage.getItem('advances');
        return saved ? JSON.parse(saved) : {};
    });
    const [paymentStatuses, setPaymentStatuses] = useState<{ [month: string]: { [workerName: string]: PaymentStatus } }>(() => {
        const saved = localStorage.getItem('paymentStatuses');
        return saved ? JSON.parse(saved) : {};
    });
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; workerName: string | null }>({ isOpen: false, workerName: null });

    const currentTranslations = translations[language];

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.body.className = language === 'ar' ? 'font-cairo bg-slate-100' : 'font-sans bg-slate-100';
    }, [language]);
    
    useEffect(() => {
        localStorage.setItem('workerProfiles', JSON.stringify(workerProfiles));
    }, [workerProfiles]);
    
    useEffect(() => {
        try {
            localStorage.setItem('paymentStatuses', JSON.stringify(paymentStatuses));
        } catch (e) {
            console.error("Failed to save payment statuses to localStorage", e);
        }
    }, [paymentStatuses]);

    const fetchData = useCallback(async (month: string) => {
        if (!scriptUrl) return;
        setIsLoading(true);
        setError(null);
        try {
            const [summaryRes, entriesRes, workersRes] = await Promise.all([
                fetch(`${scriptUrl}?action=summary&month=${month}`),
                fetch(`${scriptUrl}?action=entries&month=${month}`),
                fetch(`${scriptUrl}?action=workers`)
            ]);

            if (!summaryRes.ok || !entriesRes.ok || !workersRes.ok) throw new Error(currentTranslations.apiError);
            
            const summaryJson = await summaryRes.json();
            const entriesJson = await entriesRes.json();
            const workersJson = await workersRes.json();

            const combinedError = summaryJson.error || entriesJson.error || workersJson.error;
            if (combinedError) {
                throw new Error(combinedError);
            }

            setRawSummaryData(summaryJson.rows || []);
            setDailyEntries(entriesJson.rows || []);
            setWorkers(workersJson.workers || []);
        } catch (err: any) {
             const errorMessage = err.message || String(err);
            const isEmptySheetError = errorMessage.includes('must be at least one') || errorMessage.includes('يجب ألا تقل الصفوف في النطاق عن صف واحد');
            if (isEmptySheetError) {
                console.warn("Handled empty sheet error. Displaying empty state.");
                setError(null); setRawSummaryData([]); setDailyEntries([]); setWorkers([]);
            } else {
                setError(errorMessage); setRawSummaryData([]); setDailyEntries([]); setWorkers([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [scriptUrl, currentTranslations.apiError]);
    
    useEffect(() => {
        const currentMonthStatuses = paymentStatuses[currentMonth] || {};
        const processed = rawSummaryData.map((s) => {
            const base = baseSalaries[s.workerName] || 0;
            const advance = advances[s.workerName] || 0;
            const paymentStatus = currentMonthStatuses[s.workerName];
            return {
                ...s,
                baseSalary: base,
                advance: advance,
                finalSalary: s.totalSalary + base - advance,
                paymentStatus
            };
        });
        setSummaryData(processed);
    }, [rawSummaryData, baseSalaries, advances, paymentStatuses, currentMonth]);


    useEffect(() => { fetchData(currentMonth); }, [currentMonth, fetchData]);

    const handleSaveUrl = (url: string) => { localStorage.setItem('scriptUrl', url); setScriptUrl(url); };
    
    const handleClearConfig = () => {
        if (window.confirm(currentTranslations.confirmClearConfig)) {
            localStorage.removeItem('scriptUrl');
            localStorage.removeItem('baseSalaries');
            localStorage.removeItem('advances');
            localStorage.removeItem('workerProfiles');
            localStorage.removeItem('paymentStatuses');
            setScriptUrl(null); setWorkers([]); setDailyEntries([]); setRawSummaryData([]);
            setBaseSalaries({}); setAdvances({}); setWorkerProfiles([]); setPaymentStatuses({});
        }
    }

    const handleSaveSalaries = (salaries: { [key: string]: number }) => { localStorage.setItem('baseSalaries', JSON.stringify(salaries)); setBaseSalaries(salaries); };
    const handleSaveAdvances = (advs: { [key: string]: number }) => { localStorage.setItem('advances', JSON.stringify(advs)); setAdvances(advs); };
    
    const handleUpdateWorkerProfile = (profile: WorkerProfile) => {
        setWorkerProfiles(prev => {
            const existing = prev.find(p => p.name === profile.name);
            if (existing) {
                return prev.map(p => p.name === profile.name ? { ...p, ...profile } : p);
            }
            return [...prev, profile];
        });
        setToast({ message: currentTranslations.workerProfileUpdated, type: 'success' });
    };

    const handleDeleteWorkerProfile = (workerName: string) => {
        setWorkerProfiles(prev => prev.filter(p => p.name !== workerName));
        setToast({ message: currentTranslations.workerProfileDeleted, type: 'success' });
    };

    const handleAddEntry = useCallback(async (entry: Omit<DailyEntry, 'id' | 'dailyTotal'>) => {
        if (!scriptUrl) return;
        try {
            // Add new worker to profiles if they don't exist
            if (!workerProfiles.some(p => p.name === entry.workerName)) {
                setWorkerProfiles(prev => [...prev, { name: entry.workerName }]);
            }

            await fetch(scriptUrl, {
                method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: entry.date, workerName: entry.workerName, items: entry.items, price: entry.price }),
            });
            await fetchData(entry.date.slice(0, 7));
            setToast({ message: currentTranslations.entryAddedSuccess, type: 'success' });
        } catch (err) {
            setToast({ message: currentTranslations.entryAddedError, type: 'error' });
        }
    }, [scriptUrl, fetchData, currentTranslations, workerProfiles]);

    const handleExport = useCallback(() => {
        const headers = [
            currentTranslations.workerName, currentTranslations.totalItems, currentTranslations.pieceworkSalary, 
            currentTranslations.baseSalary, currentTranslations.advance, currentTranslations.finalSalary,
            currentTranslations.paymentStatus, currentTranslations.paymentDate, currentTranslations.paymentNotesCSV
        ];
        const csvContent = [
            headers.join(','), 
            ...summaryData.map(item => [
                `"${item.workerName}"`, item.totalItems, item.totalSalary.toFixed(2), (item.baseSalary || 0).toFixed(2),
                (item.advance || 0).toFixed(2), (item.finalSalary || item.totalSalary).toFixed(2),
                item.paymentStatus ? currentTranslations.paid : currentTranslations.unpaid,
                item.paymentStatus?.paidDate || "",
                `"${item.paymentStatus?.notes.replace(/"/g, '""') || ""}"`
            ].join(','))
        ].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payroll_summary_${currentMonth}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, [summaryData, currentTranslations, currentMonth]);
    
    const handleOpenPaymentModal = (workerName: string) => { setPaymentModalState({ isOpen: true, workerName }); };
    const handleClosePaymentModal = () => { setPaymentModalState({ isOpen: false, workerName: null }); };

    const handleConfirmPayment = (workerName: string, notes: string) => {
        const today = new Date().toISOString().split('T')[0];
        const statusExisted = !!paymentStatuses[currentMonth]?.[workerName];

        setPaymentStatuses(prev => {
            const existingStatus = prev[currentMonth]?.[workerName];
            const newStatus = {
                paidDate: existingStatus?.paidDate || today,
                notes: notes,
            };
            return {
                ...prev,
                [currentMonth]: {
                    ...prev[currentMonth],
                    [workerName]: newStatus,
                },
            };
        });

        setToast({ message: statusExisted ? currentTranslations.notesSavedSuccess : currentTranslations.paymentMarkedSuccess, type: 'success' });
    };

    const handleUnmarkAsPaid = (workerName: string) => {
        if (window.confirm(currentTranslations.confirmUnmarkPayment)) {
            setPaymentStatuses(prev => {
                const monthStatuses = prev[currentMonth] || {};
                const { [workerName]: _, ...remainingStatuses } = monthStatuses;
                return {
                    ...prev,
                    [currentMonth]: remainingStatuses,
                };
            });
            setToast({ message: currentTranslations.paymentUnmarkedSuccess, type: 'success' });
        }
    };

    if (!scriptUrl) {
        return <ConfigScreen onSaveUrl={handleSaveUrl} translations={currentTranslations} />;
    }

    const activeWorkers = summaryData.map(s => s.workerName);

    return (
        <div className="min-h-screen text-slate-800 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">نظام حساب رواتب الخياطين<span className="text-slate-600 mx-2">-</span>Tailors Payroll System</h1>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                         <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                           <label htmlFor="month" className="text-sm font-medium text-slate-700 me-2">{currentTranslations.month}</label>
                           <input type="month" id="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500 text-sm"/>
                         </div>
                         <LanguageSwitcher language={language} setLanguage={setLanguage} />
                         <button onClick={() => setIsWorkerManagerOpen(true)} className="p-2 rounded-full text-slate-600 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm border border-slate-200" title={currentTranslations.manageWorkers}><UsersGroupIcon /></button>
                         <button onClick={() => setIsSalaryModalOpen(true)} className="p-2 rounded-full text-slate-600 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm border border-slate-200" title={currentTranslations.manageSalaries}><UsersIcon /></button>
                         <button onClick={() => setIsAdvanceModalOpen(true)} className="p-2 rounded-full text-slate-600 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm border border-slate-200" title={currentTranslations.manageAdvances}><CashMinusIcon /></button>
                         <button onClick={handleClearConfig} className="p-2 rounded-full text-slate-600 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm border border-slate-200" title={currentTranslations.changeConfig}><SettingsIcon/></button>
                    </div>
                </header>
                 {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>)}
                {isLoading && (<div className="text-center py-10"><p className="text-lg text-slate-600">{currentTranslations.loading}</p></div>)}
                {!isLoading && !error && (
                    <>
                        <div className="mb-8">
                            <EntryForm onAddEntry={handleAddEntry} translations={currentTranslations} workers={workers} workerProfiles={workerProfiles}/>
                        </div>
                        <main className="space-y-8">
                            <SummaryTable summary={summaryData} onExport={handleExport} translations={currentTranslations} workerProfiles={workerProfiles} onOpenPaymentModal={handleOpenPaymentModal} onUnmarkAsPaid={handleUnmarkAsPaid} />
                            <DailyEntriesTable entries={dailyEntries} translations={currentTranslations} workerProfiles={workerProfiles} />
                        </main>
                    </>
                )}
            </div>
            {!isLoading && scriptUrl && (
                <>
                    <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 end-6 bg-slate-700 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-transform hover:scale-110" aria-label={currentTranslations.openChat} title={currentTranslations.openChat}><ChatIcon /></button>
                    <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} summaryData={summaryData} dailyEntries={dailyEntries} translations={currentTranslations} currentMonth={currentMonth} baseSalaries={baseSalaries} advances={advances} />
                </>
            )}
            <PaymentModal isOpen={paymentModalState.isOpen} onClose={handleClosePaymentModal} workerName={paymentModalState.workerName} currentStatus={paymentModalState.workerName ? paymentStatuses[currentMonth]?.[paymentModalState.workerName] : undefined} onConfirm={handleConfirmPayment} translations={currentTranslations} />
            <WorkerManagerModal isOpen={isWorkerManagerOpen} onClose={() => setIsWorkerManagerOpen(false)} workerProfiles={workerProfiles} onUpdateProfile={handleUpdateWorkerProfile} onDeleteProfile={handleDeleteWorkerProfile} translations={currentTranslations} />
            <SalaryManagerModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} workers={activeWorkers} baseSalaries={baseSalaries} onSave={handleSaveSalaries} translations={currentTranslations} workerProfiles={workerProfiles} />
            <AdvanceManagerModal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} workers={activeWorkers} advances={advances} onSave={handleSaveAdvances} translations={currentTranslations} workerProfiles={workerProfiles} />
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        </div>
    );
};

export default App;