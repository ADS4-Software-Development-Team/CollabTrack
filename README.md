# Collab Track: Project Management Application

[![Collab Track Demo](frontend/assets/collab.gif)](https://collab-track.example.com)

Collab Track is a full-stack project management application designed to help teams organize their work through workspaces, projects, and tasks. It features a role-based access control system to manage user permissions effectively.

## Features

*   **User Authentication**: Secure user registration and login using JWT.
*   **Workspace Management**:
    *   Create workspaces to group related projects.
    *   The user who creates a workspace automatically becomes its administrator.
    *   Add or remove members from a workspace.
*   **Project Management**:
    *   Create projects within a workspace.
    *   Assign members to projects with specific roles (e.g., manager, member).
    *   View and update project details.
*   **Role-Based Access Control**:
    *   **Global Roles**: `admin` (can manage users), `user`.
    *   **Workspace Roles**: `admin` (can manage workspace members), `member`.
    *   **Project Roles**: `manager` (can manage project members and details), `member`.

## Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: Supabase (PostgreSQL)
*   **Authentication**: JSON Web Tokens (JWT)
*   **Frontend**: (Assumed) React.js or a similar modern JavaScript framework.

## API Endpoints

The following are the primary API routes available in the backend.

### Auth Routes
*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user and receive a JWT.

### User Routes
*   `GET /api/users`: Get all users (admin only).
*   `GET /api/users/:id`: Get a single user's profile.
*   `PUT /api/users/:id`: Update a user's profile.
*   `DELETE /api/users/:id`: Delete a user (admin only).

### Workspace Routes
*   `POST /api/workspaces`: Create a new workspace.
*   `GET /api/workspaces/:workspaceId/members`: Get all members of a workspace.
*   `POST /api/workspaces/:workspaceId/members`: Add a new member to a workspace.

### Project Routes
*   `POST /api/projects`: Create a new project.
*   `GET /api/projects`: Get all projects.
*   `GET /api/projects/:id`: Get a single project by its ID.
*   `PUT /api/projects/:id`: Update a project's information.

### Project Member Routes
*   `GET /api/projects/:projectId/members`: Get all members of a specific project.
*   `POST /api/projects/:projectId/members`: Add a member to a project.
*   `PUT /api/projects/:projectId/members/:userId`: Update a project member's role.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v14 or later)
*   npm or yarn
*   A Supabase account for the database.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/project-management-app.git
    cd project-management-app/backend
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add your Supabase project URL, anon key, and a JWT secret:
    ```env
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_KEY=your_supabase_anon_key
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Run the backend server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5000` (or your configured port).

5.  **Set up the frontend:**
    Open a new terminal, navigate to the frontend directory, install dependencies, and start the development server.

    ```bash
    cd ../frontend 
    # Or from the root: cd project-management-app
    ```

6.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

7.  **Run the frontend application:**
    ```bash
    npm start
    ```
    The React application will open in your browser at `http://localhost:3000`.
