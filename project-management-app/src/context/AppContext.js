import React, { createContext, useContext, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

const AppContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: { id: "user1", name: "Demo User", email: "demo@example.com" },
  currentWorkspace: "1",
  workspaces: [
    {
      id: "1",
      name: "Design Team",
      description: "Design and UX projects",
      color: "#4f46e5",
      createdAt: new Date().toISOString(),
      createdBy: "user1",
    },
    {
      id: "2",
      name: "Development",
      description: "Software development projects",
      color: "#059669",
      createdAt: new Date().toISOString(),
      createdBy: "user1",
    },
    {
      id: "3",
      name: "Marketing",
      description: "Marketing campaigns and initiatives",
      color: "#dc2626",
      createdAt: new Date().toISOString(),
      createdBy: "user1",
    },
  ],
  workspaceMembers: [
    {
      id: "1",
      workspaceId: "1",
      userId: "user1",
      email: "demo@example.com",
      name: "Demo User",
      role: "admin",
      avatar: null,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "2",
      workspaceId: "1",
      userId: "user2",
      email: "john@example.com",
      name: "John Doe",
      role: "member",
      avatar: null,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "3",
      workspaceId: "2",
      userId: "user3",
      email: "bob@example.com",
      name: "Bob Johnson",
      role: "admin",
      avatar: null,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "4",
      workspaceId: "1",
      userId: "user4",
      email: "alice@example.com",
      name: "Alice Williams",
      role: "viewer",
      avatar: null,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "5",
      workspaceId: "2",
      userId: "user5",
      email: "charlie@example.com",
      name: "Charlie Brown",
      role: "member",
      avatar: null,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "6",
      workspaceId: "3",
      userId: "user6",
      email: "eva@example.com",
      name: "Eva Davis",
      role: "admin",
      avatar: null,
      joinedAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: "1",
      workspaceId: "1",
      name: "Website Redesign",
      description: "Complete redesign of company website",
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "user1",
    },
    {
      id: "2",
      workspaceId: "1",
      name: "Mobile App UI/UX",
      description: "Mobile application user interface design",
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "user2",
    },
    {
      id: "3",
      workspaceId: "2",
      name: "Mobile App Development",
      description: "Build new mobile application for iOS and Android",
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "user1",
    },
    {
      id: "4",
      workspaceId: "3",
      name: "Q4 Marketing Campaign",
      description: "Year-end marketing initiatives",
      status: "planning",
      createdAt: new Date().toISOString(),
      createdBy: "user6",
    },
    {
      id: "5",
      workspaceId: "2",
      name: "API Integration",
      description: "Third-party API integration project",
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "user3",
    },
  ],
  tasks: [
    {
      id: "1",
      projectId: "1",
      title: "Design Homepage",
      description: "Create new homepage layout and design",
      status: "in-progress",
      assignee: "John Doe",
      assigneeId: "user2",
      priority: "high",
      dueDate: "2024-02-15",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      projectId: "1",
      title: "Update Contact Page",
      description: "Refresh the contact page with new information",
      status: "todo",
      assignee: "Jane Smith",
      assigneeId: "user7",
      priority: "medium",
      dueDate: "2024-02-20",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      projectId: "2",
      title: "Mobile App Wireframes",
      description: "Create wireframes for mobile application",
      status: "done",
      assignee: "Demo User",
      assigneeId: "user1",
      priority: "high",
      dueDate: "2024-01-30",
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      projectId: "3",
      title: "Backend Development",
      description: "Develop backend APIs for mobile app",
      status: "in-progress",
      assignee: "Bob Johnson",
      assigneeId: "user3",
      priority: "high",
      dueDate: "2024-03-15",
      createdAt: new Date().toISOString(),
    },
    {
      id: "5",
      projectId: "3",
      title: "iOS App Development",
      description: "Native iOS app development",
      status: "todo",
      assignee: "Charlie Brown",
      assigneeId: "user5",
      priority: "medium",
      dueDate: "2024-03-30",
      createdAt: new Date().toISOString(),
    },
    {
      id: "6",
      projectId: "4",
      title: "Social Media Strategy",
      description: "Develop social media marketing strategy",
      status: "todo",
      assignee: "Eva Davis",
      assigneeId: "user6",
      priority: "low",
      dueDate: "2024-02-28",
      createdAt: new Date().toISOString(),
    },
    {
      id: "7",
      projectId: "5",
      title: "Payment Gateway Integration",
      description: "Integrate Stripe payment gateway",
      status: "in-progress",
      assignee: "Bob Johnson",
      assigneeId: "user3",
      priority: "high",
      dueDate: "2024-02-25",
      createdAt: new Date().toISOString(),
    },
  ],
  selectedProject: null,
};

function appReducer(state, action) {
  switch (action.type) {
  
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload?.user || {
          id: "user1",
          name: "Demo User",
          email: "demo@example.com",
        },
      };

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    case "SWITCH_WORKSPACE":
      return {
        ...state,
        currentWorkspace: action.payload.workspaceId,
        selectedProject: null,
      };

    case "ADD_WORKSPACE":
      const newWorkspace = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || "",
        color: action.payload.color || "#4f46e5",
        createdAt: new Date().toISOString(),
        createdBy: state.user?.id || "user1",
      };

      // Automatically add current user as admin of the new workspace
      const newWorkspaceMember = {
        id: uuidv4(),
        workspaceId: newWorkspace.id,
        userId: state.user?.id || "user1",
        email: state.user?.email || "demo@example.com",
        name: state.user?.name || "Demo User",
        role: "admin",
        avatar: null,
        joinedAt: new Date().toISOString(),
      };

      return {
        ...state,
        workspaces: [...state.workspaces, newWorkspace],
        workspaceMembers: [...state.workspaceMembers, newWorkspaceMember],
        currentWorkspace: newWorkspace.id,
      };

    case "UPDATE_WORKSPACE_DETAILS":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === state.currentWorkspace
            ? { ...workspace, ...action.payload }
            : workspace
        ),
      };

    case "DELETE_WORKSPACE":
      // Don't delete if it's the only workspace
      if (state.workspaces.length <= 1) {
        console.warn("Cannot delete the only workspace");
        return state;
      }

      const newCurrentWorkspace =
        state.workspaces.find((w) => w.id !== action.payload.workspaceId)?.id ||
        state.workspaces[0].id;

      return {
        ...state,
        workspaces: state.workspaces.filter(
          (workspace) => workspace.id !== action.payload.workspaceId
        ),
        workspaceMembers: state.workspaceMembers.filter(
          (member) => member.workspaceId !== action.payload.workspaceId
        ),
        projects: state.projects.filter(
          (project) => project.workspaceId !== action.payload.workspaceId
        ),
        currentWorkspace: newCurrentWorkspace,
        selectedProject: null,
        // More efficient task filtering
        tasks: state.tasks.filter((task) => {
          // Get all project IDs from the workspace to be deleted
          const projectsInWorkspace = state.projects
            .filter((p) => p.workspaceId === action.payload.workspaceId)
            .map((p) => p.id);
          // Keep tasks that are NOT in one of those projects
          return !projectsInWorkspace.includes(task.projectId);
        }),
      };

    case "ADD_WORKSPACE_MEMBER":
      const newMember = {
        id: uuidv4(),
        workspaceId: state.currentWorkspace,
        userId: `user_${Date.now()}`,
        email: action.payload.email,
        name: action.payload.name,
        role: action.payload.role || "member",
        avatar: action.payload.avatar || null,
        joinedAt: new Date().toISOString(),
      };
      return {
        ...state,
        workspaceMembers: [...state.workspaceMembers, newMember],
      };

    case "UPDATE_WORKSPACE_MEMBER_ROLE":
      // Prevent changing role of workspace creator
      const workspace = state.workspaces.find(
        (w) => w.id === state.currentWorkspace
      );
      const member = state.workspaceMembers.find(
        (m) => m.id === action.payload.memberId
      );

      if (workspace && member && workspace.createdBy === member.userId) {
        console.warn("Cannot change role of workspace creator");
        return state;
      }

      return {
        ...state,
        workspaceMembers: state.workspaceMembers.map((member) =>
          member.id === action.payload.memberId
            ? { ...member, role: action.payload.role }
            : member
        ),
      };

    case "REMOVE_WORKSPACE_MEMBER":
      const memberToRemove = state.workspaceMembers.find(
        (m) => m.id === action.payload.memberId
      );
      const currentWorkspace = state.workspaces.find(
        (w) => w.id === state.currentWorkspace
      );

      // Prevent removing workspace creator
      if (
        currentWorkspace &&
        memberToRemove &&
        currentWorkspace.createdBy === memberToRemove.userId
      ) {
        console.warn("Cannot remove workspace creator");
        return state;
      }

      return {
        ...state,
        workspaceMembers: state.workspaceMembers.filter(
          (member) => member.id !== action.payload.memberId
        ),
      };

    case "ADD_PROJECT":
      const newProject = {
        id: uuidv4(),
        workspaceId: state.currentWorkspace,
        name: action.payload.name,
        description: action.payload.description,
        status: action.payload.status || "active",
        createdAt: new Date().toISOString(),
        createdBy: state.user?.id || "user1",
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
        selectedProject: newProject.id,
      };

    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? { ...project, ...action.payload.updates }
            : project
        ),
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload.projectId
        ),
        tasks: state.tasks.filter(
          (task) => task.projectId !== action.payload.projectId
        ),
        selectedProject: null,
      };

    case "ADD_TASK":
      const newTask = {
        id: uuidv4(),
        projectId: action.payload.projectId,
        title: action.payload.title,
        description: action.payload.description,
        status: action.payload.status || "todo",
        assignee: action.payload.assignee,
        assigneeId: action.payload.assigneeId,
        priority: action.payload.priority || "medium",
        dueDate: action.payload.dueDate,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };

    case "UPDATE_TASK_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.status }
            : task
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };

    case "SET_SELECTED_PROJECT":
      return {
        ...state,
        selectedProject: action.payload.projectId,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions to expose via context
  const getWorkspaceMembers = (workspaceId) => {
    return state.workspaceMembers.filter(
      (member) => member.workspaceId === workspaceId
    );
  };

  const getWorkspaceProjects = (workspaceId) => {
    return state.projects.filter(
      (project) => project.workspaceId === workspaceId
    );
  };

  const getProjectTasks = (projectId) => {
    return state.tasks.filter((task) => task.projectId === projectId);
  };

  const getUserWorkspaces = (userId) => {
    const memberWorkspaceIds = state.workspaceMembers
      .filter((member) => member.userId === userId)
      .map((member) => member.workspaceId);

    return state.workspaces.filter((workspace) =>
      memberWorkspaceIds.includes(workspace.id)
    );
  };

  const canUserPerformAction = (
    workspaceId,
    userId,
    requiredRole = "member"
  ) => {
    const member = state.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === userId
    );

    if (!member) return false;

    const roleHierarchy = {
      viewer: 0,
      member: 1,
      admin: 2,
    };

    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  };

  const value = {
    state,
    dispatch,
    getWorkspaceMembers,
    getWorkspaceProjects,
    getProjectTasks,
    getUserWorkspaces,
    canUserPerformAction,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Export initial state for testing/mocking
export { initialState };
