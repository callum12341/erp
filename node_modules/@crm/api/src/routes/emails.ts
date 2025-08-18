import express from 'express';
import { z } from 'zod';
import { emailService } from '../services/emailService.js';
import { EmailAccount } from '../types/email.js';

const router = express.Router();
const emailAccounts: EmailAccount[] = [];

const EmailAccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  provider: z.enum(['GMAIL', 'OUTLOOK', 'IMAP']),
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

// Get accounts
router.get('/accounts', (req, res) => {
  console.log('📧 Getting email accounts');
  res.json({ success: true, data: emailAccounts });
});

// Add account
router.post('/accounts', async (req, res) => {
  try {
    console.log('📧 Adding email account:', req.body.email);
    
    const data = EmailAccountSchema.parse(req.body);
    
    const account: EmailAccount = {
      id: Date.now().toString(),
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

    const connectionWorks = await emailService.testConnection(account);
    
    if (!connectionWorks) {
      return res.status(400).json({
        success: false,
        error: 'Connection test failed'
      });
    }

    account.isActive = true;
    emailAccounts.push(account);
    
    console.log('✅ Email account added:', account.email);
    
    res.json({
      success: true,
      message: 'Email account added successfully',
      data: { id: account.id, name: account.name, email: account.email }
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as emailRoutes };