import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

export default function ViewData() {
  const [counts, setCounts] = useState({ projects: 0, tasks: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getStats();
      setCounts({ projects: data.projects > 0, tasks: data.tasks || 0, users: data.users || 0 });
    } catch (err) {
      console.error('Failed to load counts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">View Data</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-xl font-semibold">Projects</h3>
            <div className="text-3xl mt-2">{counts.projects}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <div className="text-3xl mt-2">{counts.tasks}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-xl font-semibold">Users</h3>
            <div className="text-3xl mt-2">{counts.users}</div>
          </div>
        </div>
      )}
    </div>
  );
}
