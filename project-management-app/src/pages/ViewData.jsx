import React, { useEffect, useState } from 'react';
import { projectAPI } from '../api';

export default function ViewData() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const data = await projectAPI.getAllProjectData();
      console.log(data)
      // Add color for each project for visualization
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const processedData = data.map((project, index) => ({
        ...project,
        color: colors[index % colors.length]
      }));
      setProjects(processedData);
    } catch (err) {
      console.error('Failed to load all project data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date (date only)
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Overview</h1>
        <p className="text-gray-600">View all projects, tasks, and team members</p>
      </div>

      {/* Project Count */}
      <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="space-y-8">
        {projects.map(project => (
          <div key={project.id} className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
            <p className="text-gray-700 mb-4">{project.description}</p>
            
            {/* Project Timeline */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-700">Project Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Start Date </div>
                  <div className="font-medium">{formatDate(project.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">End Date </div>
                  <div className="font-medium">{formatDate(project.due_date)}</div>
                </div>
              </div>
            </div>
            
            {/* Team Members */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Team Members</h3>
              {project.members && project.members.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.members.map(member => (
                    <div key={member.id} className="px-3 py-2 bg-gray-100 rounded-lg">
                      <div className="font-medium">{member.first_name} {member.last_name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No team members assigned.</p>
              )}
            </div>
            
            {/* Tasks */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Tasks</h3>
              {project.tasks && project.tasks.length > 0 ? (
                <div className="space-y-3">
                  {project.tasks.map(task => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-md border-l-4" style={{ borderColor: project.color }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">{task.status}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                           {formatDate(task.due_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tasks for this project.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}