import express from 'express';
import { z } from 'zod';
import { emailService } from '../services/emailService.js';
import { prisma } from '../services/databaseService.js';
import { EmailAccount } from '../types/email.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all email routes
router.use(authenticateToken);

const EmailAccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  provider: z.enum(['GMAIL', 'OUTLOOK', 'YAHOO', 'ICLOUD', 'PROTONMAIL', 'ZOHO', 'CUSTOM']),
  imapHost: z.string(),
  imapPort: z.number(),
  imapSecure: z.boolean(),
  imapUser: z.string(),
  imapPassword: z.string(),
  smtpHost: z.string(),
  smtpPort: z.number(),
  smtpSecure: z.boolean(),
  smtpUser: z.string(),
  smtpPassword: z.string(),
});

const SendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
});

// Get accounts
router.get('/accounts', async (req, res) => {
  try {
    console.log('📧 Getting email accounts');
    
    const userId = req.user!.userId;
    
    const accounts = await prisma.emailAccount.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    console.error('❌ Error getting accounts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add account
router.post('/accounts', async (req, res) => {
  try {
    console.log('📧 Adding email account:', req.body.email);
    
    const data = EmailAccountSchema.parse(req.body);
    
    const userId = req.user!.userId;
    
    // Create temporary account object for testing
    const tempAccount: EmailAccount = {
      id: 'temp',
      name: data.name,
      email: data.email,
      provider: data.provider,
      imapConfig: {
        host: data.imapHost,
        port: data.imapPort,
        secure: data.imapSecure,
        user: data.imapUser,
        password: data.imapPassword,
      },
      smtpConfig: {
        host: data.smtpHost,
        port: data.smtpPort,
        secure: data.smtpSecure,
        user: data.smtpUser,
        password: data.smtpPassword,
      },
      isActive: false,
    };

    const connectionWorks = await emailService.testConnection(tempAccount);
    
    if (!connectionWorks) {
      return res.status(400).json({
        success: false,
        error: 'Connection test failed. Please check your email settings.'
      });
    }

    // Save to database
    const account = await prisma.emailAccount.create({
      data: {
        name: data.name,
        email: data.email,
        provider: data.provider,
        isActive: true,
        userId: userId,
        imapHost: data.imapHost,
        imapPort: data.imapPort,
        imapSecure: data.imapSecure,
        imapUser: data.imapUser,
        imapPassword: data.imapPassword,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpSecure: data.smtpSecure,
        smtpUser: data.smtpUser,
        smtpPassword: data.smtpPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        isActive: true,
      }
    });
    
    console.log('✅ Email account added:', account.email);
    
    res.json({
      success: true,
      message: 'Email account added successfully',
      data: account
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete account
router.delete('/accounts/:id', async (req, res) => {
  try {
    const accountId = req.params.id;
    
    const userId = req.user!.userId;
    
    const account = await prisma.emailAccount.findFirst({
      where: { id: accountId, userId }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Delete account and all associated messages
    await prisma.emailMessage.deleteMany({
      where: { accountId }
    });
    
    await prisma.emailAccount.delete({
      where: { id: accountId }
    });
    
    console.log('✅ Email account deleted:', accountId);
    
    res.json({
      success: true,
      message: 'Email account deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch emails for an account
router.get('/accounts/:id/emails', async (req, res) => {
  try {
    const accountId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const userId = req.user!.userId;
    
    const account = await prisma.emailAccount.findFirst({
      where: { id: accountId, userId }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Convert database account to EmailAccount type for emailService
    const emailAccount: EmailAccount = {
      id: account.id,
      name: account.name,
      email: account.email,
      provider: account.provider,
      isActive: account.isActive,
      imapConfig: {
        host: account.imapHost,
        port: account.imapPort,
        secure: account.imapSecure,
        user: account.imapUser,
        password: account.imapPassword,
      },
      smtpConfig: {
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpSecure,
        user: account.smtpUser,
        password: account.smtpPassword,
      },
    };
    
    const emails = await emailService.fetchEmails(emailAccount, limit);
    
    // Save emails to database
    for (const email of emails) {
      await prisma.emailMessage.upsert({
        where: { 
          messageId_accountId: { 
            messageId: email.messageId, 
            accountId: accountId 
          } 
        },
        update: {
          isRead: email.isRead,
          isImportant: email.isImportant,
        },
        create: {
          messageId: email.messageId,
          subject: email.subject,
          fromEmail: email.from.email,
          fromName: email.from.name,
          toEmails: JSON.stringify(email.to.map(t => t.email)),
          toNames: JSON.stringify(email.to.map(t => t.name)),
          bodyText: email.body.text,
          bodyHtml: email.body.html,
          date: new Date(email.date),
          isRead: email.isRead,
          isImportant: email.isImportant,
          accountId: accountId,
        },
      });
    }
    
    // Return emails from database
    const savedEmails = await prisma.emailMessage.findMany({
      where: { accountId },
      orderBy: { date: 'desc' },
      take: limit,
    });
    
    // Convert back to EmailMessage format
    const formattedEmails = savedEmails.map(email => ({
      id: email.id,
      messageId: email.messageId,
      subject: email.subject,
      from: { 
        email: email.fromEmail, 
        name: email.fromName 
      },
      to: JSON.parse(email.toEmails).map((email: string, index: number) => ({
        email,
        name: email.toNames ? JSON.parse(email.toNames)[index] : undefined
      })),
      body: { 
        text: email.bodyText, 
        html: email.bodyHtml 
      },
      date: email.date.toISOString(),
      isRead: email.isRead,
      isImportant: email.isImportant,
      accountId: email.accountId,
    }));
    
    res.json({
      success: true,
      data: formattedEmails
    });
  } catch (error: any) {
    console.error('❌ Error fetching emails:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch emails' 
    });
  }
});

// Send email
router.post('/accounts/:id/send', async (req, res) => {
  try {
    const accountId = req.params.id;
    const emailData = SendEmailSchema.parse(req.body);
    
    const account = emailAccounts.find(acc => acc.id === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    await emailService.sendEmail(account, emailData);
    
    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
});

// Mark email as read
router.patch('/accounts/:id/emails/:messageId/read', async (req, res) => {
  try {
    const accountId = req.params.id;
    const messageId = req.params.messageId;
    
    const account = emailAccounts.find(acc => acc.id === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    await emailService.markEmailAsRead(account, messageId);
    
    res.json({
      success: true,
      message: 'Email marked as read'
    });
  } catch (error: any) {
    console.error('❌ Error marking email as read:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to mark email as read' 
    });
  }
});

// Delete email
router.delete('/accounts/:id/emails/:messageId', async (req, res) => {
  try {
    const accountId = req.params.id;
    const messageId = req.params.messageId;
    
    const account = emailAccounts.find(acc => acc.id === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    await emailService.deleteEmail(account, messageId);
    
    res.json({
      success: true,
      message: 'Email deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete email' 
    });
  }
});

// Get email folders
router.get('/accounts/:id/folders', async (req, res) => {
  try {
    const accountId = req.params.id;
    
    const account = emailAccounts.find(acc => acc.id === accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    const folders = await emailService.getEmailFolders(account);
    
    res.json({
      success: true,
      data: folders
    });
  } catch (error: any) {
    console.error('❌ Error getting folders:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get folders' 
    });
  }
});

export { router as emailRoutes };