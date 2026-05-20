# 📘 ReliHub Backend: Comprehensive API Specification

This document provides the definitive technical specification for the ReliHub ecosystem. All endpoints are accessible via the local fallback server at `http://localhost:3060/api`.

---

## 🔐 1. Authentication & Security

### 1.1 User Login
*   **Method**: `POST`
*   **Endpoint**: `/api/auth/login`
*   **Description**: Authenticates users and returns session tokens and profiles.

**Request Body**:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | Registered user email. |
| `password` | String | Yes | Plaintext password (comparison). |

**Success Response (200 OK)**:
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "company_id": 7,
    "roles": [{"id": 2, "name": "Company Admin", "slug": "company-admin"}]
  },
  "token": "dev-token-..."
}
```

**Errors**:
*   `401 Unauthorized`: Invalid credentials.
*   `500 Internal Error`: Database connection failure.

---

## 🏢 2. Enterprise & Organization Management

### 2.1 Atomic Organization Provisioning
*   **Method**: `POST`
*   **Endpoint**: `/api/provision-organization`
*   **Description**: Creates a Company, an Admin User, and assigns roles in a single database transaction.

**Request Body**:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Official organization name. |
| `registration_number`| String | Yes | Unique business registration ID. |
| `email` | String | Yes | Corporate contact email. |
| `admin_name` | String | Yes | Full name of the primary administrator. |
| `admin_email` | String | Yes | Login email for the administrator. |
| `password` | String | Yes | Initial login password. |
| `modules` | Array | Yes | List of enabled feature slugs (e.g., `["locomotive", "ai"]`). |

### 2.2 Company Management (CRUD)
*   **List Companies**: `GET /api/companies`
*   **Update Company**: `PATCH /api/companies/:id`
*   **Delete Company**: `DELETE /api/companies/:id` (Performs a **CASCADE** delete).

---

## 📍 3. Division & Branch Infrastructure

### 3.1 List Company Branches
*   **Method**: `GET`
*   **Endpoint**: `/api/companies/:companyId/branches`

### 3.2 Branch Operations (CRUD)
*   **Create Branch**: `POST /api/branches`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `company_id` | Integer | Yes | Parent company ID. |
| `name` | String | Yes | Branch name (e.g., "Mtwara Hub"). |
| `location` | String | No | Geographic coordinates or city. |

*   **Update Branch**: `PATCH /api/branches/:id`
*   **Delete Branch**: `DELETE /api/branches/:id`

---

## 📋 4. Operational Workflows (Jobs)

### 4.1 Job Lifecycle
*   **List Jobs**: `GET /api/jobs`
*   **Create Job**: `POST /api/jobs`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Task heading. |
| `status` | String | Yes | `pending`, `in-progress`, `completed`. |
| `due_date`| Date | Yes | Scheduled deadline. |
| `company_id` | Integer | Yes | Target company. |

*   **Update Job**: `PATCH /api/jobs/:id`

---

## ⚠️ 5. Monitoring & Field Intelligence

### 5.1 Incident Desk
*   **Endpoint**: `GET /api/incidents`
*   **Update**: `PATCH /api/incidents/:id`

### 5.2 Real-time Alerts
*   **Endpoint**: `GET /api/alerts`

---

## 📈 6. Reporting & Analytics

### 6.1 Tank Performance
*   **Endpoint**: `GET /api/reports/tanks`

### 6.2 Asset Efficiency
*   **Locomotives**: `GET /api/reports/locomotives`
*   **Flow Meters**: `GET /api/reports/flow-meters`

---

## ⚙️ 7. System Governance

### 7.1 Audit Trail
*   **Endpoint**: `GET /api/audit-logs`

### 7.2 System Health & Snapshots
*   **Stats**: `GET /api/system/stats`
*   **Backups**: `GET /api/system/backups`

---

> [!IMPORTANT]
> **Data Integrity**: Deleting a company via `DELETE /api/companies/:id` will trigger a cascading deletion of all associated branches, users, and audit records for that tenant. This action is irreversible.
