import { useEffect, useState } from 'react';
import { useEmailStore } from '@/store/emailStore';

// Define EmailMessage type to match backend
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

export function Emails() {
  const {
    accounts,
    messages,
    selectedAccount,
    loading,
    error,
    fetchAccounts,
    setSelectedAccount,
    deleteAccount,
    sendEmail,
    markEmailAsRead,
    deleteEmail,
  } = useEmailStore();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  const handleEmailClick = async (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      await markEmailAsRead(selectedAccount!, email.messageId);
    }
  };

  const handleDeleteEmail = async (email: EmailMessage) => {
    if (confirm('Are you sure you want to delete this email?')) {
      await deleteEmail(selectedAccount!, email.messageId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">📧 Email Management</h1>
            {selectedAccount && (
              <button
                onClick={() => setShowCompose(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
              >
                ✏️ Compose Email
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Email Accounts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Email Accounts</h2>
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Account
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-4">No email accounts</p>
                    <button
                      onClick={() => setShowAddAccount(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Add First Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                          selectedAccount === account.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedAccount(account.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-gray-900 truncate">{account.name}</p>
                            <p className="text-xs text-gray-500 truncate">{account.email}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                              account.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.provider}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAccount(account.id);
                            }}
                            className="text-red-400 hover:text-red-600 text-xs ml-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Email List */}
          <div className="lg:col-span-3">
            {!selectedAccount ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Email Account</h3>
                <p className="text-gray-500">Choose an email account from the sidebar to view your inbox</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedAccountData?.name}</h2>
                      <p className="text-sm text-gray-500">{selectedAccountData?.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedAccount(selectedAccount)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {loading ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Loading emails...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No emails found</p>
                    </div>
                  ) : (
                    messages.map((email) => (
                      <div 
                        key={email.id} 
                        className={`p-6 hover:bg-gray-50 cursor-pointer ${!email.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => handleEmailClick(email)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm">
                                {email.from.name || email.from.email}
                              </span>
                              {!email.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                              {email.isImportant && (
                                <span className="text-yellow-500">⭐</span>
                              )}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {email.subject}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {email.body.text?.substring(0, 200)}...
                            </p>
                            <div className="text-xs text-gray-500">
                              {new Date(email.date).toLocaleDateString()} {new Date(email.date).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEmail(email);
                              }}
                              className="text-red-400 hover:text-red-600 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <AddAccountModal onClose={() => setShowAddAccount(false)} />
      )}

      {/* Compose Email Modal */}
      {showCompose && (
        <ComposeEmailModal 
          onClose={() => setShowCompose(false)} 
          accountId={selectedAccount!}
        />
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <EmailDetailModal 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)}
          onDelete={() => {
            handleDeleteEmail(selectedEmail);
            setSelectedEmail(null);
          }}
        />
      )}
    </div>
  );
}

// Simple Add Account Modal
function AddAccountModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    provider: 'GMAIL' as const,
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
    imapUser: '',
    imapPassword: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addAccount } = useEmailStore();

  // Provider configurations
  const providers = {
    GMAIL: {
      name: 'Gmail',
      imap: { host: 'imap.gmail.com', port: 993, secure: true },
      smtp: { host: 'smtp.gmail.com', port: 587, secure: false },
      notes: ['Requires App Password if 2FA is enabled', 'Enable IMAP in Gmail settings']
    },
    OUTLOOK: {
      name: 'Outlook/Hotmail',
      imap: { host: 'outlook.office365.com', port: 993, secure: true },
      smtp: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
      notes: ['Requires App Password if 2FA is enabled', 'Enable IMAP in Outlook settings']
    },
    YAHOO: {
      name: 'Yahoo Mail',
      imap: { host: 'imap.mail.yahoo.com', port: 993, secure: true },
      smtp: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
      notes: ['Requires App Password if 2FA is enabled', 'Enable IMAP in Yahoo settings']
    },
    ICLOUD: {
      name: 'iCloud Mail',
      imap: { host: 'imap.mail.me.com', port: 993, secure: true },
      smtp: { host: 'smtp.mail.me.com', port: 587, secure: false },
      notes: ['Requires App-Specific Password', 'Enable IMAP in iCloud Mail settings']
    },
    PROTONMAIL: {
      name: 'ProtonMail',
      imap: { host: '127.0.0.1', port: 1143, secure: false },
      smtp: { host: '127.0.0.1', port: 1025, secure: false },
      notes: ['Requires ProtonMail Bridge application', 'Bridge must be running locally']
    },
    ZOHO: {
      name: 'Zoho Mail',
      imap: { host: 'imap.zoho.com', port: 993, secure: true },
      smtp: { host: 'smtp.zoho.com', port: 587, secure: false },
      notes: ['Enable IMAP in Zoho Mail settings', 'Use your Zoho email and password']
    },
    CUSTOM: {
      name: 'Custom IMAP/SMTP',
      imap: { host: '', port: 993, secure: true },
      smtp: { host: '', port: 587, secure: false },
      notes: ['Enter your custom server details', 'Common ports: IMAP (143/993), SMTP (25/587/465)']
    }
  };

  const handleProviderChange = (provider: string) => {
    const config = providers[provider as keyof typeof providers];
    if (config) {
      setFormData({
        ...formData,
        provider: provider as any,
        imapHost: config.imap.host,
        imapPort: config.imap.port,
        imapSecure: config.imap.secure,
        smtpHost: config.smtp.host,
        smtpPort: config.smtp.port,
        smtpSecure: config.smtp.secure,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addAccount(formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers[formData.provider];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Email Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Work Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {Object.entries(providers).map(([key, provider]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
          </div>

          {selectedProvider && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="font-medium text-blue-900 mb-2">Provider Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {selectedProvider.notes.map((note, index) => (
                  <li key={index}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMAP Host</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.imapHost}
                onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                placeholder="imap.gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMAP Port</label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.imapPort}
                onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMAP Username</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.imapUser}
                onChange={(e) => setFormData({ ...formData, imapUser: e.target.value })}
                placeholder="your.email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMAP Password</label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.imapPassword}
                onChange={(e) => setFormData({ ...formData, imapPassword: e.target.value })}
                placeholder="Password or App Password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="imapSecure"
              checked={formData.imapSecure}
              onChange={(e) => setFormData({ ...formData, imapSecure: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="imapSecure" className="text-sm text-gray-700">
              Use SSL/TLS for IMAP
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.smtpHost}
                onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.smtpPort}
                onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.smtpUser}
                onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                placeholder="your.email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.smtpPassword}
                onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                placeholder="Password or App Password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="smtpSecure"
              checked={formData.smtpSecure}
              onChange={(e) => setFormData({ ...formData, smtpSecure: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="smtpSecure" className="text-sm text-gray-700">
              Use SSL/TLS for SMTP
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Compose Email Modal
function ComposeEmailModal({ onClose, accountId }: { onClose: () => void; accountId: string }) {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { sendEmail } = useEmailStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendEmail(accountId, formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Compose Email</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows={10}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Write your message here..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Email Detail Modal
function EmailDetailModal({ 
  email, 
  onClose, 
  onDelete 
}: { 
  email: EmailMessage; 
  onClose: () => void; 
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{email.subject}</h3>
            <p className="text-sm text-gray-500">
              From: {email.from.name || email.from.email}
            </p>
            <p className="text-sm text-gray-500">
              Date: {new Date(email.date).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              🗑️ Delete
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="prose max-w-none">
            {email.body.html ? (
              <div dangerouslySetInnerHTML={{ __html: email.body.html }} />
            ) : (
              <pre className="whitespace-pre-wrap text-sm">{email.body.text}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}