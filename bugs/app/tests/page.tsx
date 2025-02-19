'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TestFlow } from '@/app/types/test-flow';

export default function TestFlows() {
  const router = useRouter();
  const [testFlows, setTestFlows] = useState<TestFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestFlows();
    // Refresh test list every 5 seconds
    const interval = setInterval(fetchTestFlows, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTestFlows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched test flows:', data);
        setTestFlows(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to load test flows');
      }
    } catch (error) {
      console.error('Failed to fetch test flows:', error);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (testId: string) => {
    try {
      const response = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });

      if (response.ok) {
        // Refresh the list to show updated status
        fetchTestFlows();
      }
    } catch (error) {
      console.error('Failed to run test:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading test flows...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Flows</h1>
          <p className="text-gray-500">Create and manage your automated UI tests</p>
        </div>
        <button
          onClick={() => router.push('/tests/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Test Flow
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {testFlows.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No test flows created yet</div>
            <button
              onClick={() => router.push('/tests/create')}
              className="text-blue-600 hover:text-blue-700"
            >
              Create your first test flow
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {testFlows.map((flow) => (
            <div
              key={flow.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{flow.name}</h3>
                  <p className="text-sm text-gray-500">
                    {flow.instructions.slice(0, 100)}
                    {flow.instructions.length > 100 ? '...' : ''} • Last run:{' '}
                    {flow.lastRun ? new Date(flow.lastRun).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    flow.status === 'passed' ? 'bg-green-100 text-green-800' :
                    flow.status === 'failed' ? 'bg-red-100 text-red-800' :
                    flow.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {flow.status || 'Not Run'}
                  </span>
                  <button
                    onClick={() => runTest(flow.id)}
                    disabled={flow.status === 'running'}
                    className="px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    Run Test
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 