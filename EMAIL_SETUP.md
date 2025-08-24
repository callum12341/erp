# Email Integration Setup Guide

This guide explains how to set up and use the real email functionality in your Modern CRM system.

## 🚀 Features

- **Real IMAP/SMTP Integration**: Connect to actual email providers
- **Multi-Provider Support**: Gmail, Outlook, Yahoo, iCloud, and custom servers
- **Email Management**: Fetch, send, mark as read, and delete emails
- **Connection Testing**: Built-in connection validation
- **Secure Authentication**: Support for App Passwords and 2FA

## 📧 Supported Email Providers

### Gmail
- **IMAP**: `imap.gmail.com:993` (SSL)
- **SMTP**: `smtp.gmail.com:587` (STARTTLS)
- **Requirements**: 
  - Enable IMAP in Gmail Settings
  - Use App Password if 2FA is enabled
  - Enable "Less secure app access" (not recommended)

### Outlook/Hotmail
- **IMAP**: `outlook.office365.com:993` (SSL)
- **SMTP**: `smtp-mail.outlook.com:587` (STARTTLS)
- **Requirements**:
  - Enable IMAP in Outlook Settings
  - Use App Password if 2FA is enabled

### Yahoo Mail
- **IMAP**: `imap.mail.yahoo.com:993` (SSL)
- **SMTP**: `smtp.mail.yahoo.com:587` (STARTTLS)
- **Requirements**:
  - Enable IMAP in Yahoo Settings
  - Generate App Password in Account Security

### iCloud Mail
- **IMAP**: `imap.mail.me.com:993` (SSL)
- **SMTP**: `smtp.mail.me.com:587` (STARTTLS)
- **Requirements**:
  - Enable IMAP in iCloud Mail Settings
  - Generate App-Specific Password

### Custom IMAP/SMTP
- **Common Ports**:
  - IMAP: 143 (non-SSL), 993 (SSL)
  - SMTP: 25 (non-SSL), 587 (STARTTLS), 465 (SSL)

## 🔐 Security Setup

### For Gmail Users
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification**
3. Generate an **App Password**:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Use the generated 16-character password

### For Outlook Users
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Enable **Two-step verification**
3. Generate an **App password**:
   - Go to Security → Advanced security options
   - Create a new app password

### For Yahoo Users
1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Enable **2-Step Verification**
3. Generate an **App Password**:
   - Go to Account Security → App passwords
   - Create a new app password

## 🛠️ Setup Instructions

### 1. Add Email Account
1. Navigate to the **Emails** tab in your CRM
2. Click **"Add Account"**
3. Select your email provider
4. Fill in the required information:
   - **Account Name**: A friendly name for the account
   - **Email Address**: Your email address
   - **IMAP Settings**: Host, port, username, password
   - **SMTP Settings**: Host, port, username, password
5. Click **"Add Account"**

### 2. Connection Testing
The system will automatically test both IMAP and SMTP connections:
- ✅ **Green**: Connection successful
- ❌ **Red**: Connection failed with error details

### 3. Troubleshooting Common Issues

#### Connection Refused
- Check if the port number is correct
- Verify the host address
- Ensure your firewall allows the connection

#### Authentication Failed
- Verify username and password
- Use App Password instead of regular password
- Check if 2FA is enabled

#### TLS/SSL Issues
- Try different port combinations
- Check if your provider requires specific SSL settings
- Verify the "Use SSL/TLS" checkbox settings

## 📱 Using Email Features

### Viewing Emails
- Select an email account from the sidebar
- Emails are automatically fetched from your inbox
- Unread emails are highlighted in blue
- Important emails show a star icon

### Composing Emails
1. Click **"Compose Email"** button
2. Fill in recipient, subject, and message
3. Click **"Send Email"**

### Managing Emails
- **Mark as Read**: Click on an email to mark it as read
- **Delete**: Use the trash icon to delete emails
- **Refresh**: Click the refresh button to fetch new emails

## 🔧 Technical Details

### API Endpoints
- `GET /api/emails/accounts` - List email accounts
- `POST /api/emails/accounts` - Add new account
- `DELETE /api/emails/accounts/:id` - Delete account
- `GET /api/emails/accounts/:id/emails` - Fetch emails
- `POST /api/emails/accounts/:id/send` - Send email
- `PATCH /api/emails/accounts/:id/emails/:messageId/read` - Mark as read
- `DELETE /api/emails/accounts/:id/emails/:messageId` - Delete email

### Email Storage
- Emails are fetched in real-time from your email provider
- No emails are stored permanently in the CRM
- Connection settings are stored securely
- Passwords are encrypted in memory

### Security Features
- TLS/SSL encryption for all connections
- App Password support for 2FA accounts
- Connection timeout protection
- Rate limiting on API endpoints

## 🚨 Important Notes

1. **Never use your main password** - Always use App Passwords for 2FA-enabled accounts
2. **Keep App Passwords secure** - Treat them like your main password
3. **Regular password changes** - Update App Passwords regularly
4. **Monitor access** - Check your email provider's security logs
5. **Backup settings** - Keep a record of your email configuration

## 🆘 Getting Help

If you encounter issues:

1. **Check the error message** - It usually contains helpful information
2. **Verify your settings** - Double-check host, port, and credentials
3. **Test with another client** - Try connecting with Thunderbird or Outlook
4. **Check provider status** - Some providers have maintenance windows
5. **Contact support** - Your email provider can help with account-specific issues

## 🔄 Updates and Maintenance

The email system automatically:
- Tests connections when adding accounts
- Handles connection timeouts gracefully
- Provides detailed error messages
- Supports multiple email accounts simultaneously

For system updates, check the main README file for the latest information.
