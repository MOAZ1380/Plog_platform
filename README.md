# User Authentication API Documentation

## Overview

This API allows users to register and log in. It provides functionality to handle user registration, login with email and password, and token generation for authenticated requests.

## Endpoints

### **1. User Registration**

**Endpoint**: `POST /api/users/register`

This endpoint is used to register a new user. The user must provide their first name, last name, sex, birth date, email, and password. The server will validate the email and password, check if the user already exists, and if not, create a new user in the database.

#### Input:
- `firstName`: First name of the user (Required).
- `lastName`: Last name of the user (Required).
- `sex`: Sex of the user (Required).
- `birthDate`: Date of birth of the user (Required, valid date format).
- `email`: Email of the user (Required, valid email format).
- `password`: Password for the user (Required, hashed).
- `photo`: Optional profile photo (File upload).

#### Response:
- **201 Created**: If the user is successfully registered.
  - Example:
    ```json
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
    ```

- **400 Bad Request**: If the email is invalid or the user already exists.
  - Example:
    ```json
    {
        "status": "FAIL",
        "message": "User already exists"
    }
    ```

- **400 Bad Request**: If the birth date is invalid or missing.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Invalid birth date"
    }
    ```

- **400 Bad Request**: If the email is invalid.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Invalid email"
    }
    ```

---

### **2. User Login**

**Endpoint**: `POST /api/users/login`

This endpoint is used to log in an existing user. The user must provide their email and password. If the credentials match, a JWT (JSON Web Token) is generated and returned.

#### Input:
- `email`: The email of the user (Required).
- `password`: The password of the user (Required).

#### Response:
- **200 OK**: If the login is successful.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "data": {
        "message": "Login successful",
        "my_token": "generated_jwt_token"
      }
    }
    ```

- **400 Bad Request**: If the email or password is missing.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Email and password are required"
    }
    ```

- **404 Not Found**: If the user is not found.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "User not found"
    }
    ```

- **401 Unauthorized**: If the credentials are invalid (password mismatch).
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Invalid credentials"
    }
    ```

---

## **Authentication**

JWT (JSON Web Token) is used for authentication. After a successful login or registration, the server generates a token that is sent in the response. This token should be included in the request headers for subsequent protected routes via `Authorization: Bearer <token>`.

## **Error Handling**

The `AppError` module is used to manage errors across the application. Error responses include a status code, error message, and appropriate HTTP status.

---

# Post API Documentation

## Overview

This project allows users to add, browse, update, and delete posts. Additionally, users can view their profile data and their posts.

## Endpoints

### **1. Add a New Post**

**Endpoint**: `POST /api/posts/main`

This endpoint is used to add a new post. The user must send the content of the post with an optional image.

#### Input:
- `content`: Content of the post (Required, between 1 and 5000 characters).
-  `photo`: Image for the post (Optional).

#### Response:
- **201 Created**: If the post is successfully added.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "data": {
        "post": {
          "user_id": "user_id_here",
          "content": "Post content here",
          "photo": "image_filename.jpg"
        }
      }
    }
    ```

- **400 Bad Request**: If the `content` field is empty or does not meet the conditions.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Content must be between 1 and 5000 characters long"
    }
    ```

---

### **2. Get All Posts (Infinite Scroll)**

**Endpoint**: `GET /api/posts/main`

This endpoint is used to retrieve all posts with infinite scroll support.

#### Input:
- `page`: Page number (Optional, default is 1).
- `page_size`: Number of posts per page (Optional, default is 10).

#### Response:
- **200 OK**: Returns posts based on the page number and page size.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "data": [
        {
          "user_id": "user_id_here",
          "content": "Post content here",
          "photo": "image_filename.jpg"
        }
      ]
    }
    ```

---

### **3. My Profile**

**Endpoint**: `GET /api/users/my_profile`

This endpoint displays the user's personal data and their posts.

#### Input:
- `page`: Page number (Optional, default is 1).
- `page_size`: Number of posts per page (Optional, default is 5).

#### Response:
- **200 OK**: Returns the user's data and their posts.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "data": {
        "user_name": "John Doe",
        "sex": "male",
        "my_photo": "profile_image.jpg",
        "birthDate": "1990-01-01",
        "email": "john.doe@example.com",
        "posts": [
          {
            "content": "My first post",
            "photo": "image.jpg"
          }
        ],
        "hasMore": true
      }
    }
    ```

---

### **4. Update Post**

**Endpoint**: `PATCH /api/posts/my_profile/:post_id`
**Endpoint**: `PATCH /api/posts/main/:post_id`

This endpoint is used to update an existing post.

#### Input:
- `content`: New content for the post (Optional).
- `photo`: New image for the post (Optional).

#### Response:
- **200 OK**: If the post is updated successfully.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Post updated successfully",
      "updatedPost": {
        "user_id": "user_id_here",
        "content": "Updated post content",
          "photo": "updated_image.jpg"
      }
    }
    ```

- **404 Not Found**: If the post is not found.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Post not found"
    }
    ```

- **403 Unauthorized**: If the user tries to access a post that is not theirs.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Unauthorized action"
    }
    ```

---

### **5. Delete Post**

**Endpoint**: `DELETE /api/posts/my_profile/:post_id`
**Endpoint**: `DELETE /api/posts/main/:post_id`

This endpoint is used to delete a post. It first verifies that the post belongs to the user.

#### Input:
- `post_id`: ID of the post to delete.

#### Response:
- **200 OK**: If the post is deleted successfully.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Post deleted successfully",
      "deletePost": {
        "user_id": "user_id_here",
        "content": "Post content to delete",
        "photo": "image_to_delete.jpg"
      }
    }
    ```

- **404 Not Found**: If the post is not found.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Post not found"
    }
    ```

- **403 Unauthorized**: If the user tries to access a post that is not theirs.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Unauthorized action"
    }
    ```

---

# Like and Comment API Documentation 

## Overview

This section describes the Like and Comment functionality in the system.

## Endpoints

### **1. Add a Like**

**Endpoint**: `POST /main/:id/like`

This route allows a user to add a like to a post. 

#### Request Body:
None required. The user is authenticated via the token.

#### Response:
- **200 OK**: If the like is added successfully.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Post liked"
    }
    ```

- **403 Unauthorized**: If the user is not logged in.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "User not logged in"
    }
    ```

---
### **2. remove a Like**

**Endpoint**: `POST /main/:id/unlike`

This route allows a user to remove a like to a post. 

#### Request Body:
None required. The user is authenticated via the token.

#### Response:
- **200 OK**: If the unlike is removed successfully.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Like removed successfully"
    }
    ```

- **403 Unauthorized**: If the user is not logged in.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "User not logged in"
    }
    ```

---

### **3. Comment on a Post**

**Endpoint**: `POST /main/:id/comment`

This endpoint allows a user to comment on a post.

#### Input:
- `comment`: The comment text.

#### Response:
- **201 Created**: If the comment is successfully created.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Comment added",
      "data": {
        "comment": "Nice post!",
        "user_id": "user_id_here"
      }
    }
    ```

- **400 Bad Request**: If the comment is empty.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Comment cannot be empty"
    }
    ```

--- 
Thank you for the clarification! Here are the updated routes for **editing** and **deleting** comments, written in English:

---

### **4. Edit Comment**

**Endpoint**: `PATCH /main/:post_id/comment/:comment_id`

This endpoint allows the user to edit a comment that they have previously posted on a particular post.

#### Input:
- `comment`: The new text for the comment.

#### Response:
- **200 OK**: If the comment is successfully edited.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Comment edited successfully",
      "data": {
        "comment": "New comment text",
        "user_id": "user_id_here"
      }
    }
    ```

- **400 Bad Request**: If the comment text is empty.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Comment cannot be empty"
    }
    ```

- **404 Not Found**: If the comment is not found.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Comment not found"
    }
    ```

- **403 Unauthorized**: If the user tries to edit a comment they do not own.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "You are not authorized to edit this comment"
    }
    ```

---

### **5. Delete Comment**

**Endpoint**: `DELETE /main/:post_id/comment/:comment_id`

This endpoint allows the user to delete a comment they have previously posted on a particular post.

#### Input:
- `comment_id`: The ID of the comment to be deleted.

#### Response:
- **200 OK**: If the comment is successfully deleted.
  - Example:
    ```json
    {
      "status": "SUCCESS",
      "message": "Comment deleted successfully",
      "deletedComment": {
        "comment": "Deleted comment text",
        "user_id": "user_id_here"
      }
    }
    ```

- **404 Not Found**: If the comment is not found.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "Comment not found"
    }
    ```

- **403 Unauthorized**: If the user tries to delete a comment they do not own.
  - Example:
    ```json
    {
      "status": "FAIL",
      "message": "You are not authorized to delete this comment"
    }
    ```

---
