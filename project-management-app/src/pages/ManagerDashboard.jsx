import React, { useEffect, useState } from 'react';
import { projectAPI, tasksAPI } from '../api';
import AssignTaskModal from '../components/AssignTaskModal';

export default function ManagerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [taskComments, setTaskComments] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskMember, setTaskMember] = useState(null);


  useEffect(() => { 
    loadProjects(); 
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      console.log('User in localStorage:', user);
      console.log('User ID:', user.id);
      console.log('User Role:', user.role || user.user_role);
      console.log('Token exists:', !!localStorage.getItem('token'));
      
      const allProjects = await projectAPI.getProjects();
      
      console.log('Projects API response:', allProjects);
      
      if (!Array.isArray(allProjects)) {
        console.error('Projects is not an array:', allProjects);
        setProjects([]);
        return;
      }
      
      console.log('Projects loaded count:', allProjects.length);
      
      const formattedProjects = allProjects.map(project => {
        console.log('Processing project:', project);
        
        let progress = project.progress || 0;
        
        // Only calculate progress if tasks exist
        if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {
          const completedTasks = project.tasks.filter(task => 
            task.status === 'completed' || task.status === 'done'
          ).length;
          progress = Math.round((completedTasks / project.tasks.length) * 100);
        }
        
        return {
          id: project.id,
          title: project.title,
          description: project.description || '',
          status: project.status || 'active',
          progress: progress,
          due_date: project.due_date || project.deadline,
          created_at: project.created_at,
          member_count: project.members ? project.members.length : 0,
          task_count: project.tasks ? project.tasks.length : 0,
          members: project.members || []
        };
      });
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      console.error('Error details:', err.message, err.status);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function openProject(project) {
    setSelectedProject(project);
    setDetailLoading(true);
    try {
      // Fetch project details
      const fullProject = await projectAPI.getProjectById(project.id);
      
      // Fetch tasks for this project
      const tasks = await projectAPI.getTasksForProject(project.id);
      
      // Use members from the initial project data (from getProjects)
      const members = project.members || [];
      
      setSelectedTasks(tasks || []);
      setSelectedMembers(members || []);
      
      // Calculate progress based on tasks
      let progress = 0;
      if (tasks && tasks.length > 0) {
        const completedTasks = tasks.filter(task => 
          task.status === 'completed' || task.status === 'done'
        ).length;
        progress = Math.round((completedTasks / tasks.length) * 100);
      }
      
      const updatedProject = {
        ...project,
        ...fullProject,
        progress: progress
      };
      
      setSelectedProject(updatedProject);
      
      console.log('Project opened:', {
        project: updatedProject,
        tasks: tasks?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load project details:', err);
      
      // Fallback to project data from the list
      const members = project.members || [];
      setSelectedTasks([]);
      setSelectedMembers(members);
      
      const updatedProject = {
        ...project,
        progress: project.progress || 0
      };
      
      setSelectedProject(updatedProject);
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadCommentsForTask(taskId) {
    try {
      const comments = await tasksAPI.getCommentsForTask(taskId);
      setTaskComments(prev => ({ ...prev, [taskId]: comments }));
    } catch (err) {
      console.error(`Failed to load comments for task ${taskId}:`, err);
      setTaskComments(prev => ({ ...prev, [taskId]: [] }));
    }
  }
  function openAssignTask(member) {
    setTaskMember(member);
    setShowTaskModal(true);
  }

  async function handleCreateTask(taskData) {
    try {
      if (!selectedProject || !selectedProject.id) {
        throw new Error('No project selected');
      }
      
      // Get current user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare task data for API
      const taskToCreate = {
        title: taskData.title,
        description: taskData.description || '',
        project_id: selectedProject.id,
        assigned_to: taskData.assigned_to || (taskMember ? taskMember.id : null),
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        status: 'pending',
        created_by: user.id
      };
      
      console.log('Sending task data to API:', taskToCreate);
      
      const createdTask = await projectAPI.createTask(taskToCreate);
      console.log('Task created successfully:', createdTask);
      
      // Refresh tasks for the current project
      const updatedTasks = await projectAPI.getTasksForProject(selectedProject.id);
      setSelectedTasks(updatedTasks || []);
      
      // Show success message
      alert('Task created successfully!');
      
      setShowTaskModal(false);
      setTaskMember(null);
      
      return createdTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      alert(`Failed to create task: ${err.message || 'Please try again'}`);
      throw err;
    }
  }

  function getInitials(firstName, lastName) {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  function formatDate(dateString) {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  }

  function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Content - Left Side */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Projects</h1>
          <p className="text-gray-600">Click on a project to view details and manage tasks</p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => openProject(project)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
              >
                {/* Project card content */}
                <div className="p-5">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
                        {project.status || 'Active'}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                    </div>
                  </div>
                  
                  {/* Project Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{project.task_count || 0}</div>
                      <div className="text-xs text-gray-600">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{project.member_count || 0}</div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                  </div>
                  
                  {/* Due Date */}
                  {project.due_date && (
                    <div className="text-sm text-gray-500 mb-4">
                      Due: {formatDate(project.due_date)}
                    </div>
                  )}
                  
                  {/* Team Members Preview */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members && project.members.slice(0, 3).map((member, index) => (
                        <div 
                          key={member.id || index}
                          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
                          title={`${member.first_name} ${member.last_name}`}
                        >
                          {getInitials(member.first_name, member.last_name)}
                        </div>
                      ))}
                      {project.members && project.members.length > 3 && (
                        <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
              {/* Modal Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900">{selectedProject.title}</h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {selectedProject.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {selectedProject.description || 'No description provided'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedProject(null);
                      setSelectedTasks([]);
                      setSelectedMembers([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {detailLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-8">
                    {/* Left Column - Tasks */}
                    <div className="col-span-2">
                      <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4">Tasks ({selectedTasks.length})</h3>
                        {selectedTasks.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No tasks yet</p>
                            <p className="text-sm text-gray-400 mt-1">Assign tasks to team members to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedTasks.map(task => {
                              const assignee = selectedMembers.find(m => m.id === task.assigned_to);
                              return (
                                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                                      {assignee && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          Assigned to {assignee.first_name} {assignee.last_name}
                                        </p>
                                      )}
                                      {task.description && (
                                        <p className="text-gray-600 text-sm mt-2">{task.description}</p>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end">
                                      {task.due_date && (
                                        <span className="text-sm text-gray-500">
                                          {formatDate(task.due_date)}
                                        </span>
                                      )}
                                      <span className={`px-2 py-1 text-xs rounded-full mt-2 ${
                                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {task.priority}
                                      </span>
                                      <span className={`px-2 py-1 text-xs rounded-full mt-1 ${
                                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {task.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <button
                                      onClick={() => {
                                        const newActiveTask = activeTask === task.id ? null : task.id;
                                        setActiveTask(newActiveTask);
                                        if (newActiveTask && !taskComments[task.id]) {
                                          loadCommentsForTask(task.id);
                                        }
                                      }}
                                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                      {activeTask === task.id ? 'Hide Comments' : 'View Comments'}
                                    </button>
                                    {activeTask === task.id && (
                                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                        {taskComments[task.id] ? (
                                          taskComments[task.id].length > 0 ? (
                                            <div className="space-y-4">
                                              {taskComments[task.id].map(comment => (
                                                <div key={comment.id} className="text-sm">
                                                  <p className="font-medium text-gray-800">{comment.user_name}</p>
                                                  <p className="text-gray-600">{comment.content}</p>
                                                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(comment.created_at)}</p>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-500">No comments for this task yet.</p>
                                          )
                                        ) : (
                                          <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <p className="text-sm text-gray-500">Loading comments...</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Project Info & Team */}
                    <div className="space-y-6">
                      {/* Due Date */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Due Date</h4>
                        <p className="text-gray-600">
                          {selectedProject.due_date 
                            ? formatDate(selectedProject.due_date) 
                            : 'Not set'}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Progress</h4>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedProject.progress}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${selectedProject.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Team Members</h4>
                        <div className="space-y-4">
                          {selectedMembers.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">No team members</p>
                            </div>
                          ) : (
                            selectedMembers.map(member => (
                              <div 
                                key={member.id} 
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    {getInitials(member.first_name, member.last_name)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {member.first_name} {member.last_name}
                                    </div>
                                    <div className="text-sm text-gray-600">{member.role || 'Team Member'}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openAssignTask(member)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                >
                                  Assign Task
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      {/* Task Creation Modal */}
      {showTaskModal && (
        <AssignTaskModal
          onClose={() => {
            setShowTaskModal(false);
            setTaskMember(null);
          }}
          members={selectedMembers}
          onAssign={handleCreateTask}
          member={taskMember}
        />
      )}
 </div>   </div>
  );
} 