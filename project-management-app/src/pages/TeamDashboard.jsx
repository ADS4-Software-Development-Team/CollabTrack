import React from 'react';
import { Link } from 'react-router-dom';

export default function TeamDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Member Dashboard</h1>
        <Link
          to="/tasks"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          My Tasks
        </Link>
      </div>

      <p className="mb-4">Welcome, <strong>{user.username}</strong>. Here are your assigned tasks.</p>

      <div className="text-gray-500">(Team-member widgets and quick links go here)</div>
    </div>
  );
}
