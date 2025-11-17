import React, { useState } from 'react';
import './TaskForm.css';

function TaskForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        dueDate: '',
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignee">Assignee</label>
              <input
                type="text"
                id="assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                placeholder="Enter assignee name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;