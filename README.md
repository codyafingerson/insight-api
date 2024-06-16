# Insight CRM Web API

Insight CRM is a simple to use, minimalistic CRM system that allows you to manage your customers, leads, and 
opportunities. This API allows you to interact with the CRM system programmatically.

## Installation
### Prerequisites
- Node.js v14.17.0 or higher installed on your machine.
- MongoDB installed on your machine or a MongoDB Atlas account.

1. Clone this repository to your local machine using `git clone https://www.github.com/insight-crm/api.git`.
2. Navigate to the project directory using `cd api`.
3. Install the dependencies using `npm install`.
4. Create a `.env` file in the root of the project directory and add the following environment variables, replacing 
   the values with your own values:
    ```env
    NODE_ENV=development
    PORT=8000
    MONGO_URI=mongodb://localhost:27017/insight-crm-api
    JWT_SECRET=foobardoobardoo
    JWT_EXPIRE=30d
    SESSION_SECRET=foobardoobardoo

    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USER=username
    MAIL_PASSWORD=password
    MAIL_FROM=no_reply@insightcrm.com
    ```

## Usage
- All routes are prefixed with `/api`.

---
### Authentication Routes `/auth/`

The `authRouter` handles all authentication-related operations in the application. Below is a detailed description of 
each route, including its purpose, HTTP method, and URL.

#### Routes
1. **Log Out User**
    - **URL:** `/logout`
    - **Method:** `POST`
    - **Description:** Logs out the current user by invalidating their session or token.

2. **Log In User**
    - **URL:** `/login`
    - **Method:** `POST`
    - **Description:** Authenticates a user with their credentials and returns a token or session.

3. **Get Current User**
    - **URL:** `/current-user`
    - **Method:** `GET`
    - **Description:** Retrieves the details of the currently logged-in user.

These routes are defined in the `authRouter` and are used to manage authentication-related operations within the 
application. The routes facilitate user login, logout, and retrieval of the current user's details.

---

### User Routes `/users/`

The `userRouter` handles all user-related operations in the application. Below is a detailed description of each route, 
including its purpose, HTTP method, URL, and any middleware used.

#### Routes

1. **Get All Users**
    - **URL:** `/all`
    - **Method:** `GET`
    - **Middleware:** `protect`, `admin`
    - **Description:** Retrieves a list of all users. Only accessible by admin users.

2. **Create New User**
    - **URL:** `/create`
    - **Method:** `POST`
    - **Middleware:** `protect`, `admin`
    - **Description:** Creates a new user. Only accessible by admin users.

3. **Get User by ID**
    - **URL:** `/:id`
    - **Method:** `GET`
    - **Middleware:** `protect`, `admin`
    - **Description:** Retrieves a user by their ID. Only accessible by admin users.

4. **Update User**
    - **URL:** `/update/:id`
    - **Method:** `PUT`
    - **Middleware:** `protect`, `admin`
    - **Description:** Updates a user's information by their ID. Only accessible by admin users.

5. **Search Users**
    - **URL:** `/search`
    - **Method:** `GET`
    - **Middleware:** `protect`, `admin`
    - **Description:** Searches for users based on query parameters. Only accessible by admin users.

6. **Delete User**
    - **URL:** `/delete/:id`
    - **Method:** `DELETE`
    - **Middleware:** `protect`, `admin`
    - **Description:** Deletes a user by their ID. Only accessible by admin users.

7. **Request Password Reset**
    - **URL:** `/request-password-reset`
    - **Method:** `POST`
    - **Description:** Initiates a password reset request for a user.

8. **Reset Password**
    - **URL:** `/reset-password`
    - **Method:** `POST`
    - **Description:** Resets a user's password using a token.

9. **Send Email**
    - **URL:** `/send-email/:id`
    - **Method:** `POST`
    - **Middleware:** `protect`, `admin`
    - **Description:** Sends an email to a user by their ID. Only accessible by admin users.

#### Middleware

- **protect:** Ensures that the user is authenticated.
- **admin:** Ensures that the user has admin privileges.

These routes are defined in the `userRouter` and are used to manage user-related operations within the application. 
The routes are protected by authentication and authorization middleware to ensure that only authorized users can access 
them.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author
Cody Fingerson