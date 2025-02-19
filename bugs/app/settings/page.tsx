'use client';

import { useState, useEffect } from 'react';

export default function Settings() {
  const [targetUrl, setTargetUrl] = useState('');
  const [autoRun, setAutoRun] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setTargetUrl(data.target_url || '');
        setAutoRun(data.auto_run || false);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to load settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to settings API' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    // Basic URL validation
    const url = targetUrl.trim();
    if (url && !url.match(/^https?:\/\/.+/)) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid URL format. URL must start with http:// or https://' 
      });
      setIsSaving(false);
      return;
    }
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: url,
          auto_run: autoRun,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Settings saved successfully' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to save settings' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to connect to the server. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-500">Configure your test automation settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Application URL
            </label>
            <input 
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter the URL of the application you want to test"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              The URL of the web application you want to test. This can be a local development server or a deployed application.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Auto-run Tests</h3>
              <p className="text-sm text-gray-500">Automatically run tests when code changes are detected</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>

        {message.text && (
          <div className={`mt-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mt-6">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
} 