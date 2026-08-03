# Death Report

A production-ready death reporting system built with Next.js 16, designed for hospital mortality and safety incident reporting and tracking.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Roles & Permissions](#roles--permissions)
- [Navigation](#navigation)
- [Death Report Data Structure](#death-report-data-structure)
- [Components](#components)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Features

- **Death Reporting**: Multi-step public form for submitting hospital death reports following an incident or treatment episode
- **Death Report Management**: View, search, and filter death reports via dashboard with pagination and real-time search
- **User Authentication**: JWT-based login/logout with token persistence
- **User Management**: Register new users (Admin+), enable/disable accounts (Super Admin)
- **Password Override**: Administrative password reset (Super Admin only)
- **Role-Based Access**: Four-tier role system (Reporter, Supervisor, Admin, Super Admin)
- **Risk Grading**: Color-coded badges (Critical, High, Medium, Low)
- **Analytics & Charts**: Risk grading, department, and category breakdowns with interactive charts
- **Pagination**: Efficient death report list browsing
- **Responsive Design**: Mobile-friendly sidebar and layouts
- **Dark Mode**: Theme support via `next-themes`
- **Toast Notifications**: Success/error feedback via `sonner`
- **Draft Autosave**: Form progress is automatically saved and can be resumed
- **TanStack Query**: All data fetching uses `@tanstack/react-query` for caching and refetching

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.2.7 |
| UI Library | React 19.2.4 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui 4.10.0, Radix UI 1.4.3 |
| Icons | Lucide React |
| Animations | Framer Motion |
| Notifications | Sonner |
| Themes | next-themes |

## Project Structure

```
deathreport/
├── .env                          # Environment variables (API URL)
├── .gitignore
├── AGENTS.md                     # AI agent guidelines
├── README.md                     # This file
├── docker-compose.yml            # Docker Compose for local deployment
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json
├── postcss.config.mjs            # PostCSS/Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
│
├── app/
│   ├── favicon.ico
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout (HTML shell + Toaster)
│   ├── page.tsx                  # PUBLIC: Multi-step death reporting form
│   │
│   ├── (auth)/
│   │   ├── layout.tsx            # Auth layout (centered card wrapper)
│   │   └── login/
│   │       └── page.tsx          # Login page (email/password, JWT)
│   │
│   └── (dashboard)/
│       ├── layout.tsx            # Dashboard layout (sidebar + auth guard)
│       ├── types/
│       │   └── navTypes.ts       # NavigationItem type definitions
│       └── dashboard/
│           ├── page.tsx          # Death report overview with analytics and charts
│           ├── DeathReportOverviewCharts.tsx # Chart components for analytics
│           ├── StatTile.tsx      # Reusable KPI stat tile component
│           ├── death-reports/
│           │   ├── page.tsx      # Death report list with search and filters
│           │   ├── DeathReportTable.tsx # Death report table component
│           │   └── DeathReportDetails.tsx # Death report detail dialog
│           ├── register/page.tsx # User registration (Admin+ only)
│           ├── users/page.tsx    # User search/enable-disable (Super Admin)
│           └── resetpassword/page.tsx # Password override (Super Admin)
│
├── components/
│   └── ui/
│       ├── alert.tsx            # Alert, AlertTitle, AlertDescription, AlertAction
│       ├── button.tsx           # Button with variants and sizes
│       ├── card.tsx             # Card, CardHeader, CardContent, CardFooter
│       ├── dialog.tsx           # Dialog, DialogContent, DialogHeader
│       ├── input.tsx            # Input field
│       ├── label.tsx            # Form label (Radix-based)
│       ├── select.tsx           # Select, SelectTrigger, SelectContent, SelectItem
│       ├── sonner.tsx           # Themed toast notifications
│       ├── table.tsx            # Table, TableHeader, TableBody, TableRow
│       └── textarea.tsx         # Multi-line text input
│
├── lib/
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
└── public/
    ├── images/
    │   └── rhv logo.png
    └── ...static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
cd incidenttracker
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_apiurl=http://localhost:3001/api/v1
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_apiurl` | Base URL of the backend API | Yes |

> **Note**: The `NEXT_PUBLIC_` prefix exposes the variable to the browser. Do not put sensitive server-only secrets here.

## Authentication

The application uses JWT token-based authentication:

1. User logs in via `/login` with email and password
2. Server returns `{ token, user }`
3. Token and user data are stored in `localStorage`
4. Subsequent API requests include `Authorization: Bearer ${token}` header
5. On 401 responses, token is cleared and user is redirected to `/login`

### Token Storage

```typescript
// Storing after login
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));

// Retrieving for API calls
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");
```

## API Integration

### Base URL

All API calls use the configured base URL:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_apiurl;
```

### Endpoints

### Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | Authenticate user, returns `{ token, user }` |
| POST | `/auth/register` | Yes (Admin+) | Register new user |
| POST | `/deathreport` | No | Create new death report (public endpoint) |
| PUT | `/deathreport` | No | Update an existing death report (public endpoint) |
| GET | `/deathreports?page=N&limit=10` | Yes | Fetch paginated death report list (returns `{ deathReports: { data, pagination } }`) |
| GET | `/searchDeathReport?searchQuery=...` | Yes | Search death reports (returns `{ deathReports: [...] }`) |
| GET | `/user?email={email}` | Yes (Super Admin) | Search user by email |
| PUT | `/auth/enable` | Yes (Super Admin) | Enable user account |
| PUT | `/auth/disable` | Yes (Super Admin) | Disable user account |
| PUT | `/auth/resetpassword` | Yes (Super Admin) | Reset user password |

### Request Headers

```typescript
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
```

### Example API Call

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_apiurl}/deathreports?page=1&limit=10`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

if (!response.ok) {
  if (response.status === 401) {
    localStorage.removeItem("token");
    router.push("/login");
  }
  throw new Error("Failed to fetch death reports");
}

const data = await response.json();
```

## Roles & Permissions

| Feature | Reporter | Supervisor | Admin | Super Admin |
|---------|----------|------------|-------|-------------|
| Submit death reports (public) | Yes | Yes | Yes | Yes |
| View dashboard (overview + list) | Yes | Yes | Yes | Yes |
| Search death reports | Yes | Yes | Yes | Yes |
| Register new users | No | No | Yes | Yes |
| Manage users (enable/disable) | No | No | No | Yes |
| Reset user passwords | No | No | No | Yes |

### Checking Roles

```typescript
const user = JSON.parse(localStorage.getItem("user") || "{}");

// Check for Super Admin
if (user.role === "superadmin") {
  // Show Super Admin features
}

// Check for Admin or above
if (user.role === "admin" || user.role === "superadmin") {
  // Show Admin features
}
```

## Navigation

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Multi-step death reporting form (public, no auth) |
| `/login` | Authentication page |

### Protected Routes (Dashboard)

| Route | Access | Description |
|-------|--------|-------------|
| `/dashboard` | All authenticated users | Death report overview with analytics, KPI tiles, and charts |
| `/dashboard/death-reports` | All authenticated users | Death report list with search, filters, and detail dialog |
| `/dashboard/register` | Admin+ | User registration form |
| `/dashboard/users` | Super Admin | User search and status management |
| `/dashboard/resetpassword` | Super Admin | Password override |

### Sidebar Navigation

The dashboard features a collapsible sidebar with:
- **All users**: Overview, View Death Reports, Report a Death
- **Super Admin only**: Add User, Users, Reset Password
- **Logout** button
- Mobile-responsive hamburger menu

## Death Report Data Structure

### Death Report Interface

```typescript
export interface DeathReport {
  id: number;
  ref: string;
  reportedDate: string;
  incidentDate: string;
  incidentTime: string;
  department: string;
  location: string;
  category: string;
  subCategory: string;
  description: string;
  actionTaken: string;
  openedDate?: string;
  submittedTime?: string;
  handler?: string;
  manager?: string;
  specialty?: string;
  exactLocation?: string;
  coding?: string;
  type?: string;
  riskGrading?: "Low" | "Medium" | "High" | "Critical";
  result?: string;
  actualHarm?: string;
  potentialHarm?: string;
  details?: string;
  patientInvolved: boolean;
  patientTold: boolean;
  familyTold: boolean;
  whatFamilyTold?: string;
  incidentInvestigation?: string;
  reviewMeetingDate?: string;
  qualityAssuranceLead?: string;
  doctorNotified: boolean;
  meetingDiscussionPoints?: string;
  meetingActionPoints?: string;
  levelOfInvestigation?: "Level 1" | "Level 2" | "Level 3" | "Comprehensive";
}
```

### Risk Grading Levels

| Level | Color |
|-------|-------|
| Critical | Red |
| High | Orange |
| Medium | Amber |
| Low | Blue |

## Components

### UI Components (shadcn/ui)

All components are in `components/ui/`:

| Component | Exports |
|-----------|---------|
| `Button` | `Button` with `variant="default|outline|destructive|ghost|link"` and `size="sm|default|lg|icon"` |
| `Input` | Standard input with focus/disabled states |
| `Label` | Radix-based form labels |
| `Textarea` | Multi-line text input |
| `Select` | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectValue`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` |
| `Card` | `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` |
| `Dialog` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogTrigger`, `DialogOverlay`, `DialogPortal`, `DialogClose` |
| `Alert` | `Alert`, `AlertTitle`, `AlertDescription` (uses `variant="default|destructive"`) |
| `Table` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`, `TableCaption` |
| `Toaster` | Themed toast notifications via `sonner` |

### Form Patterns

```typescript
"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function FormComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_apiurl}/deathreport`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Request failed");

      toast.success("Death report submitted");
      resetForm();
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setIsLoading(false);
    }
  };
}
```

## Dashboard Components

### DeathReportDetails Modal

The death report details dialog displays comprehensive death report information in a tabbed layout.

**Features:**
- **Header Section**: Shows report ID, reference number, department, and risk grading badge
- **Left Sidebar**: Dates & timing, location details, handlers, and risk & outcome assessment
- **Right Content Area**:
  - **Incident Details**: Description, action taken, and additional details
  - **Patient & Family Communication**: Boolean flags for patient/family/doctor notification
  - **Investigation & Review**: Investigation notes, review meeting date, QA lead, meeting points
  - **Submitted Info**: Submission timestamp

**Props:** See `app/(dashboard)/dashboard/death-reports/DeathReportDetails.tsx` for full interface

### DeathReportOverviewCharts

Interactive charts for the dashboard overview, built with recharts:
- `DeathReportsTrendChart` — daily death report counts (area chart)
- `RiskGradingChart` — risk grading distribution (bar chart)
- `TopBreakdownChart` — top departments or categories (bar chart)

All charts render empty states when no data is available.

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

### TypeScript Configuration

- Strict mode enabled
- Path alias: `@/*` maps to `./*`
- Target: ES2017
- Module resolution: bundler

### Code Conventions

- Use `"use client"` directive for components with hooks
- Destructure props at the top level
- Use `cn()` from `@/lib/utils` for conditional classNames
- Use `React.ComponentType<{ className?: string }>` for icon prop types
- Handle 401 responses by clearing storage and redirecting to `/login`

### Adding New Pages

1. Create a new directory in `app/` with the route name
2. Add a `page.tsx` file with the `"use client"` directive
3. Export a default function component
4. Add auth checks in `useEffect` if the route is protected

## Troubleshooting

### Common Issues

**API calls failing with CORS**
- Ensure the backend API allows requests from your frontend origin
- Check that `NEXT_PUBLIC_apiurl` is correctly set

**Authentication not persisting**
- Verify `localStorage` is available (not in SSR context)
- Check that the token is being stored correctly after login

**Dashboard redirecting to login**
- Clear browser localStorage and try again
- Verify the backend is returning a valid token

**Death reports not loading**
- Ensure the backend is running on `http://localhost:3002`
- Verify `NEXT_PUBLIC_apiurl=http://localhost:3002/api/v1` in `.env`
- The death report API endpoints (`/deathreport`, `/deathreports`, `/searchDeathReport`) are public and do not require authentication

**Styles not applying**
- Ensure `globals.css` is imported in `app/layout.tsx`
- Check that Tailwind CSS is properly configured in `postcss.config.mjs`

### Build Errors

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
