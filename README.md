### User Authentication API Documentation

# Overview

- This API allows users to register and log in. It provides functionality to handle user registration, login with email and password, and token generation for authenticated requests.

# Endpoints

# 1. User Registration

- Endpoint: POST /api/users/register
- This endpoint is used to register a new user. The user must provide their first name, last name, sex, birth date, email, and  password. The server will validate the email and password, check if the user already exists, and if not, create a new user in the database.

- Input:

-  firstName: First name of the user (Required).
- lastName: Last name of the user (Required).
- sex: Sex of the user (Required).
- birthDate: Date of birth of the user (Required, valid date format).
- email: Email of the user (Required, valid email format).
- password: Password for the user (Required, hashed).
- photo: Optional profile photo (File upload).

# Response:

-  201 Created: If the user is successfully registered.

# Example:
 
    {
      "status": "SUCCESS",
      "data": {
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "sex": "male",
          "birthDate": "1990-01-01",
          "email": "john.doe@example.com",
          "photo": "profile_photo.jpg"
        },
        "my_token": "generated_jwt_token"
      }
    }

# 400 Bad Request: If the email is invalid or the user already exists.

# Example:

    {
        "status": "FAIL",
        "message": "User already exists"
    }


# 400 Bad Request: If the birth date is invalid or missing.

# Example:
    
    {
      "status": "FAIL",
      "message": "Invalid birth date"
    }

# 400 Bad Request: If the email is invalid.

# Example:

    {
      "status": "FAIL",
      "message": "Invalid email"
    }

## 2. User Login

# Endpoint: POST /api/users/login

-- This endpoint is used to log in an existing user. The user must provide their email and password. If the credentials match, a JWT (JSON Web Token) is generated and returned.

- Input:

    *  email: The email of the user (Required).
    *  password: The password of the user (Required).

- Response:

# 200 OK: If the login is successful.

# Example:

    {
      "status": "SUCCESS",
      "data": {
        "message": "Login successful",
        "my_token": "generated_jwt_token"
      }
    }

# 400 Bad Request: If the email or password is missing.

# Example:

    {
      "status": "FAIL",
      "message": "Email and password are required"
    }

# 404 Not Found: If the user is not found.

# Example:

    {
      "status": "FAIL",
      "message": "User not found"
    }

# 401 Unauthorized: If the credentials are invalid (password mismatch).

# Example:

    {
      "status": "FAIL",
      "message": "Invalid credentials"
    }

# Authentication

- JWT (JSON Web Token) is used for authentication. After a successful login or registration, the server generates a token that is sent in the response. This token should be included in the request headers for subsequent protected routes via Authorization: Bearer <token>.

- Error Handling
    - The AppError module is used to manage errors across the application. Error responses include a status code, error message, and appropriate HTTP status.

# Post API Documentation

## Overview

- This project allows users to add, browse, update, and delete posts. Additionally, users can view their profile data and    their posts.

Endpoints

## 1. Add Post

### Endpoint: POST /api/posts/AddPost

- Description: Allows users to create a new post with optional photo upload.

- Request Headers:

- Authorization: Bearer 

- Request Body:
    - content (String): The content of the post (Required).
    - photo (File): An optional photo for the post.

- Response:
    - 201 Created: Post successfully created.

## Example:

    {
      "status": "success",
      "data": {
        "post": {
          "_id": "64c5f3e1234abc",
          "user_id": "64b123d1234abc",
          "content": "This is my first post",
          "photo": "example.jpg",
          "created_at": "2024-12-21T14:30:00Z",
          "updated_at": "2024-12-21T14:30:00Z"
        }
      }
    }

## 2. Get All Posts

### Endpoint: GET /api/posts/GetAllPost

- Description: Fetches all posts, sorted by the latest updates.

- Request Headers:

- Authorization: Bearer 

- Query Parameters:
    -page (Number): The page number (Default: 1).
    -page_size (Number): The number of posts per page (Default: 10).

# Response:

- 200 OK: Posts successfully retrieved.

## Example:

    {
      "status": "success",
      "data": [
        {
          "_id": "64c5f3e1234abc",
          "user_id": "64b123d1234abc",
          "content": "This is my first post",
          "photo": "example.jpg",
          "created_at": "2024-12-21T14:30:00Z",
          "updated_at": "2024-12-21T14:30:00Z",
          "likes": [
            { "firstName": "John", "lastName": "Doe" }
          ],
          "comments": [
            {
              "user_id": { "firstName": "Jane", "lastName": "Smith" },
              "content": "Great post!",
              "created_at": "2024-12-21T15:00:00Z"
            }
          ]
        }
      ]
    }

## 3. Get My Posts

# Endpoint: GET /api/posts/GetMyPost

- Description: Fetches posts created by the authenticated user.
- Request Headers:
- Authorization: Bearer 
- Query Parameters:
    -page (Number): The page number (Default: 1).
    -page_size (Number): The number of posts per page (Default: 5).
# Response:
    - Same as Get All Posts.
## 4. Update or Delete a Post
## Endpoint: PATCH/DELETE /delete_update/:post_id
- Update Post (PATCH)
- Description: Updates the content and/or photo of a user's post.
- Request Headers:
- Authorization: Bearer 
- Request Body:
    - content (String): The new content for the post.
    - photo (File): The new photo for the post (Optional).

# Response:
# 200 OK: Post successfully updated.
### Example:

    {
      "status": "success",
      "updatedPost": {
        "_id": "64c5f3e1234abc",
        "content": "Updated post content",
        "photo": "updated_photo.jpg",
        "updated_at": "2024-12-21T15:00:00Z"
      }
    }

## Delete Post (DELETE)
- Description: Deletes a user's post.
## Response:
- 200 OK: Post successfully deleted.
## Example:

    {
      "status": "success",
      "deletePost": {
        "_id": "64c5f3e1234abc",
        "content": "Deleted post content",
        "photo": "deleted_photo.jpg",
        "deleted_at": "2024-12-21T15:30:00Z"
      }
    }

## API Documentation for Comment Management

## Overview

- This API provides endpoints for managing comments on posts in a web application. Users can add, update, and delete comments on posts while maintaining data consistency and access control.

# Endpoints

### 1. Add Comment
#### Endpoint:
### POST api/posts/add_comment/:PostId/comments
# Description:
- Adds a new comment to the specified post.
- Request Headers:
- Authorization: Bearer <JWT Token>
- Path Parameters:
    - PostId (string): The ID of the post to which the comment will be added.
# Request Body:
    {
      "content": "Your comment text"
    }

# Responses:
    - all comments written by the current user.
# 200 OK:
    {
      "status": "SUCCESS",
      "message": "Comment added successfully",
      "data": [
        {
          "content": "Your comment text",
          "user_id": "User ID",
          "createdAt": "Timestamp",
          "updatedAt": "Timestamp"
        },
        {
          "content": "Your comment_2 text",
          "user_id": "User ID",
          "createdAt": "Timestamp",
          "updatedAt": "Timestamp"
        }
      ]
    }
# 400 Bad Request:

    {
      "status": "FAIL",
      "message": "Comment content cannot be empty"
    }

# 404 Not Found:
    {
      "status": "FAIL",
      "message": "Post not found"
    }

# 2. Update Comment
# Endpoint:
# Patch    /api/posts/update_comment/:PostId/comments/:commentId
- Description:
- Updates an existing comment on the specified post.
- Request Headers:
- Authorization: Bearer <JWT Token>
- Path Parameters:
    - PostId (string): The ID of the post.
    - commentId (string): The ID of the comment to update.
# Request Body:
    {
      "content": "Updated comment text"
    }

# Responses:
-  all comments written by the current user and update.
# 200 OK:

    {
      "status": "SUCCESS",
      "message": "Comment updated successfully",
      "data": [
        {
          "content": "Updated comment text",
          "user_id": "User ID",
          "createdAt": "Timestamp",
          "updatedAt": "Timestamp"
        },
        {
          "content": " all comments written by the current user.",
          "user_id": "User ID",
          "createdAt": "Timestamp",
          "updatedAt": "Timestamp"
        }
      ]
    }

# 400 Bad Request:
    {
      "status": "FAIL",
      "message": "Comment content cannot be empty"
    }

# 403 Forbidden:
    {
      "status": "FAIL",
      "message": "You are not authorized to update this comment"
    }

# 404 Not Found:

    {
        "status": "FAIL",
        "message": "Post not found"
    }

# 3. Delete Comment
# Endpoint:
# DELETE /api/posts/remove_comment/PostId/comment/commentId 
- Description:
- Deletes a comment from the specified post.
- Request Headers:
- Authorization: Bearer <JWT Token>
- Path Parameters:
    - PostId (string): The ID of the post.
    - commentId (string): The ID of the comment to delete.
# Responses:
# 200 OK:
    {
      "status": "SUCCESS",
      "message": "Comment deleted successfully",
      "data": [
        {
          "content": "Remaining comment text",
          "user_id": "User ID",
          "createdAt": "Timestamp",
          "updatedAt": "Timestamp"
        }
      ]
    }

# 403 Forbidden:
    {
      "status": "FAIL",
      "message": "You are not authorized to delete this comment"
    }

#404 Not Found:
    {
      "status": "FAIL",
      "message": "Post not found"
    }

# Error Handling
# The API uses a consistent error format for all responses:
    {
      "status": "FAIL",
      "message": "Error message"
    }

# Common Errors
# 400 Bad Request: Input validation failed.
# 403 Forbidden: Unauthorized access to a resource.
# 404 Not Found: Resource not found.
# Models
# Comment
    {
      "_id": "Comment ID",
      "user_id": "User ID",
      "content": "Comment text",
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }

# Post
    {
      "_id": "Post ID",
      "comments": ["Comment ID", "Comment ID"],
      "...": "Other post fields"
    }
    
    
# API Documentation: Like Management
### Endpoints
### Add Like
### URL: /api/posts/add_like/PostId/like
### Method: POST
- Description: Adds a like to a post by the authenticated user.
- Request Headers:
- Authorization: Bearer token for user authentication.
- Request Parameters:
    - Postid (URL parameter): The ID of the post to be liked.
# Response:
# Success (200):
    {
      "status": "SUCCESS",
      "message": "Liked successfully"
    }

# Error (404): Post not found
    
    {
        "status": "FAIL",
        "message": "Post not found"
    }
- Notes:
    - The user must be authenticated.
    - If the user already liked the post, the like is not duplicated.
# Remove Like
# URL: /posts/:Postid/like
# Method: DELETE
- Description: Removes a like from a post by the authenticated user.
# Request Headers:
- Authorization: Bearer token for user authentication.
# Request Parameters:
- Postid (URL parameter): The ID of the post to remove the like from.
# Response:
Success (200):
    
    {
      "status": "SUCCESS",
      "message": "Like removed successfully"
    }

# Error (404): Post not found
    {
      "status": "FAIL",
      "message": "Post not found"
    }

# Notes:
- The user must be authenticated.
- If the user has not liked the post, the action does nothing.
# Models

# Post
- likes: Array of user IDs who liked the post.
- num_like: Number of likes for the post.
# User
- likedPosts: Array of post IDs that the user has liked.

# Error Handling
- 404: Returned when the post with the given Postid does not exist.
- 401: Returned when the user is not authenticated.
# Example Usage

# Add Like Request
# POST /api/posts/add_like/:postId/like

# Headers:
    
    {
      "Authorization": "Bearer <token>"
    }

# Add Like Response
# 200 OK:
    {
      "status": "SUCCESS",
      "message": "Liked successfully"
    }

# Remove Like Request
# DELETE /api/posts/remove_like/:postId/unlike
# Headers:

    {
      "Authorization": "Bearer <token>"
    }

# Remove Like Response
# 200 OK:
    {
      "status": "SUCCESS",
      "message": "Like removed successfully"
    }



# photo_url
# Get /uploads/Posts_photo/name_photo -> post photo
# Get /uploads/Profile_photo/name_photo -> users photo


## Middleware for update and delete to check owner and and token

# 1. verifyToken
    - Ensures the user is authenticated by validating the token.
# 2. verifyOwnership
    - Ensures the user is the owner of the post being modified or deleted.
# 3. multer
    - Handles file uploads for the photo field.
    
    


##### asyncWrapper: Handles async errors in route handlers.
##### AppError: Custom error class for API errors.
##### Utilities
##### http_status: Defines success and failure status codes.








### http://localhost:3000/api/posts/fetch_likeAndComment/674a1f103251609162c132d0

### http://localhost:3000/api/posts/GetUserPost/674a1e893251609162c1329c



### http://localhost:3000/api/users/update_profile              patch

When you change the email, you need to log in again, if you change the firstName, lastName, photo, or password, you do not need to log in again.

