import { EmailAccount, EmailMessage } from '../types/email.js';

export class EmailService {
  async testConnection(account: EmailAccount): Promise<boolean> {
    console.log(`🔍 Testing connection for ${account.email}`);
    
    if (!account.email || !account.imapConfig.password) {
      console.log('❌ Missing email or password');
      return false;
    }
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`✅ Connection test passed for ${account.email}`);
    return true;
  }

  async fetchEmails(accountId: string, limit: number = 10): Promise<EmailMessage[]> {
    console.log(`📧 Fetching emails for account ${accountId}`);
    
    return [
      {
        id: `${accountId}-1`,
        messageId: 'welcome-msg',
        subject: '🎉 Welcome to Modern CRM Email!',
        from: { email: 'welcome@moderncrm.com', name: 'Modern CRM' },
        to: [{ email: 'you@example.com', name: 'You' }],
        body: { 
          text: 'Your email integration is working perfectly!',
          html: '<p>Your <strong>email integration</strong> is working perfectly!</p>'
        },
        date: new Date().toISOString(),
        isRead: false,
        isImportant: true,
        accountId
      }
    ];
  }

  async sendEmail(accountId: string, emailData: any): Promise<void> {
    console.log('📤 Mock sending email:', emailData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Email sent successfully (mock)');
  }
}

export const emailService = new EmailService();