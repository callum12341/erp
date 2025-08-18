export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'GMAIL' | 'OUTLOOK' | 'IMAP';
  imapConfig: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  isActive: boolean;
  lastSync?: Date;
}

export interface EmailMessage {
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