import React, { useState, useEffect, useContext } from 'react';
import { projectAPI, userAPI } from '../api';
import { useNavigate } from 'react-router-dom';

export default function ProjectForm({ onProjectCreated, workspaceId, project, onCancel }){
  const [title, setTitle] = useState(project ? project.title : '');
  const [desc, setDesc] = useState(project ? project.description : '');
  const [dueDate, setDueDate] = useState(project ? project.due_date.split('T')[0] : ''); // Format date for input type="date"
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // New state for team member details
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Populate form fields if a project is passed for editing
    if (project) {
      setTitle(project.title);
      setDesc(project.description);
      setDueDate(project.due_date.split('T')[0]);
      // Assuming project also has a way to get its current members
      // For now, we'll leave selectedUsers and teamMembers as is,
      // as the current form doesn't handle existing project members cleanly
      // It would require fetching project members and pre-selecting them.
    } else {
      // Clear form for new project creation
      setTitle('');
      setDesc('');
      setDueDate('');
      setSelectedUsers([]);
      setTeamMembers([]);
    }
  }, [project]);

  useEffect(() => {
            const fetchUsers = async () => {
          try {
            const userList = await userAPI.listUsers();
            console.log("Fetched user list:", userList); // Log the raw list
            const filteredUsers = userList.filter(u => u.user_role === 'team_member');
            console.log("Filtered team members:", filteredUsers); // Log the filtered list
            setUsers(filteredUsers);
          } catch (error) {
            console.error("Failed to fetch users", error);
          }
        };    fetchUsers();
  }, []);

  const handleUserSelection = (user) => {
    // Check if user is already selected
    const isSelected = selectedUsers.includes(user.id);
    
    if (isSelected) {
      // Remove user
      setSelectedUsers(prev => prev.filter(id => id !== user.id));
      setTeamMembers(prev => prev.filter(member => member.user_id !== user.id));
    } else {
      // Add user with full details matching schema
      setSelectedUsers(prev => [...prev, user.id]);
      setTeamMembers(prev => [...prev, {
        user_id: user.id,
        first_name: user.first_name || user.username.split(' ')[0],
        last_name: user.last_name || user.username.split(' ')[1] || '',
        email: user.email,
        role: user.user_role || 'team_member' // Default role
      }]);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      alert('Please enter a project title');
      return;
    }
    
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }
    
    try {
      setLoading(true);
      
      const projectData = { 
        title: title.trim(), 
        description: desc.trim(), 
        due_date: dueDate,
        workspace_id: workspaceId
      };

      let resultProject;
      if (project) {
        // Update existing project
        resultProject = await projectAPI.updateProject(project.id, projectData);
        alert('Project updated successfully!');
      } else {
        // Create new project
        // Note: team_members logic needs to be handled if project creation is tied to it.
        // For now, assuming team_members are added after project creation or via a separate API.
        const createProjectData = { ...projectData, team_members: teamMembers };
        resultProject = await projectAPI.createProject(createProjectData);
        alert('Project created successfully!');
      }
      
      console.log('Project operation successful:', resultProject);
      onProjectCreated(); // Call the callback to close modal and refresh data
      
    } catch (err) {
      console.error('Project operation error:', err);
      alert(err.message || `Failed to ${project ? 'update' : 'create'} project. Please try again.`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-lg bg-white p-5 rounded shadow mx-auto">
      <h3 className="text-lg mb-3">{project ? 'Edit Project' : 'Create Project'}</h3>
      <form onSubmit={submit} className="space-y-3">
       <div className="space-y-2">
          <h4 className="text-md font-semibold">Title</h4>  
           <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Title" 
          required
          className="w-full p-2 border rounded"/>
          </div>
       <div className="space-y-2">
          <h4 className="text-md font-semibold">Description</h4>  
           <textarea 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          placeholder="Description" 
          className="w-full p-2 border rounded"/>
          </div>
        <h4 className="text-md font-semibold">Due Date</h4>
        <input 
          type="date" 
          value={dueDate} 
          onChange={e => setDueDate(e.target.value)} 
          required
          className="w-full p-2 border rounded"
        />

        {project ? null : ( // Only show team member selection for new projects
          <div className="space-y-2">
            <h4 className="text-md font-semibold">Add Team Members</h4>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelection(user)}
                    className="mr-2"
                  />
                    <label htmlFor={`user-${user.id}`}>{user.username} ({user.email})
                    <div>{user.first_name} {user.last_name}</div>
                    {user.role && <div className="text-xs text-gray-400">Role: {user.role}</div>}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display selected team members with details */}
        {project ? null : ( // Only show selected team members for new projects
          teamMembers.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h5 className="font-semibold mb-2">Selected Team Members:</h5>
              {teamMembers.map(member => (
                <div key={member.user_id} className="text-sm mb-1">
                  {member.first_name} {member.last_name} - {member.email}
                </div>
              ))}
            </div>
          )
        )}
 
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel || onProjectCreated} // Use onCancel if available, otherwise onProjectCreated
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading || !title.trim() || !dueDate}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (project ? 'Saving...' : 'Creating...') : (project ? 'Save Changes' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
}