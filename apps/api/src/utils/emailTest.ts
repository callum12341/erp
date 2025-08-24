import { EmailAccount } from '../types/email.js';
import ImapSimple from 'imap-simple';
import nodemailer from 'nodemailer';

export interface ConnectionTestResult {
  imap: {
    success: boolean;
    error?: string;
    details?: string;
  };
  smtp: {
    success: boolean;
    error?: string;
    details?: string;
  };
  overall: boolean;
}

export async function testEmailConnection(account: EmailAccount): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    imap: { success: false },
    smtp: { success: false },
    overall: false,
  };

  // Test IMAP connection
  try {
    console.log(`🔍 Testing IMAP connection to ${account.imapConfig.host}:${account.imapConfig.port}`);
    
    const imapConfig = {
      imap: {
        host: account.imapConfig.host,
        port: account.imapConfig.port,
        tls: account.imapConfig.secure,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
        connTimeout: 10000,
      },
      user: account.imapConfig.user,
      password: account.imapConfig.password,
    };

    const connection = await ImapSimple.connect(imapConfig);
    
    // Get mailbox list to verify connection
    const boxes = await connection.getBoxes();
    const folderNames = Object.keys(boxes);
    
    await connection.end();
    
    result.imap = {
      success: true,
      details: `Connected successfully. Found ${folderNames.length} folders: ${folderNames.slice(0, 5).join(', ')}${folderNames.length > 5 ? '...' : ''}`
    };
    
    console.log(`✅ IMAP connection successful`);
    
  } catch (error: any) {
    result.imap = {
      success: false,
      error: error.message,
      details: getImapErrorDetails(error)
    };
    console.error(`❌ IMAP connection failed:`, error.message);
  }

  // Test SMTP connection
  try {
    console.log(`🔍 Testing SMTP connection to ${account.smtpConfig.host}:${account.smtpConfig.port}`);
    
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
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.verify();
    await transporter.close();
    
    result.smtp = {
      success: true,
      details: 'SMTP connection verified successfully'
    };
    
    console.log(`✅ SMTP connection successful`);
    
  } catch (error: any) {
    result.smtp = {
      success: false,
      error: error.message,
      details: getSmtpErrorDetails(error)
    };
    console.error(`❌ SMTP connection failed:`, error.message);
  }

  result.overall = result.imap.success && result.smtp.success;
  return result;
}

function getImapErrorDetails(error: any): string {
  const message = error.message || '';
  
  if (message.includes('ENOTFOUND')) {
    return 'Host not found. Check the IMAP host address.';
  }
  if (message.includes('ECONNREFUSED')) {
    return 'Connection refused. Check the IMAP port number.';
  }
  if (message.includes('ETIMEDOUT')) {
    return 'Connection timeout. Check your internet connection and firewall settings.';
  }
  if (message.includes('authentication failed') || message.includes('Invalid credentials')) {
    return 'Authentication failed. Check your username and password.';
  }
  if (message.includes('STARTTLS')) {
    return 'TLS negotiation failed. Try enabling SSL/TLS or check port settings.';
  }
  
  return `Connection error: ${message}`;
}

function getSmtpErrorDetails(error: any): string {
  const message = error.message || '';
  
  if (message.includes('ENOTFOUND')) {
    return 'Host not found. Check the SMTP host address.';
  }
  if (message.includes('ECONNREFUSED')) {
    return 'Connection refused. Check the SMTP port number.';
  }
  if (message.includes('ETIMEDOUT')) {
    return 'Connection timeout. Check your internet connection and firewall settings.';
  }
  if (message.includes('authentication failed') || message.includes('Invalid credentials')) {
    return 'Authentication failed. Check your username and password.';
  }
  if (message.includes('STARTTLS')) {
    return 'TLS negotiation failed. Try enabling SSL/TLS or check port settings.';
  }
  if (message.includes('relay not permitted')) {
    return 'Relay not permitted. Check if your email provider allows external SMTP access.';
  }
  
  return `Connection error: ${message}`;
}

export function getProviderRecommendations(provider: string): string[] {
  const recommendations: Record<string, string[]> = {
    GMAIL: [
      'Enable 2-Step Verification in your Google Account',
      'Generate an App Password (not your regular password)',
      'Enable IMAP in Gmail Settings > Forwarding and POP/IMAP',
      'Use port 993 for IMAP (SSL) and port 587 for SMTP (STARTTLS)'
    ],
    OUTLOOK: [
      'Enable 2-Step Verification in your Microsoft Account',
      'Generate an App Password',
      'Enable IMAP in Outlook Settings > Mail > Sync email',
      'Use port 993 for IMAP (SSL) and port 587 for SMTP (STARTTLS)'
    ],
    YAHOO: [
      'Enable 2-Step Verification in your Yahoo Account',
      'Generate an App Password in Account Security settings',
      'Enable IMAP in Yahoo Mail Settings',
      'Use port 993 for IMAP (SSL) and port 587 for SMTP (STARTTLS)'
    ],
    CUSTOM: [
      'Verify your email provider supports IMAP and SMTP',
      'Check with your provider for correct server settings',
      'Common ports: IMAP (143/993), SMTP (25/587/465)',
      'Ensure your provider allows external email client access'
    ]
  };
  
  return recommendations[provider] || recommendations.CUSTOM;
}

export function validateEmailSettings(account: EmailAccount): string[] {
  const errors: string[] = [];
  
  if (!account.email || !account.email.includes('@')) {
    errors.push('Invalid email address');
  }
  
  if (!account.imapConfig.host || account.imapConfig.host.trim() === '') {
    errors.push('IMAP host is required');
  }
  
  if (!account.imapConfig.user || account.imapConfig.user.trim() === '') {
    errors.push('IMAP username is required');
  }
  
  if (!account.imapConfig.password || account.imapConfig.password.trim() === '') {
    errors.push('IMAP password is required');
  }
  
  if (!account.smtpConfig.host || account.smtpConfig.host.trim() === '') {
    errors.push('SMTP host is required');
  }
  
  if (!account.smtpConfig.user || account.smtpConfig.user.trim() === '') {
    errors.push('SMTP username is required');
  }
  
  if (!account.smtpConfig.password || account.smtpConfig.password.trim() === '') {
    errors.push('SMTP password is required');
  }
  
  if (account.imapConfig.port < 1 || account.imapConfig.port > 65535) {
    errors.push('Invalid IMAP port number');
  }
  
  if (account.smtpConfig.port < 1 || account.smtpConfig.port > 65535) {
    errors.push('Invalid SMTP port number');
  }
  
  return errors;
}
