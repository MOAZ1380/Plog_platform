# Blog Post Platform

A full-stack blog post platform where users can create, share, and interact with posts. This project includes user authentication, post creation, commenting, liking, and profile management.

---

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [API Endpoints](#api-endpoints)
5. [Frontend Structure](#frontend-structure)
6. [Backend Structure](#backend-structure)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- **User Authentication**: Register, login, and manage user profiles.
- **Post Management**: Create, update, and delete posts with images.
- **Comments**: Add, edit, and delete comments on posts.
- **Likes**: Like and unlike posts, view users who liked a post.
- **Search**: Search for users and posts.
- **Responsive Design**: Works seamlessly on all devices.

---

## Technologies Used

### Frontend
- **React**: Frontend library for building user interfaces.
- **React Router**: For routing and navigation.
- **Axios**: For making HTTP requests to the backend.
- **CSS**: Styling components and pages.
- **React Icons**: For icons like the scroll-to-top button.

### Backend
- **Node.js**: JavaScript runtime for the backend.
- **Express.js**: Framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing data.
- **Mongoose**: ODM for MongoDB.
- **JWT**: For user authentication and authorization.
- **Multer**: For handling file uploads (profile pictures and post images).
- **Bcrypt**: For password hashing.

---

## Installation

### Prerequisites
- Node.js and npm installed.
- MongoDB installed and running.

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/MOAZ1380/Plog_platform.git
   cd blog-post-platform

2. **Install dependencies**:
  npm install
  cd client
  npm install

3. **Set up environment variables:
  **Create a .env file in the root directory and add the following**:
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/blogpost
    JWT_SECRET=your_jwt_secret

4. **Run the backend**:
  node index.js

5. **Run the frontend**:
  cd front-end/src
  npm start

6. **Access the application**:
  Open your browser and go to http://localhost:3000

---

### API Endpoints

## Users

- POST /api/users/register: Register a new user.
- POST /api/users/login: Log in a user.
- GET /api/users/:userId : Get user details by ID.
- PATCH /api/users/update_profile: Update user profile.
- DELETE /api/users/delete_account: Delete user account.

## Posts

- POST /api/posts/AddPost: Create a new post.
- GET /api/posts/GetAllPost: Get all posts.
- GET /api/posts/GetMyPost: Get posts by the logged-in user.
- GET /api/posts/GetUserPost/:UserId : Get posts by a specific user.
- PATCH /api/posts/delete_update/:post_id : Update a post.
- DELETE /api/posts/delete_update/:post_id : Delete a post.
-  GET /api/posts/search/:searchTerm : Search for posts.

## Comments

- POST /api/posts/add_comment/:PostId /comment: Add a comment to a post.
- PATCH /api/posts/Update_comment/:PostId /comment/:commentId : Update a comment.
- DELETE /api/posts/remove_comment/:PostId /comment/:commentId : Delete a comment.
- GET /api/posts/:postId /comment: Get comments for a post.

## Likes

- POST /api/posts/add_like/:Postid /like: Like a post.
- POST /api/posts/remove_like/:Postid /unlike: Unlike a post.
- GET /api/posts/fetch_likeAndComment/:Postid : Get likes and comments for a post.

---

### Frontend Structure

## App.js: Main application component with routing.

## Components:

- Header: Navigation bar with search and profile options.
- Feed: Displays posts and allows users to create new posts.
- Post: Individual post component with comments and likes.
- Comment: Comment section for posts.
- Profile: User profile page with posts and edit options.
- Login/Register: Authentication forms.
- SearchBar: Search functionality for users and posts.
- ScrollToTopButton: Button to scroll to the top of the page.

## Context:
- PostsContext: Manages global state for posts.

---

### Backend Structure

## Models:

- User.js: User schema for MongoDB.
- Post.js: Post schema for MongoDB.
- Comment.js: Comment schema for MongoDB.

## Controllers:

- User_controller.js: Handles user-related logic.
- Post_controller.js: Handles post-related logic.
- Comment_controller.js: Handles comment-related logic.
- Like_controller.js: Handles like-related logic.

## Routes:

- users_route.js: Routes for user-related endpoints.
- posts_route.js: Routes for post-related endpoints.
- comments_route.js: Routes for comment-related endpoints.
- likes_route.js: Routes for like-related endpoints.

## Middleware:

- verifyToken.js: Authenticates users using JWT.
- verifyOwnership.js: Ensures users can only edit/delete their own posts.
- multer.js: Handles file uploads.

---

## Contributing

1. Fork the repository.
2. Create a new branch: git checkout -b feature/your-feature-name.
3. Commit your changes: git commit -m 'Add some feature'.
4. Push to the branch: git push origin feature/your-feature-name.
5. Submit a pull request.

## License

- This project is licensed under the MIT License. See the LICENSE file for details.