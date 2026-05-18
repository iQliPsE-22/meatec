# Meatec Dashboard

A modern, responsive task management dashboard built with Next.js, Ant Design, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd meatec
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

4. **Available Scripts:**
   - `npm run dev`: Starts the development server.
   - `npm run build`: Builds the application for production.
   - `npm run start`: Starts the production server.
   - `npm run lint`: Runs ESLint to check for code quality issues.
   - `npm run test`: Runs unit tests using Vitest.
   - `npm run test:coverage`: Runs tests and generates a coverage report.

## 🛠️ How Mocking Works

This project uses a custom in-memory/localStorage-based mocking system to simulate a backend API without requiring a real server.

### Mock API (`lib/mock-api.ts`)
- Implements a `mockApiFetch` function that mimics the standard `fetch` API.
- Simulates network latency with a configurable delay.
- Supports endpoints for:
    - `POST /login`: Validates demo credentials.
    - `GET /tasks`: Returns the list of tasks.
    - `POST /tasks`: Creates a new task with validation.
    - `PUT /tasks/:id`: Updates an existing task.
    - `DELETE /tasks/:id`: Removes a task.

### Persistent Storage (`lib/storage.ts`)
- Uses `localStorage` to persist the state (tasks, session, theme) across page reloads.
- Automatically initializes with default "seed" tasks if no data is found.

### State Management (`lib/app-state.tsx`)
- A React Context provider (`AppStateProvider`) orchestrates the interactions between the UI and the mock API.
- It handles loading states, error reporting, and optimistic UI updates.

## 📁 Project Structure

```text
meatec/
├── app/                  # Next.js App Router (pages and layouts)
│   ├── dashboard/        # Main dashboard view
│   ├── login/            # Authentication screen
│   └── layout.tsx        # Root layout with Ant Design registry
├── components/           # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components (charts, cards, nav)
│   ├── ui/               # Base UI primitives (e.g., SurfaceCard)
│   └── *.tsx             # Global components (modals, forms)
├── lib/                  # Core logic and utilities
│   ├── app-state.tsx     # Global state management context
│   ├── mock-api.ts       # Mock API implementation
│   ├── storage.ts        # LocalStorage persistence layer
│   └── constants.ts      # Shared constants and configuration
├── types/                # TypeScript definitions
├── public/               # Static assets
└── tests/                # Unit and integration tests
```

## 📚 Libraries Used

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Components:** [Ant Design](https://ant.design/) (v6)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Icons:** [@ant-design/icons](https://ant.design/components/icon)
- **Forms:** [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup)
- **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Utilities:** `clsx`, `tailwind-merge`

## 🔑 Demo Credentials

- **Username:** `test`
- **Password:** `test123`
