'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Credentials {
  username?: string;
  password?: string;
}

export default function CreateTestFlow() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [credentials, setCredentials] = useState<Credentials>({});
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setStatus('Creating test and launching browser...');
    
    try {
      console.log('Submitting test flow:', { name, instructions, credentials });
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          instructions: instructions.trim(),
          credentials: Object.fromEntries(
            Object.entries(credentials).filter(([_, v]) => v)
          ),
        }),
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (response.ok) {
        setStatus('Test created successfully! Redirecting...');
        if (data.id) {
          await fetch('/api/tests/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId: data.id }),
          });
        }
        setTimeout(() => {
          router.refresh();
          router.push('/tests');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create test flow');
        setStatus('');
        console.error('Failed to create test:', data);
      }
    } catch (error) {
      console.error('Error creating test:', error);
      setError('Failed to connect to the server. Please try again.');
      setStatus('');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Test Flow</h1>
      
      {error && (
        <div className="mb-6 p-3 rounded bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-6 p-3 rounded bg-blue-100 text-blue-800">
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Flow Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Flow Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., User Login Flow"
            required
            disabled={isCreating}
          />
        </div>

        {/* Test Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Instructions
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Describe the steps a user would take. For example: "Go to the login page, enter username 'test@example.com', type password '12345', click the login button, and verify that the dashboard appears."
          </p>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter detailed instructions for the test flow..."
            required
            disabled={isCreating}
          />
        </div>

        {/* Credentials Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Authentication (if required)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username || ''}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username for authentication"
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password || ''}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password for authentication"
                disabled={isCreating}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/tests')}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating Test Flow...' : 'Create Test Flow'}
          </button>
        </div>
      </form>
    </div>
  );
} 