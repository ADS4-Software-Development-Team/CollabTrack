import React, { useState, useEffect } from 'react';

export default function TaskFormModal({ task, onSave, onClose, projects, users }) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		project_id: '',
		assigned_to: '',
		status: 'pending',
	});

	useEffect(() => {
		if (task) {
			setFormData({
				title: task.title || '',
				description: task.description || '',
				project_id: task.project_id || '',
				assigned_to: task.assigned_to || '',
				status: task.status || 'pending',
			});
		}
	}, [task]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(formData);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
			<div className="bg-white p-6 rounded-lg w-1/3">
				<h2 className="text-2xl font-bold mb-4">
					{task ? 'Edit Task' : 'Create Task'}
				</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Title
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							required
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Project
						</label>
						<select
							name="project_id"
							value={formData.project_id}
							onChange={handleChange}
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							required
						>
							<option value="">Select a project</option>
							{projects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.title}
								</option>
							))}
						</select>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Assign To
						</label>
						<select
							name="assigned_to"
							value={formData.assigned_to}
							onChange={handleChange}
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						>
							<option value="">Unassigned</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.username}
								</option>
							))}
						</select>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Status
						</label>
						<select
							name="status"
							value={formData.status}
							onChange={handleChange}
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						>
							<option value="pending">To Do</option>
							<option value="in-progress">In Progress</option>
							<option value="done">Done</option>
						</select>
					</div>
					<div className="flex justify-end space-x-4">
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						>
							Save
						</button>
						<button
							type="button"
							onClick={onClose}
							className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
