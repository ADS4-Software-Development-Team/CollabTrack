
# 📌 CollabTrack – A Lightweight Project Management & Collaboration Tool



---


## 📝 Project Overview

**CollabTrack** is a web-based project management and team collaboration platform—designed as a simplified version of Trello, Asana, and Jira.

The system enables teams to:

- Create and manage projects  
- Add and assign tasks  
- Track progress using statuses or Kanban boards  
- Collaborate via comments  
- Manage roles and permissions  

This project demonstrates your ability to build scalable, multi-user systems with clean UI, secure authentication, and relational data management.

---

[![Collab Track Demo](frontend/assets/collab.gif)]

## 🎯 Core Features (MVP)

### 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Admin** | Manage users, create projects, view all data |
| **Project Manager** | Create tasks, assign members, update statuses |
| **Team Member** | View/update tasks assigned to them |

---

### 📁 Projects

- Create projects with **title, description, deadline**
- Invite or assign users to a project
- View all projects in a user-friendly dashboard

---

### 📌 Tasks / Tickets

- Create tasks with:
  - Title  
  - Description  
  - Priority  
  - Due date  
  - Assigned user  
  - Status: **Backlog → To Do → In Progress → Done**
- Kanban-style board (drag-and-drop supported)
- Filter tasks by status, priority, and assignee

---

### 💬 Task Comments

- Users can comment on tasks  
- Comments include username + timestamp  
- Supports threaded communication per task  

---

### 🧭 Dashboard

- Overview of all user tasks  
- For Admins/Project Managers:  
  - View team load  
  - Track progress across all projects  

---

### 🔐 Authentication & Authorization

- JWT or session-based authentication  
- Secure login and protected routes  
- Role-based access control (Admin, PM, Team Member)

---

## 🛠️ Tech Stack

### **Recommended (but not limited to):**
- **Frontend:** React / Vue + TailwindCSS or Bootstrap  
- **Backend:** Node.js (Express), Django, or Laravel  
- **Database:** PostgreSQL (preferred), MongoDB, or SQLite  
- **Auth:** JWT or OAuth  
- **UI Libraries:** react-beautiful-dnd (for drag & drop functionality)

---

## 🌟 Bonus Features (Optional Enhancements)

- Real-time updates via WebSockets  
- File attachments for tasks  
- Email or in-app notifications  
- Task time tracking  
- Dark mode & accessibility support  
- Project archiving & activity history  
- Markdown support for task descriptions or comments  

---

## 📅 Suggested Timeline

**Total duration:** 3 weeks  
- **Week 1:** System architecture, DB design, authentication  
- **Week 2:** Projects, tasks, comments + frontend integration  
- **Week 3:** Polishing, testing, deployment, documentation  

---

## 🚀 Installation & Setup

### **1. Clone the repository**
```bash
git clone https://github.com/ADS4-Software-Development-Team/CollabTrack.git
cd CollabTrack
