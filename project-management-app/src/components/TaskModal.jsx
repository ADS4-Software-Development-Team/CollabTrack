import React from 'react';

export default function TaskModal({ task, onClose, onEdit }) {
	if (!task) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
			<div className="bg-white p-6 rounded-lg w-1/3">
				<h2 className="text-2xl font-bold mb-4">{task.title}</h2>
				<p className="mb-4">{task.description}</p>
				<div className="flex justify-end space-x-4">
					<button
						onClick={onEdit}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						Edit
					</button>

					<button
						onClick={onClose}
						className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
