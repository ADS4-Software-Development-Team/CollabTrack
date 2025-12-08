import React, { useState, useEffect } from 'react';

// CHANGE THIS TO MATCH YOUR BACKEND
const API_BASE = 'http://localhost:4001/api';

export default function Tasks() {
  // Get current logged-in user from localStorage (same as your auth)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const currentUserName = storedUser.username || storedUser.name || 'Team Member';
  const currentUserId = storedUser.id;

  const currentUserAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=6366f1&color=fff&bold=true`;

  const [myTasks, setMyTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasksAndComments = async () => {
      if (!token || !currentUserId) {
        setError('Please log in to see your tasks.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch all tasks
        const res = await fetch(`${API_BASE}/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const allTasks = await res.json();

        // 2. Filter for user's tasks and format them
        const userTasks = allTasks
          .filter(task => task.assigned_to === currentUserId)
          .map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status === 'pending' ? 'To-Do' : 
                    task.status === 'in_progress' ? 'In-progress' : 
                    task.status === 'done' ? 'Done' : 'Backlog',
            priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
            dueDate: task.due_date,
          }));
        setMyTasks(userTasks);

        // 3. Fetch comments for each of the user's tasks
        const commentsData = {};
        for (const task of userTasks) {
          const commentsRes = await fetch(`${API_BASE}/comments/task/${task.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (commentsRes.ok) {
            const taskComments = await commentsRes.json();
            // The backend returns 'username', but the component expects 'author'
            commentsData[task.id] = taskComments.map(c => ({
              ...c,
              author: c.username,
              text: c.content,
              timestamp: new Date(c.created_at).toLocaleString('en-US', { hour12: true })
            }));
          }
        }
        setComments(commentsData);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndComments();
  }, [token, currentUserId]);

  const handleAddComment = async (taskId) => {
    const text = newComment[taskId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, task_id: taskId }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const { comment: newCommentData } = await res.json();
      
      // Add the new comment to the state to update UI
      const formattedComment = { ...newCommentData, author: newCommentData.username, text: newCommentData.content, timestamp: new Date(newCommentData.created_at).toLocaleString('en-US', { hour12: true }) };
      setComments(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), formattedComment] }));
      setNewComment(prev => ({ ...prev, [taskId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Could not add comment. Please try again.');
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'In-progress': return 'bg-blue-100 text-blue-800';
      case 'To-Do': return 'bg-gray-100 text-gray-700';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">My Tasks</h1>
          <p className="text-xl text-gray-600">
            Hello <span className="font-bold text-indigo-600">{currentUserName}</span> Here are your assigned tasks
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">Loading your tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl shadow-xl">
            <p className="text-2xl text-red-600">Error: {error}</p>
          </div>
        ) : myTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
            <p className="text-2xl text-gray-500">No tasks assigned to you yet.</p>
            <p className="mt-4 text-gray-400">Time for coffee?</p>
          </div>
        ) : (
          <div className="space-y-8">
            {myTasks.map(task => ( // Changed from task._id to task.id
              <div key={task.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">{task.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-4 py-2 rounded-full font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{task.description}</p>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      Comments ({(comments[task.id] || []).length})
                    </h3>

                    <div className="space-y-5 mb-8">
                      {(comments[task.id] || []).length === 0 ? (
                        <p className="text-gray-400 italic text-center py-6">No comments yet — start the conversation!</p>
                      ) : (
                        comments[task.id].map(c => (
                          <div key={c.id} className="flex gap-4"> // Changed from c.id to c.id
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.author)}&background=random`}
                              alt={c.author}
                              className="w-12 h-12 rounded-full ring-2 ring-gray-200"
                            />
                            <div className="flex-1 bg-gray-50 rounded-2xl px-5 py-4">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900">{c.author}</span>
                                <span className="text-sm text-gray-500">{c.timestamp}</span>
                              </div>
                              <p className="text-gray-700">{c.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-4">
                      <img src={currentUserAvatar} alt={currentUserName} className="w-12 h-12 rounded-full ring-4 ring-indigo-100" />
                      <div className="flex-1">
                        <textarea
                          placeholder="Add a comment..."
                          value={newComment[task.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(task.id);
                            }
                          }}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 resize-none"
                          rows="3"
                        />
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => handleAddComment(task.id)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition"
                          >
                            Send Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}