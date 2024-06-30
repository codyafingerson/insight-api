# Insight Customer Management System Web API

## Introduction

Insight Customer Management System (CMS) Web API is a robust and scalable solution designed to manage customer data efficiently and securely. This API allows users to perform various operations such as creating, reading, updating, and deleting customer information. It also includes features like authentication and authorization, user management, data validation, and more. The API is built using Node.js, Express, and MongoDB, ensuring high performance and reliability. The documentation for this API can be found at [Insight CMS API Documentation](https://codyafingerson.github.io/insight-api/).

## Features
- Customer CRUD Operations: Create, read, update, and delete customer records.
- Customer Search: Search for customers using various filters and criteria.
- Authentication & Authorization: Secure access to API endpoints with robust authentication and role-based authorization mechanisms.
- User CRUD Operations: Create, read, update, and delete user records. (System administrator roles have access)
- Data Validation: Ensure the integrity and accuracy of customer data with server-side validation.
- Scalability: Built to handle a large number of customer records and high traffic with ease.
- Extensible: Easily extendable to include additional features and integrations as needed.


### Prerequisites
1. Node.js must be installed on your machine. You can download it from [Node.js](https://nodejs.org/).
2. MongoDB must be installed on your machine. You can download it from [MongoDB](https://www.mongodb.com/try/download/community).
    (Alternatively, you can use a cloud-based MongoDB service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
3. A basic understanding of JavaScript, Node.js, Express, and MongoDB.
4.  A basic understanding of RESTful APIs and CRUD operations.

### Installation

1. Clone the repository
```bash
git clone https://github.com/codyafingerson/insight-api.git
```
2. Install the dependencies of the project
```bash
cd insight-api
npm install
```
3. Create a `.env` file in the root directory of the project and add the following environment variables:
```bash
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/insight-cms
JWT_SECRET=fizzbuzz
JWT_EXPIRE=2h
COOKIE_SECRET=foodbarbaz

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=janedoe@gmail.com
MAIL_PASSWORD=the_doe_fam
MAIL_FROM=no_reply@insightcrm.com
```
4. Start the development server
```bash
npm run dev
```
5. The server should now be running on `http://localhost:8000` by default or the port you specified in the `.env` file.
6. Confirm your installation by sending a `GET` request to `http://localhost:8000` using a tool like Postman or cURL. If successful, you should receive a response with the following
```json
{
    "success": true,
    "message": "Insight CMS Web API",
    "version": "2.0.0",
    "endpoints": {
        "auth": "/api/auth",
        "users": "/api/users",
        "customers": "/api/customers"
    },
    "documentation": "https://codyafingerson.github.io/insight-api"
}
```
7. Next, you will need to create a user account to access the API. 
   - **NOTE**: Due to ALL user related actions being restricted to user's with system administrator or administrator roles, you will need to visit the [userRoutes](./src/routes/userRoutes.ts#L8) file, and comment out line 8 before proceeding.
    1. Send a `POST` request to `http://localhost:8000/api/users` with the following JSON payload:
   ```json
   {
    "isActive": true,
    "role": "system_admin",
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "password": "password123"
   }
   ```
   If your request was successful, and you entered a valid email address, you should receive an email confirmation that your account has been created.
   * Since this project is still in development, you will need to access your database, and modify the `isPasswordChangeRequired` field to false in order to access the API.
   * Remember to uncomment line 8 in the [userRoutes](./src/routes/userRoutes.ts#L8) file to re-enable the authorization middleware!

## Routes (not complete)

- **Auth Routes**
  - **`GET`** - `/profile/:id` - Gets the users profile by ID provided by the JWT token stored in the request cookie.
  - **`GET`** - `/logout` - Logs the user out by clearing the JWT token stored in the request cookie.
  - **`POST`** - `/login` - Logs the user in by verifying the user's credentials and creating a JWT token to be stored in the request cookie.
  - **`POST`** - `/request-password-reset` - Sends an email to the user with a link to reset their password.
  - **`POST`** - `/reset-password` - Resets the user's password after verifying the token provided in the email.
  
<!-- - **User Routes**

- **Customer Routes** -->


## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. To contribute to this project, please follow the steps below:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Cody Fingerson - [GitHub](https://github.com/codyafingerson)