# VideoVerse — Content Platform

VideoVerse is a video-sharing web application inspired by YouTube. It provides a platform to explore videos, search for content, watch videos, and manage personal video activity through a React frontend and a Node.js backend.

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

The application has separate frontend and backend components. Update the example paths below to match the actual repository structure.

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
│   ├── App.jsx
│   └── ...
├── public/
├── .env.example
├── .gitignore
├── index.html
├── package.json
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

### 1. Clone the repository

git clone https://github.com/Ritesh121raj/videoVerse-Content-Platform.git
cd videoVerse-Content-Platform

### 2. Set up the frontend

Open a terminal in the frontend directory:

npm install
npm run dev


To create and preview a production build:

npm run build
npm run preview


Run the configured linter with:

npm run lint

### 3. Set up the backend

Open another terminal in the backend directory:

npm install

Create a `.env` file using the environment-variable names expected by the backend code. Configure the database connection, JWT secret, and any other required settings.

Start the backend in development mode:

npm run dev

To start the backend using its production start script:

npm start

### 4. Configure environment variables

Refer to `.env.example` for the required environment-variable names. Create local `.env` files in the appropriate frontend/backend directories and configure the values required by each application.

For production, set the environment variables in the respective hosting provider's dashboard.

**Security:** Never commit real API keys, database credentials, or JWT secrets to GitHub. Frontend variables prefixed with `VITE_` are exposed to the browser, so never store private secrets in them.

## Authentication and Data

The backend uses Express, MongoDB/Mongoose, JWT authentication, and bcryptjs password hashing. Protected endpoints require valid authentication according to the backend middleware.

User account and video-activity features should be tested using separate accounts to ensure that private data is not shared between users.

## Deployment

The frontend and backend can be deployed separately. Configure the production frontend API URL, backend environment variables, database connection, and allowed CORS origin according to your hosting setup.

- **GitHub Repository:** https://github.com/Ritesh121raj/videoVerse-Content-Platform
- **Live Demo:** https://videoverse-content-platform-1.onrender.com
- **Backend URL:** https://videoverse-content-platform.onrender.com

## Future Improvements

- Improve accessibility and responsive layouts.
- Add automated tests for authentication and video-related features.
- Improve loading, empty, and error states.
- Continue strengthening production security and documentation.

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.
