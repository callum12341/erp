import { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Test API connection
    fetch('/api/test')
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus('API connection failed'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Modern CRM
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your business management solution is ready to build!
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Frontend:</span>
                <span className="text-green-600">✅ Running</span>
              </div>
              <div className="flex justify-between">
                <span>Backend API:</span>
                <span className={apiStatus.includes('working') ? 'text-green-600' : 'text-red-600'}>
                  {apiStatus.includes('working') ? '✅' : '❌'} {apiStatus}
                </span>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Ready to start building your CRM features!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;