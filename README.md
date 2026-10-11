# VideoVerse — Content Platform

VideoVerse is a video-sharing web application inspired by YouTube. It allows users to explore videos, search for content, watch videos, and manage their personal video activity through a React frontend and a Node.js backend.

## Features

- **Video Discovery:** Browse video feeds and explore content by category.
- **Search:** Search for videos and filter results.
- **Shorts and Music:** Explore short-form videos and music content.
- **User Authentication:** Register, log in, and access protected account features.
- **Profile Management:** Update account details, change passwords, and manage your account.
- **Liked Videos:** Save and manage liked videos.
- **Watch Later:** Save videos to watch later.
- **Watch History:** View and manage previously watched videos.
- **Comments:** Add and delete comments.
- **Subscriptions:** Manage subscribed channels.

## Tech Stack

### Frontend
- React 19
- Vite 8
- React Router DOM
- Lucide React
- JavaScript and CSS

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- CORS
- dotenv

## Project Structure

VideoVerse-Content-Platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
├── public/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── LICENSE
└── README.md

*Note: This is a simplified overview of the project structure.*

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB connection or database instance
- Git

### 1. Clone the Repository

git clone https://github.com/Ritesh121raj/videoVerse-Content-Platform.git
cd videoVerse-Content-Platform

### 2. Set Up the Frontend

The frontend is located in the repository root.

Install dependencies:

npm install

Start the development server:

npm run dev

Build the application for production:

npm run build

Preview the production build:

npm run preview

Run the configured linter:

npm run lint

### 3. Set Up the Backend

Open a second terminal and navigate to the backend directory:

cd backend
npm install

Create a `.env` file using the environment-variable names expected by the backend code. Configure the MongoDB connection, JWT secret, and other required settings.

Start the backend in development mode:

npm run dev


Start the backend using its production start script:

npm start


### 4. Configure Environment Variables

Refer to `.env.example` for the documented environment-variable names. Create local `.env` files in the appropriate frontend and backend directories and configure the values required by each application.

For production, configure environment variables in the respective hosting provider's dashboard.

**Security:** Never commit real API keys, database credentials, or JWT secrets to GitHub. Frontend environment variables prefixed with `VITE_` are exposed to the browser and must not contain private secrets.

## Authentication and Data

The backend uses Express, MongoDB/Mongoose, JWT authentication, and bcryptjs password hashing. Protected endpoints require valid authentication according to the backend middleware.

Test account and video-activity features using separate accounts to verify that private data remains isolated between users.

## Deployment

The frontend and backend are deployed separately. Configure the production frontend API URL, backend environment variables, database connection, and allowed CORS origin according to your hosting setup.

- **GitHub Repository:** [VideoVerse-Content-Platform](https://github.com/Ritesh121raj/videoVerse-Content-Platform)
- **Live Demo:** [VideoVerse Live](https://videoverse-content-platform-1.onrender.com)
- **Backend URL:** [VideoVerse Backend](https://videoverse-content-platform.onrender.com)

## Future Improvements

- Improve accessibility and responsive layouts.
- Add automated tests for authentication and video-related features.
- Improve loading, empty, and error states.
- Continue strengthening production security and documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Ritesh121raj/videoVerse-Content-Platform/blob/main/LICENSE) file for details.