# Api_Monitoring & Incident_Detection Backend
A backend service that allows authenticated users to define API health checks, execute them on demand, record historical results, and automatically detect and resolve incidents based on failure patterns.
## Problem Statement
Modern applications depend on multiple third-party APIs (payments, messaging, maps, shipping).
When these APIs fail or become slow, users experience issues before teams are aware.

This project solves that problem by providing a backend system that:

* Actively checks external APIs

* Tracks performance and availability over time

* Detects real outages using failure streaks

* Automatically resolves incidents on recovery
## High-level Overview
The system works in four stages:

**1. Check Definition:**
Users define how an API should be tested (URL, method, expected status, timeout).

**2. Check Execution:**
Checks are executed manually. Each execution performs a real HTTP request and measures latency.

**3. Result Storage:**
Every execution result (success/failure, status code, latency) is stored as historical data.

**4. Incident Detection:**
If an API fails three consecutive times, an incident is opened.
When a successful result occurs, the incident is automatically resolved.
## System Architecture
```
Client
  ↓
Express API
  ↓
PostgreSQL
```
* Authentication ensures each user accesses only their own checks and incidents

* Business logic is executed synchronously for correctness

* External APIs are called directly during check execution
## Core Concepts
**API Check**<br>
A configuration describing how to test an external API.

Fields include:
* URL
* HTTP method
* Expected status code
* Timeout threshold
---
**Check Result**<br>
A record of a single check execution.

Each result stores:
* Success or failure
* HTTP status code (if available)
* Request latency
* Timestamp
---
**Incident**<br>
A stateful representation of an ongoing API outage.
<br>Rules:
* An incident opens after 3 consecutive failures
* Only one open incident per check
* An incident resolves on the first successful check

## API Endpoints
### **Authentication**

* `POST /api/auth/register`
```
POST /auth/register
Content-Type: application/json
body:
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "password123",
}

```

* `POST /api/auth/login`
```
POST /auth/login
Content-Type: application/json
body:{
  "email":"demo@example.com",
  "password":"password123"
}
```

### **Checks**

* `POST /api/check` – Create a new API check
```
POST /api/check
Content-Type : application/json
Authorization: Bearer <JWT_TOKEN>
body : {
  "name": "My API Check",
  "url": "https://api.example.com/health",
  "method": "GET",
  "expected_status": 200,
  "timeout_ms": 5000,
  "interval_time": 5
}
```
* `GET /api/check` – Get all checks for the authenticated user
```
GET /api/check
Authorization: Bearer <JWT_TOKEN>
```
* `POST /api/check/:id` – Execute a check manually
```
POST /api/check/:id
Authorization: Bearer <JWT_TOKEN>
```

* `GET /api/check/:id/results` – Get recent execution results
```
GET /api/check/:id/results
Authorization: Bearer <JWT_TOKEN>
```

### **Incidents**

* `GET /api/incident` – Get all incidents for the authenticated user
```
GET /api/incident
Authorization: Bearer <JWT_TOKEN>
```

* `GET /api/incident?checkId=...` – Filter incidents by checkId
```
GET /api/incident?checkId=checkid
Authorization: Bearer <JWT_TOKEN>
```
## Tech Stack

**Node.js + TypeScript**<br>
**Express**<br>
**PostgreSQL**<br>
**node-postgres (pg)**<br>
**JWT Authentication**

## How to Run Locally (Docker)
This project is fully containerized using Docker and Docker Compose, so no local Node, Bun, or PostgreSQL installation is required.

### **Prerequisites**<br>
* Docker

* Docker Compose

### **Steps**

#### **1. Clone the repository**

```
git clone https://github.com/Akhil-1802/API_Monitoring.git
cd API_Monitoring
```


#### **2. Start the application**

```
docker-compose up --build
```


This will:

* Build the API service (Bun + Express)

* Start a PostgreSQL database

* Automatically initialize the database schema

* Start the cron-based monitoring service

#### **3. Access the API**

* API base URL: `http://localhost:3000`

---

### **Environment Configuration**

Environment variables are managed via Docker Compose.
A sample `.env.example` file is provided.
```
PORT = 3000
JWT_SECRET = YOUR_SECRET_KEY
DATABASE_URL=postgres://postgres:postgres@db:5432/api_monitor
NODE_ENV= development
```

Docker Compose automatically injects these values into the containers.

---

#### **First-Time Startup Behavior**

* The database starts empty

* No users or checks exist initially

* Users must register and create checks via the API

* The cron job safely runs even when no checks exist
---
### **Stopping the Application**
```
docker-compose down
```


**To remove database data completely:**

```
docker-compose down -v
```

### **Troubleshooting**

* Ensure ports 3000 is not already in use

* Run docker ps to verify containers are running

* Use docker-compose logs to inspect container logs
## What I Would Add Next

This project is intentionally built as a solid foundation.
Given more time, the following enhancements would further improve scalability, reliability, and real-world usability.

### **🔄 Background Job Processing (Redis + BullMQ)**

Move API checks out of the main application process into background workers using Redis and BullMQ.
This would:

* Improve scalability for large numbers of checks

* Prevent slow or failing checks from blocking the API

* Enable horizontal worker scaling

### **📊 Metrics & Analytics**

Introduce aggregated metrics for each check, such as:

* Uptime percentage

* Average and p95 latency

* Incident duration statistics

These metrics would be computed from stored check results and exposed via dedicated endpoints.

### **🔔 Notifications & Alerts**

Add alerting mechanisms for incident creation and resolution:

* Email notifications

* Webhook integrations (Slack, Discord, PagerDuty)

* Custom alert thresholds per check

### **📄 OpenAPI Documentation**

Provide interactive API documentation using OpenAPI:

* Improves developer onboarding

* Enables automatic client generation

* Makes the API easier to test and explore

### **🔐 Role-Based Access Control**

Extend authentication to support roles:

* Admin users

* Read-only users

* Organization-level access

* This would allow teams to manage shared checks securely.

### **🌍 Production Deployment**

Deploy the system to a cloud environment:

* Managed PostgreSQL

* Environment-based configuration

* Health checks and logging

* Horizontal scaling for workers

## **🧪 Automated Testing**

Add a full test suite:

* Unit tests for business logic

* Integration tests for API endpoints

* Database transaction testing

* This would ensure long-term reliability as the system grows.

