import { createBrowserRouter } from "react-router-dom";

import App from "../App.jsx";
import LoginPage from "../pages/login/LoginPage.jsx";
import AppLayout from "../common/layouts/AppLayout.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";

// =========================
// Token Management
// =========================
import TokenPage from "../pages/onboard/TokenPage.jsx";
import OnboardTokenPage from "../pages/onboard/OnboardTokenPage.jsx";
import TokenReportsPage from "../pages/onboard/TokenReportsPage.jsx";

// =========================
// Transaction Management
// =========================
import TransactionPage from "../pages/transaction/TransactionPage.jsx";
import CreateTransactionPage from "../pages/transaction/CreateTransactionPage.jsx";
import DailyTransactionPage from "../pages/transaction/DailyTransactionPage.jsx";
import TransactionReportsPage from "../pages/transaction/TransactionReportsPage.jsx";

// =========================
// User Management
// =========================
import UserManagementPage from "../pages/user-management/UserManagementPage.jsx";
import CreateUserPage from "../pages/user-management/CreateUserPage.jsx";
import ReportsPage from "../pages/user-management/ReportsPage.jsx";

// =========================
// General Reporting
// =========================
import ReportingPage from "../pages/reporting/TransactionReportingPage.jsx";
import UserReportsPage from "../pages/reporting/UserReportsPage.jsx";
import PortfolioReportPage from "../pages/reporting/PortfolioReportPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",

    element: <App />,

    children: [
      // =========================
      // Login
      // =========================
      {
        index: true,
        element: <LoginPage />,
      },

      // =========================
      // Application Layout
      // =========================
      {
        element: <AppLayout />,

        children: [
          // =========================
          // Dashboard
          // =========================
          {
            path: "dashboard",
            element: <DashboardPage />,
          },

          // =========================
          // Token Management
          // =========================
          {
            path: "tokens",
            element: <TokenPage />,
          },

          {
            path: "tokens/onboard",
            element: <OnboardTokenPage />,
          },

          {
            path: "token-reports",
            element: <TokenReportsPage />,
          },

          // =========================
          // Transaction Management
          // =========================
          {
            path: "transactions",
            element: <TransactionPage />,
          },

          {
            path: "transactions/create",
            element: <CreateTransactionPage />,
          },

          // Daily Transactions
          {
            path: "transactions/daily",
            element: <DailyTransactionPage />,
          },

          // Transaction Reports
          {
            path: "transactions/reports",
            element: <TransactionReportsPage />,
          },

          // =========================
          // User Management
          // =========================
          {
            path: "users",
            element: <UserManagementPage />,
          },

          {
            path: "users/create",
            element: <CreateUserPage />,
          },

          {
            path: "users/reports",
            element: <ReportsPage />,
          },

          // =========================
          // General Reporting
          // =========================
          {
            path: "reporting",
            element: <ReportingPage />,
          },

          {
            path: "user-reports",
            element: <UserReportsPage />,
          },

          {
            path: "portfolio-report",
            element: <PortfolioReportPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
