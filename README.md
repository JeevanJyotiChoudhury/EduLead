# EduLead - Admission Lead Management System

EduLead is a web-based Admission Lead Management System designed to help educational institutions manage admission enquiries from initial lead creation through follow-up and conversion.

The system supports lead lifecycle management, counsellor assignment, follow-up tracking, ageing visibility, role-based access, and management-level reporting.

---

## 1. Problem Understanding

Educational institutions receive admission enquiries from multiple channels such as:

- Website
- Walk-ins
- Phone calls
- WhatsApp
- Education fairs
- Marketing campaigns
- Other sources

Without a centralized system, it becomes difficult to track:

- Where a lead came from
- Which counsellor owns the lead
- The current status of the enquiry
- When the lead was last contacted
- When the next follow-up is due
- Which leads are becoming overdue
- Which leads have converted
- Overall admission pipeline performance

EduLead addresses these problems through a centralized lead management workflow.

---

## 2. Key Features

### Lead Management

- Create admission leads
- View all accessible leads
- Search leads by name, phone, or email
- Filter leads by status
- Filter leads by source
- View individual lead details
- Edit lead information
- Delete leads based on role permissions

### Lead Lifecycle

The supported lead statuses are:

1. New
2. Contacted
3. Interested
4. Follow Up
5. Converted
6. Not Interested

This provides a simple lifecycle from initial enquiry to final outcome.

### Lead Sources

Leads can originate from:

- Website
- Walk-in
- Phone
- WhatsApp
- Fair
- Campaign
- Other

### Counsellor Assignment

Managers can assign leads to counsellors.

This establishes clear ownership of admission enquiries.

### Follow-up Management

Counsellors can:

- Record follow-up activity
- Add notes
- Record an outcome
- Set the next follow-up date
- View follow-up history

### Dashboard

The dashboard provides visibility into:

- Total leads
- New leads
- Follow-ups
- Converted leads
- Overdue follow-ups
- Conversion rate
- Leads by status
- Leads by source
- Lead ageing
- Recent leads

### Role-based Access

Two roles are supported:

#### Manager

Managers can:

- View leads
- Create leads
- Edit leads
- Assign counsellors
- Delete leads
- View management-level dashboard information

#### Counsellor

Counsellors can:

- View assigned leads
- Update assigned leads
- Add follow-ups
- View follow-up history

Counsellors cannot assign leads or delete leads.

---

## 3. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- bcryptjs

### Development

- Git
- npm
- MongoDB Atlas

---

## 4. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │ Manager / Counsellor│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Frontend  │
                    │                     │
                    │ Dashboard           │
                    │ Leads               │
                    │ Lead Details        │
                    │ Follow-ups          │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │                     │
                    │ Auth                │
                    │ Lead APIs           │
                    │ Follow-up APIs      │
                    │ Authorization       │
                    └──────────┬──────────┘
                               │
                          Mongoose ODM
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │                     │
                    │ Users               │
                    │ Leads               │
                    │ FollowUps           │
                    └─────────────────────┘
```

The frontend is responsible for the user interface and user interactions.

The backend handles authentication, authorization, business logic, validation, and database operations.

MongoDB stores users, leads, and follow-up records.

---

## 5. Project Structure

```text
edulead/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── leadController.js
│   │   │   └── followUpController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Lead.js
│   │   │   └── FollowUp.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   └── followUpRoutes.js
│   │   │
│   │   ├── seed.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   └── Header.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   └── (authenticated)/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       └── leads/
│   │           ├── page.tsx
│   │           ├── new/
│   │           │   └── page.tsx
│   │           └── [id]/
│   │               └── page.tsx
│   │
│   └── package.json
│
└── README.md
```

---

## 6. Database Design

### User

```text
User
-------------------------
_id
name
email
password
role
createdAt
updatedAt
```

Roles:

```text
MANAGER
COUNSELLOR
```

---

### Lead

```text
Lead
-------------------------
_id
name
phone
email
coursePreference
source
status
assignedCounsellor
notes
lastContactedAt
nextFollowUpDate
createdAt
updatedAt
```

The phone number is used as a duplicate check to reduce accidental duplicate admission leads.

---

### FollowUp

```text
FollowUp
-------------------------
_id
lead
counsellor
date
notes
outcome
nextFollowUpDate
createdAt
updatedAt
```

A separate FollowUp collection was used instead of storing all follow-up history directly inside the Lead document.

This allows the system to maintain a history of interactions with a lead.

---

## 7. API Design

### Authentication

#### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "manager@edulead.com",
  "password": "Password@123"
}
```

The API returns a JWT token and user information.

---

### Leads

#### Get Leads

```http
GET /api/leads
```

Supports filtering/searching through query parameters.

Examples:

```text
/api/leads?status=NEW
/api/leads?source=WEBSITE
/api/leads?search=rahul
```

---

#### Create Lead

```http
POST /api/leads
```

---

#### Get Lead

```http
GET /api/leads/:id
```

---

#### Update Lead

```http
PUT /api/leads/:id
```

---

#### Delete Lead

```http
DELETE /api/leads/:id
```

Manager access is required.

---

#### Get Counsellors

```http
GET /api/leads/counsellors
```

---

#### Assign Counsellor

```http
PUT /api/leads/:id/assign
```

Manager access is required.

---

### Follow-ups

#### Add Follow-up

```http
POST /api/leads/:leadId/followups
```

---

#### Get Follow-up History

```http
GET /api/leads/:leadId/followups
```

---

## 8. Authentication and Authorization

The application uses JWT-based authentication.

After successful login:

1. Backend validates email and password.
2. Password is checked using bcrypt.
3. Backend generates a JWT.
4. Frontend stores the token.
5. The token is sent in the `Authorization` header for protected API requests.

Example:

```http
Authorization: Bearer <token>
```

Backend middleware validates the token before allowing access to protected routes.

Role-based authorization is enforced on sensitive operations such as:

- Lead assignment
- Lead deletion

The backend is treated as the source of truth for authorization rather than relying only on frontend UI restrictions.

---

## 9. Business Rules

### Duplicate Leads

A lead with an existing phone number cannot be created again.

This prevents duplicate admission enquiries from entering the system.

### Counsellor Ownership

Counsellors should only work with leads assigned to them.

### Manager Assignment

Only managers can assign leads to counsellors.

### Lead Deletion

Only managers can delete leads.

### Follow-up

A lead can have multiple follow-up records.

The latest follow-up information is reflected on the Lead document through:

```text
lastContactedAt
nextFollowUpDate
```

### Overdue Follow-up

A follow-up is considered overdue when its next follow-up date is in the past and the lead has not reached a final outcome.

Final outcomes are:

```text
CONVERTED
NOT_INTERESTED
```

---

## 10. Lead Ageing

Lead ageing is calculated using the lead creation date.

The dashboard groups leads into:

```text
0-3 days
4-7 days
8-15 days
15+ days
```

This provides management visibility into leads that may require attention.

---

## 11. Assumptions

The following assumptions were made during implementation:

1. A phone number is sufficient for basic duplicate lead detection.
2. A lead belongs to one counsellor at a time.
3. A lead can have multiple follow-up records.
4. Managers have visibility across the admission pipeline.
5. Counsellors primarily work with leads assigned to them.
6. Conversion rate is calculated as:

```text
Converted Leads / Total Leads × 100
```

7. The prototype uses a fixed set of lead statuses and sources.
8. Email and phone verification are outside the scope of this prototype.
9. The application is designed as a prototype and does not implement production-grade notification services.

---

## 12. Edge Cases Considered

### Authentication

- Missing authentication token
- Invalid token
- Expired token
- Invalid login credentials

### Lead Validation

- Missing required fields
- Duplicate phone number
- Invalid lead ID
- Invalid counsellor ID

### Authorization

- Counsellor attempting manager-only actions
- Unauthorized lead access
- Unauthorized deletion
- Unauthorized assignment

### Follow-ups

- Missing follow-up date
- Missing follow-up notes
- Past follow-up dates
- Leads without scheduled follow-ups

### Dashboard

- Empty lead dataset
- Zero conversion rate
- No follow-ups
- No leads in a particular status/source
- Overdue follow-ups

---

## 13. Engineering Decisions

### Why Next.js?

Next.js provides a structured React application with routing and a good foundation for building the frontend quickly.

### Why Express.js?

Express provides a lightweight REST API layer and allowed the backend to be developed quickly for the prototype.

### Why MongoDB?

MongoDB was selected for development speed and flexibility.

### Why JWT?

JWT provides a simple stateless authentication mechanism suitable for this prototype.

### Why Separate FollowUp Collection?

Follow-up history is an important part of the admission workflow.

Keeping follow-ups separately allows multiple interactions to be stored without continuously growing the Lead document.

---

## 14. Trade-offs

### MongoDB vs Relational Database

MongoDB was selected for development speed and flexibility.

A relational database such as PostgreSQL could be considered for a larger production system where stronger relational constraints, complex reporting, and transactional workflows become more important.

### Simple JWT Authentication

The prototype uses JWT authentication.

A production implementation could additionally include:

- Refresh tokens
- Token rotation
- Secure HTTP-only cookies
- More detailed session management
- Password reset workflows

### Basic Dashboard

The dashboard focuses on the core metrics needed for admission lead management.

A production version could add:

- Date-range filtering
- Advanced analytics
- Counsellor performance reports
- Campaign ROI
- Conversion funnel analysis
- Export functionality

---

## 15. Validation Performed

### Manager

- Login
- Create lead
- Search lead
- Filter lead
- Edit lead
- Assign counsellor
- Add follow-up
- View follow-up history
- Delete lead
- Dashboard metrics

### Counsellor

- Login
- View assigned leads
- View lead details
- Update lead
- Add follow-up
- View follow-up history
- Verify restricted manager operations

### Edge Cases

- Duplicate phone number
- Invalid login
- Missing authentication
- Role-based restrictions
- Overdue follow-up
- Empty dashboard state

---

## 16. Running the Project

### Prerequisites

Install:

- Node.js
- npm
- MongoDB Atlas account or MongoDB instance

### Backend

Navigate to:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=<your-mongodb-connection-string>

JWT_SECRET=<your-jwt-secret>
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Seed Demo Users

```bash
npm run seed
```

### Frontend

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 17. Demo Credentials

### Manager

```text
Email: manager@edulead.com
Password: Password@123
```

### Counsellor

```text
Email: counsellor@edulead.com
Password: Password@123
```

These credentials are intended only for demonstration of the prototype.

---

## 18. Security Notes

Environment variables are used for sensitive configuration.

The MongoDB connection string and JWT secret should not be committed to the repository.

The `.env` file is excluded through `.gitignore`.

Passwords are hashed using bcrypt before being stored.

Protected APIs require a valid JWT.

Sensitive manager-only operations are authorized at the backend.

---

## 19. Future Improvements

If this system were developed further, possible improvements would include:

- Advanced role and permission management
- Email/SMS/WhatsApp follow-up notifications
- Automated reminders
- Bulk lead import
- Lead export
- Campaign tracking
- Counsellor performance analytics
- Advanced reporting
- Audit logs
- Activity timeline
- Pagination for large datasets
- Database indexing and query optimization
- Automated API and UI testing
- Production monitoring and logging

---

# 20. AI Usage Report

AI assistance was used during development primarily for planning, architecture discussions, implementation guidance, debugging, and reviewing edge cases.

### AI Tool Used

```text
ChatGPT
```

### What AI Was Asked

AI assistance was used for:

- Breaking the assignment into manageable implementation stages
- Designing the admission lead management workflow
- Defining entities and relationships
- Planning API endpoints
- Suggesting role-based authorization rules
- Designing dashboard metrics
- Identifying edge cases
- Debugging implementation issues
- Reviewing the overall solution
- Preparing documentation

### Example Useful Prompt

```text
Design a simple admission lead management system for an educational
institution using Next.js, Node.js, Express and MongoDB.

The system should support manager and counsellor roles, lead lifecycle
management, counsellor assignment, follow-ups, ageing, dashboard metrics,
authentication and role-based authorization.

Keep the implementation practical enough to build as a working prototype
within a limited development time.
```

### Code Generated or Suggested by AI

AI-assisted implementation guidance was used for areas including:

- Express route structure
- MongoDB/Mongoose models
- JWT authentication
- Authorization middleware
- Lead controller logic
- Follow-up APIs
- Dashboard calculations
- React/Next.js page structure
- Shared navigation/header structure

### Human Validation and Modification

AI-generated suggestions were manually integrated, reviewed, run locally, and tested against the actual API behavior.

The following areas were validated:

- MongoDB connectivity
- Login and JWT authentication
- Lead creation
- Lead retrieval
- Lead update
- Lead deletion
- Counsellor assignment
- Follow-up creation
- Follow-up history
- Role-based permissions
- Dashboard calculations

### AI Output Validation

The implementation was tested against the actual running application rather than relying only on generated code.

When implementation issues were encountered, they were identified through:

- Running the backend
- Calling APIs
- Checking API responses
- Testing frontend workflows
- Testing manager and counsellor permissions
- Checking the browser UI

Corrections were then made based on the observed application behavior.

### AI Usage Philosophy

AI was used as a development assistant for planning, implementation guidance, debugging, and documentation.

Final implementation decisions were based on the assignment requirements, application behavior, engineering trade-offs, and manual validation.

---

## 21. Conclusion

EduLead provides a focused admission lead management workflow covering the journey from lead creation to follow-up and conversion.

The prototype prioritizes:

- Clear lead ownership
- Simple lead lifecycle management
- Follow-up visibility
- Role-based access
- Management dashboard visibility
- Practical edge-case handling
- Maintainable separation between frontend, backend, and database layers

The implementation intentionally focuses on the core admission workflow rather than adding unnecessary complexity to the prototype.
