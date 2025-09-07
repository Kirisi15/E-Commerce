# E-Commerce

An online shopping platform built with the MERN stack where users can browse products, manage carts, and admins can manage inventory.

---

## Features

- User signup/login (JWT)
- Password hashing with bcrypt
- Browse products
- Cart management
- Admin product management (add/remove products, upload images)
- Role-based access control
- Auth0 integration for secure authentication

---

## Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT, Auth0  
- **Other Libraries:** bcrypt, Joi, Multer, Helmet, xss-clean, express-mongo-sanitize, cors

---

## Setup

All configuration values (MongoDB URI, JWT secret, Auth0 domain, port) are **defined directly in the main server file (`server.js`)**.  

1. Install dependencies:

```bash
npm install

2. Start the backend:
    node server.js
    Backend runs on http://localhost:4000

3.Start the frontend:
    cd frontend
    npm install
    npm start
    Frontend runs on http://localhost:3000.

