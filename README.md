# PrepSync

> A collaborative goal-tracking and peer accountability platform for students.

PrepSync is a full-stack MERN application designed to help students track their academic goals, join study groups, share resources, and maintain consistency through analytics and peer accountability. By combining personal task management with social workflows, PrepSync eliminates procrastination and keeps study groups moving forward.

## 🚀 Features

### Implemented
*   **Authentication & Security**: Secure JWT-based authentication with role-based access control (RBAC).
*   **Smart Dashboard**: Comprehensive analytics featuring streak tracking, consistency heatmaps, and visual charts (bar and pie charts) to monitor focus distribution.
*   **Personal Goal Management**: Complete CRUD operations for daily and weekly goals with deadline validation and completion tracking.
*   **Group Accountability**: Create or join study groups, enabling peer visibility to foster a sense of shared responsibility.
*   **Resource Sharing**: Seamless and secure sharing of study materials within groups, powered by Cloudinary integration.
*   **Responsive UI**: A clean, modern interface designed for focus and productivity.

### 🗺️ Roadmap (Upcoming)
*   **Activity Feed & Nudges**: Real-time social feeds within groups and the ability to "nudge" or "cheer" peers.
*   **Gamification**: Group leaderboards based on consistency scores and XP to gamify productivity.
*   **Real-Time Interactions**: Socket.io integration for instant notifications and online status indicators ("Who is studying now?").
*   **Study Utilities**: Integrated Pomodoro timer and automated email reminders (Cron jobs).
*   **UX Enhancements**: Dark mode support and refined mobile responsiveness.

## 💻 Tech Stack

*   **Frontend**: React.js, Recharts (for analytics)
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication & Security**: JSON Web Tokens (JWT), bcrypt
*   **Storage**: Cloudinary (for resource sharing)

## 🛠️ Getting Started

### Prerequisites
*   Node.js installed
*   MongoDB instance (local or Atlas)
*   Cloudinary account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Aryangarg014/PrepSync.git
    cd PrepSync
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add the following variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Frontend Client**
    ```bash
    cd client
    npm run dev
    ```

3.  Open `http://localhost:5173` (or the port specified by Vite) in your browser.

## 📝 License
Not specified yet.
