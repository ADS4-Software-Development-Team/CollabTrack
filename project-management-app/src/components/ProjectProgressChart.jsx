// src/components/ProjectProgressChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function ProjectProgressChart({ projects }) {
  // Transform project data for the chart
  const chartData = projects.map(project => ({
    name: project.title.length > 15 ? project.title.substring(0, 15) + '...' : project.title,
    progress: project.progress || 0,
    tasks: project.task_count || 0,
    members: project.member_count || 0,
    status: project.status,
    fullTitle: project.title,
    id: project.id
  }));

  // Sort by progress (descending)
  chartData.sort((a, b) => b.progress - a.progress);

  // Status color mapping
  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('done')) return '#10b981'; // green
    if (statusLower.includes('active') || statusLower.includes('progress')) return '#3b82f6'; // blue
    if (statusLower.includes('pending') || statusLower.includes('todo')) return '#f59e0b'; // amber
    if (statusLower.includes('block') || statusLower.includes('stalled')) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-bold text-gray-900 mb-2">{data.fullTitle}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-600">Progress: </span>
              <span className="font-semibold">{data.progress}%</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Tasks: </span>
              <span className="font-semibold">{data.tasks}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Team Members: </span>
              <span className="font-semibold">{data.members}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Status: </span>
              <span className="font-semibold capitalize">{data.status || 'Not set'}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-lg mb-2">No project data available</div>
        <div className="text-gray-400 text-sm">Create or filter projects to see progress charts</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis 
            label={{ 
              value: 'Progress (%)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10,
              style: { textAnchor: 'middle', fontSize: 12 }
            }}
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
          <Bar 
            dataKey="progress" 
            name="Progress %" 
            radius={[4, 4, 0, 0]}
            minPointSize={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}-${entry.id}`} 
                fill={getStatusColor(entry.status)}
                strokeWidth={1}
                stroke="rgba(0, 0, 0, 0.1)"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center text-sm text-gray-500 mt-4">
        Showing {projects.length} projects sorted by progress
      </div>
    </div>
  );
}