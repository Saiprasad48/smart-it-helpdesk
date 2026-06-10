# Smart IT Helpdesk & Asset Management System

A full-stack IT support platform for managing helpdesk tickets, IT assets, user assignments, and support analytics. The system includes role-based authentication, ML-based ticket categorization, asset tracking, and an analytics dashboard.

## Project Overview

Smart IT Helpdesk helps students or employees submit IT support tickets while allowing IT staff and admins to manage issue resolution, assign tickets, track assets, and monitor support operations through dashboards.

When a ticket is created, the backend automatically predicts the issue category using a machine learning model trained on support ticket text.

## Key Features

- User authentication with JWT
- Role-based access control
  - Student
  - IT Staff
  - Admin
- Create and manage IT support tickets
- ML-based ticket category prediction
  - Hardware
  - Software
  - Network
  - Account Access
  - Other
- Assign tickets to IT staff or admins
- Track ticket status and priority
- Manage IT assets such as laptops, monitors, printers, and accessories
- Assign assets to users
- Analytics dashboard with charts
- Dockerized full-stack setup
- PostgreSQL database integration

## Tech Stack

### Frontend
- React
- Vite
- Axios
- React Router
- Recharts

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

### Machine Learning
- Scikit-learn
- TF-IDF Vectorizer
- Logistic Regression
- Joblib

### DevOps
- Docker
- Docker Compose
- Nginx

## System Architecture

```text
React Frontend
      |
      | REST API
      v
FastAPI Backend
      |
      | SQLAlchemy ORM
      v
PostgreSQL Database

ML Service:
Ticket Title + Description
      |
      v
TF-IDF + Logistic Regression
      |
      v
Predicted Ticket Category
```

## User Roles

### Student
- Register and login securely
- Create IT support tickets
- View their own submitted tickets
- Track ticket status, priority, and predicted category
- View assets assigned to their account

### IT Staff
- View all submitted tickets
- Update ticket status, priority, and category
- Assign tickets to IT staff or admins
- Manage IT asset inventory
- Assign assets to users
- View analytics dashboard

### Admin
- Full access to all platform features
- Manage tickets, assets, users, and analytics
- Assign tickets and assets
- View support trends through dashboard charts
- Monitor ticket categories, priorities, statuses, and asset usage

## Demo Credentials

After running the seed script, use the following demo accounts:

```text
Admin:
Email: admin.demo@example.com
Password: Password123

IT Staff:
Email: it.staff@example.com
Password: Password123

Student:
Email: student.demo@example.com
Password: Password123
```

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd smart-it-helpdesk
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
```

Train the ML model:

```bash
python app/ml/train_model.py
```

Seed sample data:

```bash
python -m app.db.seed
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Docker Setup

Run the complete application with one command:

```bash
docker compose up --build
```

Seed the database inside the backend container:

```bash
docker compose exec backend python -m app.db.seed
```

Open the application:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Docs:     http://localhost:8000/docs
```

Stop the containers:

```bash
docker compose down
```

Remove containers and database volume:

```bash
docker compose down -v
```

## API Endpoints

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Tickets
- `POST /tickets/`
- `GET /tickets/`
- `GET /tickets/{ticket_id}`
- `PATCH /tickets/{ticket_id}`
- `PATCH /tickets/{ticket_id}/assign`

### Assets
- `POST /assets/`
- `GET /assets/`
- `GET /assets/my-assets`
- `GET /assets/{asset_id}`
- `PATCH /assets/{asset_id}`
- `PATCH /assets/{asset_id}/assign`

### Users
- `GET /users/`
- `GET /users/staff`

### Analytics
- `GET /analytics/summary`

## Machine Learning Component

The ticket classification model automatically predicts the category of a support ticket based on its title and description.

The model uses:

- TF-IDF Vectorizer for text feature extraction
- Logistic Regression for classification
- Joblib for saving and loading the trained model

Supported ticket categories:

- Hardware
- Software
- Network
- Account Access
- Other

Example prediction:

```text
Input:
Title: Cannot connect to WiFi
Description: My laptop is unable to connect to the campus WiFi network.

Predicted Category:
Network
```

## Project Highlights

- Built a production-style full-stack IT support platform using React, FastAPI, PostgreSQL, and Docker.
- Implemented secure JWT authentication with role-based access for students, IT staff, and admins.
- Developed ticket management workflows including ticket creation, status updates, priority updates, category updates, and assignment.
- Integrated an ML-based ticket categorization system using TF-IDF and Logistic Regression.
- Built an asset management module to track devices, statuses, and user assignments.
- Designed analytics dashboards with charts for ticket status, ticket category, ticket priority, and asset status.
- Added Docker Compose support to run frontend, backend, and PostgreSQL together.

## Future Improvements

- Add ticket comments and activity history
- Add email notifications for ticket assignment and status updates
- Add file attachments for support tickets
- Add ML confidence scores for predicted ticket categories
- Add advanced filtering and search for tickets and assets
- Add pagination for large ticket and asset tables
- Add audit logs for admin actions
- Add CI/CD pipeline using GitHub Actions
- Deploy the application to AWS, Render, Railway, or Fly.io
- Add unit and integration tests for backend APIs