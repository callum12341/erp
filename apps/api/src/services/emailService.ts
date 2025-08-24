import { EmailAccount, EmailMessage } from '../types/email.js';
import ImapSimple from 'imap-simple';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { testEmailConnection, validateEmailSettings } from '../utils/emailTest.js';

export class EmailService {
  async testConnection(account: EmailAccount): Promise<boolean> {
    console.log(`🔍 Testing connection for ${account.email}`);
    
    // Validate settings first
    const validationErrors = validateEmailSettings(account);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return false;
    }
    
    try {
      const result = await testEmailConnection(account);
      
      if (result.overall) {
        console.log(`✅ Connection test passed for ${account.email}`);
        return true;
      } else {
        console.log(`❌ Connection test failed for ${account.email}:`);
        if (!result.imap.success) {
          console.log(`  IMAP: ${result.imap.error} - ${result.imap.details}`);
        }
        if (!result.smtp.success) {
          console.log(`  SMTP: ${result.smtp.error} - ${result.smtp.details}`);
        }
        return false;
      }
    } catch (error) {
      console.error(`❌ Connection test failed for ${account.email}:`, error);
      return false;
    }
  }

  async fetchEmails(account: EmailAccount, limit: number = 50): Promise<EmailMessage[]> {
    console.log(`📧 Fetching emails for account ${account.email}`);
    
    try {
      const imapConfig = {
        imap: {
          host: account.imapConfig.host,
          port: account.imapConfig.port,
          tls: account.imapConfig.secure,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 10000,
        },
        user: account.imapConfig.user,
        password: account.imapConfig.password,
      };

      const connection = await ImapSimple.connect(imapConfig);
      
      // Open INBOX
      await connection.openBox('INBOX');
      
      // Search for recent emails (last 30 days)
      const searchCriteria = ['UNSEEN', ['SINCE', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
        limit: limit,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      
      const parsedEmails: EmailMessage[] = [];
      
      for (const message of messages) {
        try {
          const textPart = message.parts.find((part: any) => part.which === 'TEXT');
          const parsed = await simpleParser(textPart?.body || '');
          
          const emailMessage: EmailMessage = {
            id: `${account.id}-${message.attributes.uid}`,
            messageId: message.attributes.uid?.toString() || Date.now().toString(),
            subject: parsed.subject || 'No Subject',
            from: { 
              email: parsed.from?.value[0]?.address || 'unknown@example.com',
              name: parsed.from?.value[0]?.name || undefined
            },
            to: parsed.to?.value.map((addr: any) => ({ 
              email: addr.address, 
              name: addr.name 
            })) || [],
            body: { 
              text: parsed.text || '',
              html: parsed.html || ''
            },
            date: parsed.date?.toISOString() || new Date().toISOString(),
            isRead: !message.attributes.flags?.includes('\\Seen'),
            isImportant: message.attributes.flags?.includes('\\Flagged') || false,
            accountId: account.id
          };
          
          parsedEmails.push(emailMessage);
        } catch (parseError) {
          console.error('Error parsing email:', parseError);
          // Continue with next message
        }
      }
      
      await connection.end();
      
      console.log(`✅ Fetched ${parsedEmails.length} emails from ${account.email}`);
      return parsedEmails;
      
    } catch (error) {
      console.error(`❌ Error fetching emails from ${account.email}:`, error);
      throw new Error(`Failed to fetch emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendEmail(account: EmailAccount, emailData: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }): Promise<void> {
    console.log(`📤 Sending email from ${account.email} to ${emailData.to}`);
    
    try {
      const transporter = nodemailer.createTransport({
        host: account.smtpConfig.host,
        port: account.smtpConfig.port,
        secure: account.smtpConfig.secure,
        auth: {
          user: account.smtpConfig.user,
          pass: account.smtpConfig.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"${account.name}" <${account.email}>`,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      
      await transporter.close();
      
      console.log(`✅ Email sent successfully from ${account.email}`);
      console.log(`Message ID: ${info.messageId}`);
      
    } catch (error) {
      console.error(`❌ Error sending email from ${account.email}:`, error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async markEmailAsRead(account: EmailAccount, messageId: string): Promise<void> {
    console.log(`📝 Marking email ${messageId} as read in ${account.email}`);
    
    try {
      const imapConfig = {
        imap: {
          host: account.imapConfig.host,
          port: account.imapConfig.port,
          tls: account.imapConfig.secure,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 10000,
        },
        user: account.imapConfig.user,
        password: account.imapConfig.password,
      };

      const connection = await ImapSimple.connect(imapConfig);
      await connection.openBox('INBOX');
      
      // Mark message as read
      await connection.addFlags(messageId, '\\Seen');
      
      await connection.end();
      
      console.log(`✅ Email ${messageId} marked as read in ${account.email}`);
      
    } catch (error) {
      console.error(`❌ Error marking email as read in ${account.email}:`, error);
      throw new Error(`Failed to mark email as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteEmail(account: EmailAccount, messageId: string): Promise<void> {
    console.log(`🗑️ Deleting email ${messageId} from ${account.email}`);
    
    try {
      const imapConfig = {
        imap: {
          host: account.imapConfig.host,
          port: account.imapConfig.port,
          tls: account.imapConfig.secure,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 10000,
        },
        user: account.imapConfig.user,
        password: account.imapConfig.password,
      };

      const connection = await ImapSimple.connect(imapConfig);
      await connection.openBox('INBOX');
      
      // Mark message for deletion
      await connection.addFlags(messageId, '\\Deleted');
      
      // Expunge deleted messages
      await connection.expunge();
      
      await connection.end();
      
      console.log(`✅ Email ${messageId} deleted from ${account.email}`);
      
    } catch (error) {
      console.error(`❌ Error deleting email from ${account.email}:`, error);
      throw new Error(`Failed to delete email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEmailFolders(account: EmailAccount): Promise<string[]> {
    console.log(`📁 Getting folders for ${account.email}`);
    
    try {
      const imapConfig = {
        imap: {
          host: account.imapConfig.host,
          port: account.imapConfig.port,
          tls: account.imapConfig.secure,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 10000,
        },
        user: account.imapConfig.user,
        password: account.imapConfig.password,
      };

      const connection = await ImapSimple.connect(imapConfig);
      
      const boxes = await connection.getBoxes();
      const folderNames = Object.keys(boxes);
      
      await connection.end();
      
      console.log(`✅ Found ${folderNames.length} folders in ${account.email}`);
      return folderNames;
      
    } catch (error) {
      console.error(`❌ Error getting folders from ${account.email}:`, error);
      throw new Error(`Failed to get folders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const emailService = new EmailService();