# The Lumine - Backend ⚙️

The backend of **The Lumine** is a robust RESTful API built with Node.js, Express, and MongoDB. It handles authentication, Role-Based Access Control (RBAC), and complex data aggregations for business insights.

## ✨ Features

- **RBAC Middleware**: Strict role gating for Owner, Admin, and Staff routes.
- **JWT Authentication**: Dual-token system (Access + Refresh) for high security and seamless sessions.
- **Aggregation Pipelines**: Advanced MongoDB pipelines for calculating inventory valuation and staff performance stats.
- **Data Validation**: Mongoose schema-level enforcement for data integrity.
- **Modular Routes**: Clean separation of concerns for users, appointments, inventory, and permissions.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: Argon2/Bcrypt for hashing, JsonWebToken for Auth
- **Language**: TypeScript/JavaScript (ESM)

## 📦 Getting Started

1. **Navigate to directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Config**:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET_KEY=your_secret
   JWT_REFRESH_KEY=your_refresh_secret
   ```
4. **Run Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Folder Structure

- `src/controllers`: Request handlers and business logic.
- `src/models`: Mongoose schemas and data models.
- `src/routes`: API endpoint definitions.
- `src/middlewares`: Auth, RBAC, and error handling.
- `src/utils`: Token generators and helper functions.
- `src/config`: Database and environment configurations.
