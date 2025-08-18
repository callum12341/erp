import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { Emails } from './Emails';

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'emails' | 'deals'>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'emails':
        return <Emails />;
      case 'dashboard':
      default:
        return (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to your CRM Dashboard!
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Your business management solution is ready.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('contacts')}
                      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg mb-2">📋 Contacts</h3>
                      <p className="text-gray-600">Manage your customers</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('emails')}
                      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg mb-2">📧 Emails</h3>
                      <p className="text-gray-600">Email integration</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('deals')}
                      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg mb-2">💰 Deals</h3>
                      <p className="text-gray-600">Track your sales</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">🚀 Modern CRM</h1>
              
              {/* Navigation Tabs */}
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'contacts'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Contacts
                </button>
                <button
                  onClick={() => setActiveTab('emails')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'emails'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Emails
                </button>
                <button
                  onClick={() => setActiveTab('deals')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'deals'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Deals
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}!
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}