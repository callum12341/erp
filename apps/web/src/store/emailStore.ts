import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'GMAIL' | 'OUTLOOK' | 'YAHOO' | 'ICLOUD' | 'PROTONMAIL' | 'ZOHO' | 'CUSTOM';
  isActive: boolean;
}

interface EmailMessage {
  id: string;
  messageId: string;
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
  sendEmail: (accountId: string, emailData: any) => Promise<void>;
  markEmailAsRead: (accountId: string, messageId: string) => Promise<void>;
  deleteEmail: (accountId: string, messageId: string) => Promise<void>;
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
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ error: 'Not authenticated' });
        return;
      }
      
      const response = await fetch('/api/emails/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
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
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ error: 'Not authenticated' });
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/emails/accounts', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
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
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ error: 'Not authenticated' });
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`/api/emails/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        await get().fetchAccounts();
        // If the deleted account was selected, clear selection
        if (get().selectedAccount === accountId) {
          set({ selectedAccount: null, messages: [] });
        }
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
  
  fetchEmails: async (accountId) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ error: 'Not authenticated' });
        return;
      }
      
      const response = await fetch(`/api/emails/accounts/${accountId}/emails?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
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

  sendEmail: async (accountId, emailData) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ error: 'Not authenticated' });
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`/api/emails/accounts/${accountId}/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(emailData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh emails after sending
        await get().fetchEmails(accountId);
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

  markEmailAsRead: async (accountId, messageId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error('Not authenticated');
        return;
      }
      
      const response = await fetch(`/api/emails/accounts/${accountId}/emails/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state to mark email as read
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error marking email as read:', error);
      // Don't update error state for this operation
    }
  },

  deleteEmail: async (accountId, messageId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error('Not authenticated');
        return;
      }
      
      const response = await fetch(`/api/emails/accounts/${accountId}/emails/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove email from local state
        set((state) => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error deleting email:', error);
      // Don't update error state for this operation
    }
  },
}));