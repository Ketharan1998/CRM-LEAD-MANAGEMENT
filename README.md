# CRM Lead Management

>A small CRM for managing leads, notes and basic pipeline tracking. This repository includes a React + Vite frontend (`client/`) and an Express + MySQL backend (`server/`).

## Project overview

- **Purpose:** Lightweight lead management app for tracking leads, notes, and simple pipeline/status changes.
- **Structure:**
  - `client/` — React UI built with Vite.
  - `server/` — Express API with MySQL (using `mysql2/promise`).

## Tech stack

- Frontend: React, Vite, React Router, Bootstrap
- Backend: Node.js, Express
- Database: MySQL (accessed via `mysql2`)
- Authentication: JWT (`jsonwebtoken`) with password hashing using `bcrypt`
- Environment: `dotenv` for server env variables

## Features implemented

- Email/password login (JWT-based authentication)
- Public endpoints to list leads and view a lead by id
- Protected endpoints for creating, updating and deleting leads
- Add and fetch lead notes
- Frontend pages: Login, Dashboard, Leads list, Lead notes, Pipeline
- Protected frontend routes that require a valid JWT

## How to run locally

Prerequisites:

- Node.js (16+ recommended)
- MySQL server

Server

1. Open a terminal and navigate to `server/`.
2. Install dependencies:

```bash
cd server
npm install
```

3. Create a `.env` file (example below) and start the server:

```bash
# from server/
node index.js
```

Client

1. Open a second terminal and navigate to `client/`.
2. Install and run:

```bash
cd client
npm install
npm run dev
```

The frontend expects the backend API at `http://localhost:5000`. If you change the server port, update `client/src/api/authApi.js` (and other API modules) accordingly.

## Environment variables

Create a `server/.env` file with the following keys:

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=crm_db
JWT_SECRET=a-very-secret-key
PORT=5000
```

Notes:
- The server uses `dotenv` and reads `DB_*` and `JWT_SECRET` values from the environment.
- The client currently uses a hard-coded API base URL (`http://localhost:5000/api`). You can refactor the client to use a `VITE_API_URL` env var if you prefer.





```sql
INSERT INTO users (name, email, password_hash, created_at)
VALUES ('Admin User', 'admin@example.com', '<BCRYPT_HASH>', NOW());
```

Recommended test credentials after you insert the user above:


    Test login credentials:
-     Email:       ketharan19@gmail.com
-     Password:   123456


## Database setup

Below are minimal example schemas for the tables used by the server. Adjust types and constraints for your environment.

```sql
CREATE DATABASE crm_db;
USE crm_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  lead_source VARCHAR(255),
  assigned_salesperson VARCHAR(255),
  status VARCHAR(100) NOT NULL,
  estimated_deal_value DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  user_id INT,
  note_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

Health check: `GET /api/health` should return a JSON object indicating the server and DB status.


