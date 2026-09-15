# BroomBoom Franchise Standalone Backend

This directory contains an independent **Express.js REST API server** for the BroomBoom Franchise operations, providing endpoints for external mobile apps, CRM systems, webhooks, or third-party integrations.

---

## Architecture Overview

- **Storage**: Shared persistent database file located at `../data/broomboom-store.json`. Both this Express server and the Next.js frontend write to and read from the same persistent data store.
- **Port**: Default `http://localhost:5000` (configurable via `PORT` environment variable).
- **CORS**: Enabled by default for all origins.

---

## Quick Start

1. Open terminal inside the `backend` folder:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. For development with auto-reload:
   ```bash
   npm run dev
   ```

---

## API Endpoints Reference

### 1. System Health
- **`GET /health`**
  - Returns service status and current timestamp.

### 2. Franchise Applications (Leads)
- **`GET /api/leads`**
  - Query parameters:
    - `status`: `new` | `contacted` | `under_review` | `site_visit` | `approved` | `rejected`
    - `package`: `silver` | `gold` | `platinum`
    - `query`: Text search by name, city, phone, or application ID
- **`GET /api/leads/:id`**
  - Retrieve details for a specific lead.
- **`POST /api/leads` or `POST /api/apply`**
  - Body payload:
    ```json
    {
      "fullName": "Rahul Sharma",
      "mobile": "+91 9876543210",
      "email": "rahul@gmail.com",
      "city": "Lucknow",
      "state": "Uttar Pradesh",
      "preferredPackage": "gold",
      "investmentBudget": "₹5L - ₹10L",
      "spaceStatus": "Commercial space ready",
      "carpetArea": "400 sq.ft"
    }
    ```
- **`PATCH /api/leads/:id`**
  - Update lead status or admin notes:
    ```json
    {
      "status": "approved",
      "adminNotes": "Agreement signed and PIN code 226010 locked."
    }
    ```
- **`DELETE /api/leads/:id`**
  - Delete an application from the pipeline.

### 3. Brochure Downloads Tracking
- **`GET /api/brochure`**
  - Retrieve all prospectus download logs.
- **`POST /api/brochure`**
  - Log a new prospectus download:
    ```json
    {
      "name": "Amitabh Verma",
      "mobile": "+91 9415012345",
      "city": "Patna"
    }
    ```

### 4. Franchise Store Hubs
- **`GET /api/hubs`**
  - Get all operational franchise hubs.
- **`POST /api/hubs`**
  - Add a new operating hub to the network.
- **`DELETE /api/hubs/:id`**
  - Remove a hub.

### 5. Territory Analytics
- **`GET /api/analytics`**
  - Returns total lead count, package demand breakdown, active hubs count, and audit activity.

