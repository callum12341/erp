export interface EmailProviderConfig {
  name: string;
  imap: {
    host: string;
    port: number;
    secure: boolean;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
  notes: string[];
}

export const emailProviders: Record<string, EmailProviderConfig> = {
  GMAIL: {
    name: 'Gmail',
    imap: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
    },
    notes: [
      'Requires App Password if 2FA is enabled',
      'Enable "Less secure app access" or use App Password',
      'IMAP must be enabled in Gmail settings'
    ],
  },
  OUTLOOK: {
    name: 'Outlook/Hotmail',
    imap: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false, // STARTTLS
    },
    notes: [
      'Requires App Password if 2FA is enabled',
      'Enable IMAP in Outlook settings',
      'May need to allow less secure apps'
    ],
  },
  YAHOO: {
    name: 'Yahoo Mail',
    imap: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false, // STARTTLS
    },
    notes: [
      'Requires App Password if 2FA is enabled',
      'Enable IMAP in Yahoo Mail settings',
      'Generate App Password in Yahoo Account Security'
    ],
  },
  ICLOUD: {
    name: 'iCloud Mail',
    imap: {
      host: 'imap.mail.me.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.mail.me.com',
      port: 587,
      secure: false, // STARTTLS
    },
    notes: [
      'Requires App-Specific Password',
      'Enable IMAP in iCloud Mail settings',
      'Generate App Password in Apple ID settings'
    ],
  },
  PROTONMAIL: {
    name: 'ProtonMail',
    imap: {
      host: '127.0.0.1',
      port: 1143,
      secure: false,
    },
    smtp: {
      host: '127.0.0.1',
      port: 1025,
      secure: false,
    },
    notes: [
      'Requires ProtonMail Bridge application',
      'Bridge must be running locally',
      'Configure Bridge with your ProtonMail account'
    ],
  },
  ZOHO: {
    name: 'Zoho Mail',
    imap: {
      host: 'imap.zoho.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.zoho.com',
      port: 587,
      secure: false, // STARTTLS
    },
    notes: [
      'Enable IMAP in Zoho Mail settings',
      'Use your Zoho email and password',
      'May need to allow less secure apps'
    ],
  },
  CUSTOM: {
    name: 'Custom IMAP/SMTP',
    imap: {
      host: '',
      port: 993,
      secure: true,
    },
    smtp: {
      host: '',
      port: 587,
      secure: false,
    },
    notes: [
      'Enter your custom IMAP/SMTP server details',
      'Common ports: IMAP (143/993), SMTP (25/587/465)',
      'Check with your email provider for correct settings'
    ],
  },
};

export function getProviderConfig(provider: string): EmailProviderConfig | null {
  return emailProviders[provider] || null;
}

export function getProviderNames(): string[] {
  return Object.keys(emailProviders);
}

export function validateProviderSettings(provider: string, settings: any): boolean {
  const config = getProviderConfig(provider);
  if (!config) return false;
  
  // Basic validation
  if (!settings.imapHost || !settings.smtpHost) return false;
  if (!settings.imapUser || !settings.smtpUser) return false;
  if (!settings.imapPassword || !settings.smtpPassword) return false;
  
  return true;
}
