export type Language = 'en' | 'ar';

export interface DailyEntry {
  id: number | string;
  workerName: string;
  date: string;
  items: number;
  price: number;
  dailyTotal: number;
}

export interface PaymentStatus {
  paidDate: string;
  notes: string;
}

export interface WorkerSummary {
  workerName: string;
  totalItems: number;
  totalSalary: number; // Represents piecework salary from API
  baseSalary?: number;
  advance?: number;
  finalSalary?: number;
  paymentStatus?: PaymentStatus;
}

export interface WorkerProfile {
  name: string;
  photo?: string; // base64 string
}

export interface ChatMessage {
    role: 'user' | 'model' | 'error';
    content: string;
}

export interface Translations {
  title: string;
  addEntry: string;
  workerName: string;
  date: string;
  itemsDelivered: string;
  pricePerItem: string;
  dailyTotal: string;
  currency: string;
  submit: string;
  dailyLog: string;
  delete: string;
  monthlySummary: string;
  totalItems: string;
  totalSalary: string;
  exportToCSV: string;
  noEntries: string;
  noSummary: string;
  confirmClear: string;
  clearData: string;
  formValidation: {
      workerName: string;
      date: string;
      items: string;
      price: string;
  };
  configTitle: string;
  configInstructions: string;
  appsScriptUrl: string;
  saveUrl: string;
  urlRequired: string;
  month: string;
  loading: string;
  apiError: string;
  changeConfig: string;
  confirmClearConfig: string;
  // Feedback
  entryAddedSuccess: string;
  entryAddedError: string;
  // New salary fields
  baseSalary: string;
  finalSalary: string;
  manageSalaries: string;
  saveSalaries: string;
  pieceworkSalary: string;
  // New advance/deduction fields
  advance: string;
  manageAdvances: string;
  saveAdvances: string;
  // AI Chatbot translations
  aiAssistant: string;
  askAnything: string;
  analyzing: string;
  aiError: string;
  openChat: string;
  closeChat: string;
  // Worker Profiles
  manageWorkers: string;
  changePhoto: string;
  deleteWorker: string;
  confirmDeleteWorker: string;
  workerProfileUpdated: string;
  workerProfileDeleted: string;
  quickSelect: string;
  noWorkersYet: string;
  photo: string;
  // Payment Status
  actions: string;
  markAsPaid: string;
  unmarkAsPaid: string;
  paidOn: string;
  editNotes: string;
  confirmPaymentTitle: string;
  paymentNotes: string;
  paymentNotesPlaceholder: string;
  confirmAndSave: string;
  confirmUnmarkPayment: string;
  paymentMarkedSuccess: string;
  paymentUnmarkedSuccess: string;
  notesSavedSuccess: string;
  noNotes: string;
  paymentStatus: string;
  paymentDate: string;
  paymentNotesCSV: string;
  paid: string;
  unpaid: string;
}
