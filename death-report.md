# Death Report API Documentation

## Overview

This document provides a complete reference for the Death Report API. All endpoints are prefixed with `/api/v1`. Death report endpoints are **public** and do not require authentication.

**Base URL:** `http://localhost:3002/api/v1`

**Authentication:** None required for any death report endpoint.

---

## Data Model

### DeathReport Fields

| Field | Type | Required | JSON Key | Description |
|-------|------|----------|----------|-------------|
| ID | int | No (auto-generated) | `id` | Unique identifier for the report. Required for updates. |
| Reference | string | Yes | `ref` | External reference number for the report |
| Reported Date | string | Yes | `reportedDate` | Date the death was reported |
| Incident Date | string | Yes | `incidentDate` | Date the incident occurred |
| Incident Time | string | Yes | `incidentTime` | Time the incident occurred (24h format) |
| Department | string | Yes | `department` | Department where incident occurred |
| Location | string | Yes | `location` | General location |
| Category | string | Yes | `category` | Category of incident |
| Sub Category | string | Yes | `subCategory` | Sub-category of incident |
| Description | string | Yes | `description` | Detailed description of the incident |
| Action Taken | string | Yes | `actionTaken` | Actions taken after the incident |
| Opened Date | string | No | `openedDate` | Date case was opened |
| Submitted Time | string | No | `submittedTime` | Time report was submitted |
| Handler | string | No | `handler` | Person handling the report |
| Manager | string | No | `manager` | Manager overseeing the case |
| Specialty | string | No | `specialty` | Medical specialty involved |
| Exact Location | string | No | `exactLocation` | Precise location (ward, bed, etc.) |
| Coding | string | No | `coding` | Medical coding (e.g., ICD-10) |
| Type | string | No | `type` | Type of incident (default: `Clinical Incident`) |
| Risk Grading | string | No | `riskGrading` | Risk severity grade |
| Result | string | No | `result` | Outcome of the incident |
| Actual Harm | string | No | `actualHarm` | Actual harm caused |
| Potential Harm | string | No | `potentialHarm` | Potential harm |
| Details | string | No | `details` | Additional details |
| Patient Involved | bool | No | `patientInvolved` | Whether a patient was involved |
| Patient Told | bool | No | `patientTold` | Whether patient was informed |
| Family Told | bool | No | `familyTold` | Whether family was informed |
| What Family Told | string | No | `whatFamilyTold` | Details of what was communicated to family |
| Incident Investigation | string | No | `incidentInvestigation` | Investigation details |
| Review Meeting Date | string | No | `reviewMeetingDate` | Date of review meeting |
| Quality Assurance Lead | string | No | `qualityAssuranceLead` | QA lead name |
| Doctor Notified | bool | No | `doctorNotified` | Whether a doctor was notified |
| Meeting Discussion Points | string | No | `meetingDiscussionPoints` | Discussion points from review meeting |
| Meeting Action Points | string | No | `meetingActionPoints` | Action items from review meeting |
| Level of Investigation | string | No | `levelOfInvestigation` | Investigation level (e.g., Level 3, Comprehensive) |

---

## Endpoints

### 1. Create Death Report

| Attribute | Value |
|-----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/deathreport` |
| **Auth Required** | No |
| **Role Required** | None (public endpoint) |
| **Handler** | `cmd/deathreport.go:13` (`deathReport`) |

**Request Body:** `DeathReport` (see Data Model above)

**Required Fields:** `ref`, `reportedDate`, `incidentDate`, `incidentTime`, `department`, `location`, `category`, `subCategory`, `description`, `actionTaken`

**Responses:**

| Status | Response Body |
|--------|---------------|
| `201 Created` | `{"message": "The death has been reported"}` |
| `400 Bad Request` | `{"error": "A bad request was sent"}` |
| `500 Internal Server Error` | `{"error": "..."}` |

**Example Request:**

```bash
curl -X POST http://localhost:3002/api/v1/deathreport \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "DR-2026-001",
    "reportedDate": "2026-07-29",
    "incidentDate": "2026-07-28",
    "incidentTime": "14:30",
    "department": "ICU",
    "location": "Main Hospital",
    "category": "Mortality",
    "subCategory": "Unexpected death",
    "description": "Patient experienced acute cardiac arrest following surgical procedure.",
    "actionTaken": "CPR initiated immediately; resuscitation team responded. Pronounced dead at 15:05.",
    "openedDate": "2026-07-29",
    "submittedTime": "08:00",
    "handler": "Dr. John Doe",
    "manager": "Jane Smith",
    "specialty": "Cardiology",
    "exactLocation": "Bed 4, ICU Ward 2",
    "coding": "ICD-10-I46.9",
    "type": "Clinical Incident",
    "riskGrading": "High",
    "result": "Fatal",
    "actualHarm": "Severe / Death",
    "potentialHarm": "Severe",
    "details": "Patient was undergoing routine post-op monitoring.",
    "patientInvolved": true,
    "patientTold": false,
    "familyTold": true,
    "whatFamilyTold": "Family was informed about cardiac complications and unsuccessful resuscitation efforts.",
    "incidentInvestigation": "Internal review initiated by QA panel.",
    "reviewMeetingDate": "2026-08-01",
    "qualityAssuranceLead": "Dr. Alice Johnson",
    "doctorNotified": true,
    "meetingDiscussionPoints": "Reviewed timeline of medication administration and monitoring telemetry logs.",
    "meetingActionPoints": "Audit telemetry equipment calibration and update post-op cardiac monitoring protocol.",
    "levelOfInvestigation": "Level 3"
  }'
```

---

### 2. Update Death Report

| Attribute | Value |
|-----------|-------|
| **Method** | `PUT` |
| **Path** | `/api/v1/deathreport` |
| **Auth Required** | No |
| **Role Required** | None (public endpoint) |
| **Handler** | `cmd/deathreport.go:29` (`updateDeathReport`) |

**Request Body:** `DeathReport` — must include `id` to identify which report to update.

**Required Fields:** `id` plus any fields you want to update. All DeathReport fields are accepted.

**Responses:**

| Status | Response Body |
|--------|---------------|
| `200 OK` | `{"message": "The death report has been updated"}` |
| `400 Bad Request` | `{"error": "A bad request was passed: ..."}` |
| `404 Not Found` | `{"error": "..."}` |
| `500 Internal Server Error` | `{"error": "..."}` |

**Example Request:**

```bash
curl -X PUT http://localhost:3002/api/v1/deathreport \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "ref": "DR-2026-001",
    "reportedDate": "2026-07-29",
    "incidentDate": "2026-07-28",
    "incidentTime": "14:30",
    "department": "ICU",
    "location": "Main Hospital",
    "category": "Mortality",
    "subCategory": "Unexpected death",
    "description": "Updated description of the incident.",
    "actionTaken": "Updated action taken.",
    "openedDate": "2026-07-29",
    "submittedTime": "08:00",
    "handler": "Dr. John Doe",
    "manager": "Jane Smith",
    "specialty": "Cardiology",
    "exactLocation": "Bed 4, ICU Ward 2",
    "coding": "ICD-10-I46.9",
    "type": "Clinical Incident",
    "riskGrading": "High",
    "result": "Fatal",
    "actualHarm": "Severe / Death",
    "potentialHarm": "Severe",
    "details": "Additional details.",
    "patientInvolved": true,
    "patientTold": false,
    "familyTold": true,
    "whatFamilyTold": "Family was informed about updated findings.",
    "incidentInvestigation": "Internal review initiated by QA panel.",
    "reviewMeetingDate": "2026-08-01",
    "qualityAssuranceLead": "Dr. Alice Johnson",
    "doctorNotified": true,
    "meetingDiscussionPoints": "Reviewed updated timeline.",
    "meetingActionPoints": "Implement corrective actions.",
    "levelOfInvestigation": "Level 3"
  }'
```

---

### 3. Get All Death Reports (Paginated)

| Attribute | Value |
|-----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/deathreports` |
| **Auth Required** | No |
| **Role Required** | None (public endpoint) |
| **Handler** | `cmd/deathreport.go:53` (`getDeathReports`) |

**Query Parameters:**

| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| `page` | int | No | `1` | Minimum 1 |
| `limit` | int | No | `10` | Minimum 1, maximum 50 |

**Response Body** (`PaginatedDeathReportResponse`):

```json
{
  "deathReports": {
    "data": [
      {
        "id": 1,
        "ref": "DR-2026-001",
        "reportedDate": "2026-07-29",
        "incidentDate": "2026-07-28",
        "incidentTime": "14:30",
        ...
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

**Responses:**

| Status | Response Body |
|--------|---------------|
| `200 OK` | `{"deathReports": {data: [...], pagination: {...}}}` |
| `500 Internal Server Error` | `{"error": "..."}` |

**Example Request:**

```bash
curl "http://localhost:3002/api/v1/deathreports?page=1&limit=10"
```

---

### 4. Search Death Reports

| Attribute | Value |
|-----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/searchDeathReport` |
| **Auth Required** | No |
| **Role Required** | None (public endpoint) |
| **Handler** | `cmd/deathreport.go:81` (`searchDeathReport`) |

**Query Parameters:**

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `searchQuery` | string | No | Non-empty string triggers search; empty string returns all reports |

**Search Behavior:** The search uses PostgreSQL `ILIKE` with trigram matching across the following fields:
- `ref`
- `department`
- `location`
- `exact_location`
- `handler`
- `manager`
- `specialty`
- `coding`
- `category`
- `sub_category`
- `description`
- `details`
- `action_taken`
- `quality_assurance_lead`
- `incident_investigation`

**Response Body:**

```json
{
  "deathReports": [
    {
      "id": 1,
      "ref": "DR-2026-001",
      "reportedDate": "2026-07-29",
      "incidentDate": "2026-07-28",
      "incidentTime": "14:30",
      "department": "ICU",
      "location": "Main Hospital",
      "category": "Mortality",
      "subCategory": "Unexpected death",
      ...
    }
  ]
}
```

**Responses:**

| Status | Response Body |
|--------|---------------|
| `200 OK` | `{"deathReports": [{death report objects}]}` |
| `500 Internal Server Error` | `{"error": "..."}` |

**Example Requests:**

```bash
# Search for reports containing "DR-001"
curl "http://localhost:3002/api/v1/searchDeathReport?searchQuery=DR-001"

# Search for reports in ICU department
curl "http://localhost:3002/api/v1/searchDeathReport?searchQuery=ICU"

# Empty search returns all reports
curl "http://localhost:3002/api/v1/searchDeathReport"
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| `400 Bad Request` | Invalid request body or missing required fields | `{"error": "A bad request was sent"}` |
| `404 Not Found` | Report ID does not exist (update only) | `{"error": "..."}` |
| `500 Internal Server Error` | Server/database error | `{"error": "database query error: ..."}` |

---

## Frontend Implementation Notes

### Form Structure

A death report form should be organized into logical sections:

1. **Basic Information**
   - Reference (`ref`)
   - Reported Date (`reportedDate`)
   - Incident Date (`incidentDate`)
   - Incident Time (`incidentTime`)
   - Department (`department`)
   - Location (`location`)
   - Category (`category`)
   - Sub Category (`subCategory`)

2. **Incident Details**
   - Description (`description`) — textarea
   - Action Taken (`actionTaken`) — textarea
   - Opened Date (`openedDate`)
   - Submitted Time (`submittedTime`)
   - Handler (`handler`)
   - Manager (`manager`)
   - Specialty (`specialty`)
   - Exact Location (`exactLocation`)
   - Coding (`coding`)
   - Type (`type`)

3. **Risk & Outcome Assessment**
   - Risk Grading (`riskGrading`) — select: Low, Medium, High, Critical
   - Result (`result`) — text
   - Actual Harm (`actualHarm`) — text
   - Potential Harm (`potentialHarm`) — text
   - Details (`details`) — textarea

4. **Patient & Family Communication**
   - Patient Involved (`patientInvolved`) — checkbox
   - Patient Told (`patientTold`) — checkbox
   - Family Told (`familyTold`) — checkbox
   - What Family Told (`whatFamilyTold`) — textarea

5. **Investigation & Review**
   - Incident Investigation (`incidentInvestigation`) — textarea
   - Review Meeting Date (`reviewMeetingDate`)
   - Quality Assurance Lead (`qualityAssuranceLead`)
   - Doctor Notified (`doctorNotified`) — checkbox
   - Meeting Discussion Points (`meetingDiscussionPoints`) — textarea
   - Meeting Action Points (`meetingActionPoints`) — textarea
   - Level of Investigation (`levelOfInvestigation`) — select: Level 1, Level 2, Level 3, Comprehensive

### Validation Rules

| Rule | Fields |
|------|--------|
| Required (server will reject if missing) | `ref`, `reportedDate`, `incidentDate`, `incidentTime`, `department`, `location`, `category`, `subCategory`, `description`, `actionTaken` |
| Date format | YYYY-MM-DD (e.g., `2026-07-29`) |
| Time format | 24h HH:MM (e.g., `14:30`) |
| Booleans | `true` / `false` |
| For update: `id` is required | `id` |

### CORS

The API is configured to accept requests from origins specified in the server's `ORIGINS` environment variable. If you encounter CORS errors during development, check the `.env` file or ask the backend team to add your frontend origin.

---

## Testing

The following curl commands can be used to verify the API is working:

```bash
# Health check
curl http://localhost:3002/api/v1/ping

# Create a death report
curl -X POST http://localhost:3002/api/v1/deathreport \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "DR-TEST-001",
    "reportedDate": "2026-08-03",
    "incidentDate": "2026-08-02",
    "incidentTime": "10:00",
    "department": "IT",
    "location": "Server Room",
    "category": "Mortality",
    "subCategory": "Unexpected death",
    "description": "Test description",
    "actionTaken": "Test action taken"
  }'

# Get all reports
curl "http://localhost:3002/api/v1/deathreports?page=1&limit=10"

# Search reports
curl "http://localhost:3002/api/v1/searchDeathReport?searchQuery=IT"
```

---

## Related Files

| File | Purpose |
|------|---------|
| `cmd/routes.go` | Route registration |
| `cmd/deathreport.go` | Death report handlers |
| `cmd/types.go` | Response types (`PaginatedDeathReportResponse`) |
| `internal/db/deathreporting.go` | Death report database model and queries |
| `tables.sql` | Database schema for `death_reports` table |
