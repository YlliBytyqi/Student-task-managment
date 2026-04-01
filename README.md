# Student Task Management

A comprehensive full-stack web application designed for students to organize, track, and manage their daily tasks and projects effectively. Developed as part of a university lab course, this platform offers an intuitive drag-and-drop interface, real-time status updates, and robust user authentication.

## 👥 Worked by (Authors)
This project was worked on for the subject **Laboratory 1** by:
- **Yll Bytyçi**
- **Erdona Kadriolli**

## 🚀 Features

- **User Authentication & Authorization**: Secure login and registration using JWT and bcrypt. Role-based access control (Admin vs. Student).
- **Kanban-Style Dashboard**: Interactive task management with drag-and-drop capabilities using `@dnd-kit`.
- **Admin Dashboard**: Dedicated administration panel to manage users, monitor platform activity, and control workspace settings.
- **Task Management**: Create, read, update, and delete (CRUD) tasks. Assign priorities, deadlines, and categorize them effectively.
- **Collaborative Workspaces**: Invite team members and manage collaborative projects in a shared workspace.
- **Responsive Design**: Modern, clean, and fully responsive UI built with Tailwind CSS and Framer Motion for smooth animations.

## 🛠️ Technologies Used

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS v4** for utility-first styling
- **Framer Motion** for rich animations
- **@dnd-kit** for drag-and-drop sorting
- **Lucide React** for modern iconography
- **Axios** for API communication
- **React Router v7** for navigation

### Backend
- **Node.js** with **Express.js**
- **Database**: Flexible architecture supporting MongoDB (`mongoose`), SQL Server (`mssql`), and SQLite (`sqlite3`)
- **Authentication**: `jsonwebtoken` (JWT) and `bcrypt/bcryptjs`
- **Security**: CORS enabled, Cookie Parser integrated

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn package manager
- A database solution (MongoDB local/Atlas server, SQL Server, or SQLite)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Student-task-managment/student-task-manager
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

3. **Backend Setup**
   ```bash
   cd ../backend
   npm install
   # or
   yarn install
   ```

4. **Environment Configuration**
   - In the `backend` directory, create a `.env` file based on your database choice and JWT secrets.
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

## 🚀 Running the Application

To run the application locally, you will need to start both the backend and frontend servers.

**Start the Backend Server (Development Mode):**
```bash
cd backend
npm run start
```
*The server will typically start on `http://localhost:5000`.*

**Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```
*The React application will be available at `http://localhost:5173`.*

## 📂 Project Structure

```text
Student-task-managment/
└── student-task-manager/
    ├── frontend/       # React application (Vite, Tailwind, Dnd-Kit)
    └── backend/        # Express.js API server (Auth, Models, Controllers)
```

## 📄 License
This project is licensed under the ISC License.
