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

* `POST /api/auth/login`

### **Checks**

* `POST /api/check` – Create a new API check

* `GET /api/check` – Get all checks for the authenticated user

* `POST /api/check/:id` – Execute a check manually

* `GET /api/check/:id/results` – Get recent execution results

### **Incidents**

* `GET /api/incident` – Get all incidents for the authenticated user

* `GET /api/incident?checkId=...` – Filter incidents by checkId
## Tech Stack

**Node.js + TypeScript**<br>
**Express**<br>
**PostgreSQL**<br>
**node-postgres (pg)**<br>
**JWT Authentication**

## How to Run Locally
## Design Decisions
## What I Would Add Next

