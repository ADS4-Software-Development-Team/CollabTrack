// src/pages/ProjectCharts.jsx
import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../api';
import ProjectProgressChart from '../components/ProjectProgressChart';

export default function ProjectCharts() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsAPI.getProjectAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }

  // Get all projects
  const projects = analytics?.projects || [];

  // Calculate statistics from analytics data
  const stats = analytics ? {
    total: analytics.totalProjects || 0,
    active: analytics.activeProjects || 0,
    completed: analytics.completedProjects || 0,
    averageProgress: analytics.averageProgress || 0,
    totalTasks: analytics.totalTasks || 0,
    totalMembers: analytics.totalMembers || 0,
    overdueTasks: analytics.overdueTasks || 0,
    highPriorityTasks: analytics.highPriorityTasks || 0
  } : {
    total: 0,
    active: 0,
    completed: 0,
    averageProgress: 0,
    totalTasks: 0,
    totalMembers: 0,
    overdueTasks: 0,
    highPriorityTasks: 0
  };

  // Calculate task completion rate
  const taskCompletionRate = stats.totalTasks > 0 
    ? Math.round(((stats.totalTasks - stats.overdueTasks) / stats.totalTasks) * 100)
    : 0;

  // Get projects by priority
  const getProjectsByPriority = () => {
    if (!analytics?.projects) return { high: 0, medium: 0, low: 0 };
    
    const priorityCount = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    analytics.projects.forEach(project => {
      const priority = (project.priority || 'medium').toLowerCase();
      if (priority.includes('high')) {
        priorityCount.high++;
      } else if (priority.includes('low')) {
        priorityCount.low++;
      } else {
        priorityCount.medium++;
      }
    });
    
    return priorityCount;
  };

  const priorityDistribution = getProjectsByPriority();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Progress Analytics</h1>
        <p className="text-gray-600">Visualize project performance and track progress across all projects</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{stats.averageProgress}%</div>
          <div className="text-gray-600">Average Progress</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">{stats.totalTasks}</div>
          <div className="text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="text-3xl font-bold text-amber-600">{stats.totalMembers}</div>
          <div className="text-gray-600">Team Members</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Project Progress Overview</h2>
          <div className="text-sm text-gray-600">
            Showing all {projects.length} projects
          </div>
        </div>
        <ProjectProgressChart projects={projects} />
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Option 1: Project Priority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Project Priority Distribution</h2>
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {priorityDistribution.high}
              </div>
              <div className="text-gray-600">High Priority Projects</div>
            </div>
            <div className="w-full max-w-md">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-red-600">High Priority</span>
                    <span className="text-sm font-medium">{priorityDistribution.high}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(priorityDistribution.high / stats.total) * 100 || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
                    <span className="text-sm font-medium">{priorityDistribution.medium}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(priorityDistribution.medium / stats.total) * 100 || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-green-600">Low Priority</span>
                    <span className="text-sm font-medium">{priorityDistribution.low}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(priorityDistribution.low / stats.total) * 100 || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Task Completion Rate */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Task Completion Rate</h2>
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {taskCompletionRate}%
              </div>
              <div className="text-gray-600">Tasks Completed On Time</div>
            </div>
            <div className="w-full max-w-md">
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${taskCompletionRate * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalTasks}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {stats.totalTasks - stats.overdueTasks}
                    </div>
                    <div className="text-sm text-gray-600">On Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {stats.overdueTasks}
                    </div>
                    <div className="text-sm text-gray-600">Overdue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Option 3: Team Performance */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Team Performance</h2>
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.totalMembers}
              </div>
              <div className="text-gray-600">Active Team Members</div>
            </div>
            <div className="w-full max-w-md">
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-blue-600">
                  {stats.averageProgress}%
                </div>
                <div className="text-sm text-gray-600">Average Member Contribution</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks per Member:</span>
                  <span className="font-medium">
                    {stats.totalMembers > 0 
                      ? Math.round(stats.totalTasks / stats.totalMembers) 
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Projects per Member:</span>
                  <span className="font-medium">
                    {stats.totalMembers > 0 
                      ? (stats.total / stats.totalMembers).toFixed(1) 
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">High Priority Tasks:</span>
                  <span className="font-medium text-red-600">
                    {stats.highPriorityTasks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}