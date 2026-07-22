# Campus Placement Management System

A comprehensive, full-stack web application designed to streamline the campus placement process for universities, students, and recruiters.

## Features

- **Role-Based Access Control**: Dedicated portals for Administrators, Students, and Companies.
- **Student Dashboard**: 
  - Build and manage professional profiles.
  - Track academic progress and CGPA.
  - Browse and apply for active job drives.
  - Track application statuses and interview schedules.
- **Company/Recruiter Dashboard**: 
  - Post new job opportunities and internship drives.
  - Review student applications and filter by eligibility criteria.
  - Schedule and manage interviews.
- **Admin Dashboard**: 
  - Oversee the entire placement process.
  - Manage student records, departments, and recruiting companies.
  - Approve job postings and coordinate placement schedules.
  - Generate placement statistics and reports.
- **Real-Time Data**: Seamlessly tracks applications, jobs, and interviews using a unified database.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: Local JSON-based persistent storage (with structured support for Firebase Firestore).
- **Authentication**: Custom Auth with role-based routing (Firebase Auth integration available).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Environment Setup:
   - Copy `.env.example` to `.env`
   - Set up your variables (e.g., `USE_FIRESTORE=false` for local storage).

### Development

To start the local development server (both frontend and backend):

```bash
npm run dev
```

The application will be available on port 3000.

### Building for Production

To build the application for deployment:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Structure

- `/src/`: Frontend React Application
  - `/src/components`: Reusable React components grouped by feature (Admin, Student, Company).
  - `/src/services`: External integrations (e.g., Firebase, Gmail).
- `/server/`: Backend Node.js/Express application
  - `/server/index.ts`: Express backend entry point and API definitions.
  - `/server/db.ts`: Database abstraction layer (handles local JSON or cloud persistence).
