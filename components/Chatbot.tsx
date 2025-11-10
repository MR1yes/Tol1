import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Translations, ChatMessage, WorkerSummary, DailyEntry } from '../types';
import { CloseIcon, SendIcon } from './Icons';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    summaryData: WorkerSummary[];
    dailyEntries: DailyEntry[];
    translations: Translations;
    currentMonth: string;
    baseSalaries: { [key: string]: number };
    advances: { [key: string]: number };
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, summaryData, dailyEntries, translations, currentMonth, baseSalaries, advances }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { role: 'model', content: `Hello! I'm your AI Payroll Assistant. You can ask me anything about the data for ${currentMonth}.` }
            ]);
        }
    }, [isOpen, currentMonth]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const getAiResponse = async (userInput: string) => {
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: userInput }]);
        setInput('');

        try {
            const systemInstruction = `You are a helpful payroll data analyst for a tailoring business. You will be given payroll data in JSON format for a specific month. The final salary for a worker is calculated by adding their piecework salary to their base salary and then subtracting any advances. Answer the user's questions based ONLY on the provided data. Format your answers clearly and concisely. If the data is empty, inform the user they need to add entries first. All monetary values are in ${translations.currency}. Your response should be in the same language as the user's question.`;

            const dataContext = `The data is for the month: ${currentMonth}.
            \n\nWorkers' Base Salaries (monthly):\n${JSON.stringify(baseSalaries)}
            \n\nWorkers' Advances/Deductions (for this month):\n${JSON.stringify(advances)}
            \n\nMonthly Summary Data (The 'totalSalary' field represents piecework salary, and 'finalSalary' is the sum of piecework and base salary minus advances):\n${JSON.stringify(summaryData)}
            \n\nDaily Entries Data (This contributes to the piecework salary):\n${JSON.stringify(dailyEntries)}`;
            
            const fullPrompt = `${dataContext}\n\nUser question: ${userInput}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: { systemInstruction },
            });

            const text = response.text;
            setMessages(prev => [...prev, { role: 'model', content: text }]);

        } catch (error) {
            console.error("Gemini API error:", error);
            setMessages(prev => [...prev, { role: 'error', content: translations.aiError }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            getAiResponse(input.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center" onClick={onClose}>
            <div
                className="fixed bottom-0 end-0 m-4 w-full max-w-lg h-[75vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">{translations.aiAssistant}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800" aria-label={translations.closeChat}>
                        <CloseIcon />
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto" role="log">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                                    msg.role === 'user' ? 'bg-slate-700 text-white rounded-br-lg' : 
                                    msg.role === 'model' ? 'bg-slate-200 text-slate-800 rounded-bl-lg' : 
                                    'bg-red-100 text-red-700 rounded-bl-lg'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start">
                                 <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-lg">
                                     <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                         <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                         <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                         <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
                                     </div>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Form */}
                <footer className="p-4 border-t border-slate-200">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={translations.askAnything}
                            className="flex-1 block w-full px-4 py-2 bg-slate-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 sm:text-sm"
                            disabled={isLoading}
                            autoFocus
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full text-white bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                            <SendIcon />
                        </button>
                    </form>
                </footer>
            </div>
            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Chatbot;