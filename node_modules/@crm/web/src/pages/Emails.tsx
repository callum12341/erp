import { useEffect, useState } from 'react';
import { useEmailStore } from '@/store/emailStore';

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
  } = useEmailStore();

  const [showCompose, setShowCompose] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Compose Email
              </button>
            )}
          </div>
        </div>
      </div>

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
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
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
                            <div className="mt-1 flex items-center">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                account.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {account.provider}
                              </span>
                              {account.isActive && (
                                <span className="ml-2 w-2 h-2 bg-green-400 rounded-full"></span>
                              )}
                            </div>
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
                {/* Email Account Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedAccountData?.name}</h2>
                      <p className="text-sm text-gray-500">{selectedAccountData?.email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {loading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      )}
                      <button
                        onClick={() => setSelectedAccount(selectedAccount)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Email List */}
                <div className="divide-y divide-gray-200">
                  {loading && messages.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading emails...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No emails found</p>
                    </div>
                  ) : (
                    messages.map((email) => (
                      <div key={email.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm text-gray-900">
                                {email.from.name || email.from.email}
                              </span>
                              {!email.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                              {email.isImportant && (
                                <span className="text-yellow-500">⭐</span>
                              )}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                              {email.subject}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {email.body.text?.substring(0, 200)}...
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>To: {email.to.map(t => t.email).join(', ')}</span>
                              <span>•</span>
                              <span>{new Date(email.date).toLocaleDateString()}</span>
                              <span>{new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
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
      {showCompose && selectedAccount && (
        <ComposeEmailModal
          accountId={selectedAccount}
          onClose={() => setShowCompose(false)}
        />
      )}
    </div>
  );
}

// Add Account Modal Component
function AddAccountModal({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<'GMAIL' | 'OUTLOOK' | 'IMAP'>('GMAIL');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
    imapUser: '',
    imapPassword: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { addAccount } = useEmailStore();

  const presets = {
    GMAIL: {
      imapHost: 'imap.gmail.com',
      imapPort: 993,
      imapSecure: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true,
    },
    OUTLOOK: {
      imapHost: 'outlook.office365.com',
      imapPort: 993,
      imapSecure: true,
      smtpHost: 'smtp.office365.com',
      smtpPort: 587,
      smtpSecure: true,
    },
    IMAP: {
      imapHost: '',
      imapPort: 993,
      imapSecure: true,
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: true,
    }
  };

  const handleProviderChange = (newProvider: typeof provider) => {
    setProvider(newProvider);
    const preset = presets[newProvider];
    setFormData(prev => ({
      ...prev,
      ...preset,
      imapUser: prev.email,
      smtpUser: prev.email,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addAccount({
        ...formData,
        provider,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Email Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value, imapUser: e.target.value, smtpUser: e.target.value })}
              placeholder="your.email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as typeof provider)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="GMAIL">Gmail</option>
              <option value="OUTLOOK">Outlook</option>
              <option value="IMAP">Custom IMAP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.imapPassword}
              onChange={(e) => setFormData({ 
                ...formData, 
                imapPassword: e.target.value,
                smtpPassword: e.target.value 
              })}
              placeholder="App password for Gmail/Outlook"
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
              {loading ? 'Testing...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Compose Email Modal Component
function ComposeEmailModal({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
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
      await sendEmail(accountId, {
        to: formData.to.split(',').map(email => email.trim()),
        cc: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
        bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
        subject: formData.subject,
        text: formData.text,
      });

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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Compose Email</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="email@example.com, another@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.bcc}
                onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              required
              rows={10}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Type your message here..."
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