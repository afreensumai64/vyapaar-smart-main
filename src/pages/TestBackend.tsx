import { useEffect, useState } from 'react';
import { getDashboardStats, getInsights } from '@/services/api';

export const TestBackend = () => {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('Testing dashboard stats...');
        const stats = await getDashboardStats();
        setData(stats);
        setStatus('Dashboard stats working!');
        
        const insights = await getInsights();
        console.log('Insights:', insights);
      } catch (error) {
        setStatus(`Error: ${error.message}`);
        console.error(error);
      }
    };
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl text-white mb-4">Backend Test</h1>
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-white">Status: {status}</p>
        <pre className="text-green-400 mt-4 text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};