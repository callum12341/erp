# 🚀 Email CRM Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

## 🗄️ Database Setup

### 1. Install Dependencies
```bash
# Install API dependencies
cd apps/api
npm install

# Install web dependencies  
cd ../web
npm install

# Install root dependencies
cd ..
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cd apps/api
cp env.example .env

# Edit .env file with your settings
# Generate a random JWT_SECRET (you can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 3. Database Setup
```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

## 🚀 Running the Application

### 1. Start API Server
```bash
cd apps/api
npm run dev
# Server will start on http://localhost:3002
```

### 2. Start Web Application
```bash
cd apps/web
npm run dev
# App will start on http://localhost:5173
```

## 🔐 First Time Setup

### 1. Create User Account
- Open http://localhost:5173
- Click "Register" 
- Fill in your details
- You'll be automatically logged in

### 2. Add Email Account
- Navigate to Emails tab
- Click "Add Account"
- Choose your email provider
- Enter credentials
- Test connection

## 📧 Supported Email Providers

- **Gmail**: Requires App Password (2FA enabled)
- **Outlook**: Requires App Password (2FA enabled)  
- **Yahoo**: Requires App Password
- **iCloud**: Requires App-Specific Password
- **ProtonMail**: Requires Bridge application
- **Zoho**: Standard credentials
- **Custom**: Any IMAP/SMTP server

## 🛠️ Development

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/emails/accounts` - List email accounts
- `POST /api/emails/accounts` - Add email account
- `DELETE /api/emails/accounts/:id` - Delete account
- `GET /api/emails/accounts/:id/emails` - Fetch emails
- `POST /api/emails/accounts/:id/send` - Send email

### Database Schema
- **users**: User accounts and authentication
- **email_accounts**: Email provider configurations
- **email_messages**: Stored email messages

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if `.env` file exists
   - Verify `DATABASE_URL` in `.env`
   - Run `npx prisma generate` and `npx prisma db push`

2. **Email Connection Failed**
   - Verify email credentials
   - Check if 2FA is enabled (use App Password)
   - Verify IMAP/SMTP settings
   - Check firewall/network restrictions

3. **Authentication Errors**
   - Clear browser storage
   - Check JWT_SECRET in `.env`
   - Verify token expiration

### Logs
- API logs: Check terminal running `npm run dev`
- Database logs: Check Prisma Studio or terminal output
- Frontend errors: Check browser console

## 🚀 Next Steps

After basic setup, consider adding:
- Email synchronization (background jobs)
- File attachments support
- Email search and filtering
- Real-time notifications
- Email templates
- Advanced security features
