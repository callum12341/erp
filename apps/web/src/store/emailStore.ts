import { create } from 'zustand';

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'GMAIL' | 'OUTLOOK' | 'IMAP';
  isActive: boolean;
}

interface EmailMessage {
  id: string;
  subject: string;
  from: { email: string; name?: string; };
  to: Array<{ email: string; name?: string; }>;
  body: { text?: string; html?: string; };
  date: string;
  isRead: boolean;
  isImportant: boolean;
  accountId: string;
}

interface EmailState {
  accounts: EmailAccount[];
  messages: EmailMessage[];
  selectedAccount: string | null;
  loading: boolean;
  error: string | null;
  
  fetchAccounts: () => Promise<void>;
  addAccount: (accountData: any) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  fetchEmails: (accountId: string) => Promise<void>;
  setSelectedAccount: (accountId: string | null) => void;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  accounts: [],
  messages: [],
  selectedAccount: null,
  loading: false,
  error: null,
  
  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/emails/accounts');
      const data = await response.json();
      
      if (data.success) {
        set({ accounts: data.data });
      } else {
        set({ error: data.error });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  addAccount: async (accountData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/emails/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await get().fetchAccounts();
      } else {
        set({ error: data.error });
        throw new Error(data.error);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  deleteAccount: async (accountId) => {
    await get().fetchAccounts();
  },
  
  fetchEmails: async (accountId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/emails/accounts/${accountId}/emails`);
      const data = await response.json();
      
      if (data.success) {
        set({ messages: data.data });
      } else {
        set({ error: data.error });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  setSelectedAccount: (accountId) => {
    set({ selectedAccount: accountId });
    if (accountId) {
      get().fetchEmails(accountId);
    } else {
      set({ messages: [] });
    }
  },
}));