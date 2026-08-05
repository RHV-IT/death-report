<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Death Report Agent Guidelines

## Project Overview

Death Report is a Next.js 16 application for hospital death reporting and safety incident tracking. It uses a custom App Router structure with route groups for authentication and protected dashboard routes.

## Project Structure

```
deathreport/
├── .env                          # Environment variables (API URL)
├── AGENTS.md                     # AI agent guidelines
├── README.md                     # Project documentation
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
│           ├── DeathReportOverviewCharts.tsx # Chart components
│           ├── StatTile.tsx      # Reusable KPI stat tile component
│           ├── death-reports/
│           │   ├── page.tsx      # Death report list with search and filters
│           │   ├── DeathReportTable.tsx
│           │   └── DeathReportDetails.tsx
│           ├── register/page.tsx # User registration (Admin+ only)
│           ├── users/page.tsx    # User search/enable-disable (Super Admin)
│           └── resetpassword/page.tsx # Password override (Super Admin)
│
├── components/
│   └── ui/
│       ├── alert.tsx            # Alert, AlertTitle, AlertDescription
│       ├── button.tsx           # Button with variants and sizes
│       ├── card.tsx             # Card, CardHeader, CardContent, CardFooter
│       ├── dialog.tsx           # Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
│       ├── input.tsx            # Input field
│       ├── label.tsx            # Form label (Radix-based)
│       ├── select.tsx           # Select components with scroll buttons
│       ├── sonner.tsx           # Themed toast notifications
│       ├── table.tsx            # Table, TableHeader, TableBody, TableRow, TableHead, TableCell
│       └── textarea.tsx         # Multi-line text input
│
├── lib/
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
└── public/
    └── images/
        └── rhv logo.png
```

## Code Conventions

### File Naming
- Use `page.tsx` for route components
- Use `layout.tsx` for layout components
- Type definition files: `types/` directory with `PascalCase.ts` files

### React Patterns
- Use `"use client"` directive for client components
- Use `React.ComponentType<{ className?: string }>` for icon types
- Destructure props at the top level of components
- Use `cn()` helper from `@/lib/utils` for conditional className

### Styling
- Tailwind CSS 4 with CSS variables
- Dark mode support via `next-themes`
- Component variants: `"default" | "ghost"` for buttons
- Severity badges: critical (red), major (orange), minor (blue), near miss (gray)
- Status badges: resolved (emerald), inprogress (amber), unresolved (rose)

## Authentication & Authorization

### Token Management
- Token stored in `localStorage.getItem("token")`
- User data stored in `localStorage.getItem("user")`
- Always check for token before API calls
- Remove token and redirect to `/login` on 401 responses

### Role-Based Access
| Role | Dashboard | Register | Users | Reset Password |
|------|-----------|----------|-------|----------------|
| Reporter | ✓ | ✗ | ✗ | ✗ |
| Supervisor | ✓ | ✗ | ✗ | ✗ |
| Admin | ✓ | ✓ | ✗ | ✗ |
| Super Admin | ✓ | ✓ | ✓ | ✓ |

Check role via `user.role === "superadmin"` for Super Admin features.

### Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_apiurl=http://localhost:3002/api/v1
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_apiurl` | Base URL of the backend API | Yes |

> **Note**: The `NEXT_PUBLIC_` prefix exposes the variable to the browser. Do not put sensitive server-only secrets here.

## API Integration

### Environment
- Base URL: `process.env.NEXT_PUBLIC_apiurl` (defined in `.env`)
- Example: `http://192.168.9.227:3002/api/v1`

### Endpoints
- `POST /deathreport` - Create new death report (no auth required)
- `PUT /deathreport` - Update an existing death report (no auth required)
- `GET /deathreports?page=${page}&limit=10` - Paginated death report list
- `GET /searchDeathReport?searchQuery=${query}` - Search death reports
- `GET /searchDeathReport?searchQuery=${query}&dateFrom=${from}&dateTo=${to}` - Search death reports bounded by `reported_date` (both date params required)
- `GET /user?email=${email}` - Search user by email (Super Admin)
- `PUT /auth/enable` - Enable user account
- `PUT /auth/disable` - Disable user account
- `PUT /auth/resetpassword` - Reset user password

### Headers
```typescript
{
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
}
```

## Data Structures

### Incident Report Interface

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

## Component Usage

### Dashboard Components

#### DeathReportDetails Modal
The death report details dialog displays comprehensive death report information. Located at `app/(dashboard)/dashboard/death-reports/DeathReportDetails.tsx`.

**Features:**
- **Header Section**: Shows report ID (#`{report.id}`), reference number, department, and risk grading badge
- **Left Sidebar**: Dates & timing, location details, handlers, and risk & outcome assessment
- **Right Content Area**:
  - Incident Details section (description, action taken, additional details)
  - Patient & Family Communication (boolean flags for patient/family/doctor notification)
  - Investigation & Review section (investigation notes, meeting details, QA lead)

**Props Interface:**
```typescript
interface DeathReportDetailsProps {
  report: DeathReport | null;
  onClose: () => void;
}
```

#### DeathReportTable
The death report table component for paginated list browsing. Located at `app/(dashboard)/dashboard/death-reports/DeathReportTable.tsx`.

**Columns:** Ref, Date, Department, Category, Risk, Patient, Actions

**Props Interface:**
```typescript
interface DeathReportTableProps {
  reports: DeathReport[];
  loading: boolean;
  pagination: DeathReportPagination | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewReport: (report: DeathReport) => void;
}
```

#### DeathReportOverviewCharts
Interactive charts for the dashboard overview page, using recharts:
- `DeathReportsTrendChart` — daily death report counts (area chart)
- `RiskGradingChart` — risk grading distribution (bar chart)
- `TopBreakdownChart` — top departments or categories (bar chart)

#### StatTile
Reusable KPI stat tile showing a label, value, and icon with color-coded tone. Located at `app/(dashboard)/dashboard/StatTile.tsx`.

### UI Components (shadcn/ui)
- `Button` - Use `variant="default|outline|destructive|ghost|link"` and `size="sm|lg|icon"`
- `Input` - Standard form input with focus/disabled states
- `Label` - Radix-based form labels
- `Textarea` - Multi-line text input
- `Select` - `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectValue`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`
- `Card` - Container with `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`
- `Dialog` - Modal with `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogTrigger`, `DialogOverlay`, `DialogPortal`, `DialogClose`
- `Alert` - Error/success messages with `AlertTitle`, `AlertDescription`
- `Table` - Data display with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`, `TableCaption`

### Framer Motion
- Use `motion.div`, `motion.button` for animations
- Variants pattern for staggered animations
- `whileTap` for button press effects

## State Management

### Local State
- Use `useState` for form inputs and UI state
- Use `useEffect` for authentication checks and data fetching
- Store pagination state separately from data

### Form Handling
- Reset forms on successful submission
- Clear error messages after 5 seconds
- Disable submit button during loading

## Error Handling

### Toaster Notifications
- Use `toast.success()` for success messages
- Use `toast.error()` for error messages
- Include specific error text from API responses

### Loading States
- Show loading indicators during API calls
- Use `Loader2` icon with `animate-spin`
- Disable buttons during submission

## Build & Quality

### Commands
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint check
```

### TypeScript
- Strict mode enabled
- Path alias: `@/*` maps to `./`
- Check types before building

## File Patterns

### Page Component Template
```typescript
"use client";
import { useState, useEffect } from "react";
// ... other imports

export default function PageName() {
  const [state, setState] = useState(...);
  const router = useRouter();

  useEffect(() => {
    // Auth check, data fetch
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Content */}
    </div>
  );
}
```

### API Call Pattern
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_apiurl}/endpoint`, {
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
  throw new Error("Error message");
}
```

## DOs and DON'Ts

### DO
- Always use `"use client"` for components with hooks
- Check authentication before protected routes
- Use `process.env.NEXT_PUBLIC_apiurl` for API base
- Handle 401 responses by clearing storage and redirecting
- Use `cn()` for conditional classNames
- Add proper accessibility attributes (aria-label, title)

### DON'T
- Don't modify files in `node_modules/`
- Don't commit `.env` files with secrets
- Don't use `any` type - use proper TypeScript interfaces
- Don't mutate state directly - use setter functions
- Don't leave console.log statements in production code
