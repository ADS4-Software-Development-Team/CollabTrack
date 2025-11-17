import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  projects: [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Build new mobile application for iOS and Android',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
  ],
  tasks: [
    {
      id: '1',
      projectId: '1',
      title: 'Design Homepage',
      description: 'Create new homepage layout and design',
      status: 'in-progress',
      assignee: 'John Doe',
      priority: 'high',
      dueDate: '2024-02-15',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      projectId: '1',
      title: 'Update Contact Page',
      description: 'Refresh the contact page with new information',
      status: 'todo',
      assignee: 'Jane Smith',
      priority: 'medium',
      dueDate: '2024-02-20',
      createdAt: new Date().toISOString(),
    }
  ],
  selectedProject: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        // In a real app, you'd set the user from the action payload
        user: { name: 'Demo User' },
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'ADD_PROJECT':
      const newProject = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
      };

    case 'ADD_TASK':
      const newTask = {
        id: uuidv4(),
        projectId: action.payload.projectId,
        title: action.payload.title,
        description: action.payload.description,
        status: 'todo',
        assignee: action.payload.assignee,
        priority: action.payload.priority,
        dueDate: action.payload.dueDate,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.status }
            : task
        ),
      };

    case 'SET_SELECTED_PROJECT':
      return {
        ...state,
        selectedProject: action.payload.projectId,
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}