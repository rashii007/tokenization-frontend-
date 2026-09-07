import PropTypes from "prop-types";
import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  List,
  Plus,
  KeyRound,
  PieChart,
  Receipt,
  Users,
} from "lucide-react";

import "./Sidebar.css";
import logo from "../../assets/images/logo.png";
import RaastLogo from "../../assets/images/RaastLogo.png";
const NAV_GROUPS = [
  // =========================
  // DASHBOARD
  // =========================
  {
    id: "dashboard",
    title: null,
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  // =========================
  // OPERATIONS
  // =========================
  {
    id: "operations",
    title: "OPERATIONS",
    items: [
      // =========================
      // TOKEN
      // =========================
      {
        id: "token",
        label: "Tokens",
        icon: KeyRound,
        children: [
          {
            id: "token-all",
            label: "Modify Tokens",
            path: "/tokens",
            icon: List,
          },
          // {
          //   id: "token-add",
          //   label: "Add Token",
          //   path: "/tokens/onboard",
          //   icon: Plus,
          // },
          {
            id: "token-report",
            label: "Token Report",
            path: "/token-reports",
            icon: FileText,
          },
        ],
      },

      // =========================
      // TRANSACTION
      // =========================
      {
        id: "transaction",
        label: "Transaction",
        icon: Receipt,
        children: [
          {
            id: "transaction-all",
            label: "Transactions",
            path: "/transactions",
            icon: List,
          },
          // {
          //   id: "transaction-add",
          //   label: "Add Transaction",
          //   path: "/transactions/create",
          //   icon: Plus,
          // },
          {
            id: "transaction-daily",
            label: "Daily Transaction",
            path: "/transactions/daily",
            icon: CalendarDays,
          },
          {
            id: "transaction-report",
            label: "Transaction Reports",
            path: "/transactions/reports",
            icon: FileText,
          },
        ],
      },
    ],
  },

  // =========================
  // USER MANAGEMENT
  // =========================
  // {
  //   id: "user-management",
  //   title: "USER MANAGEMENT",
  //   items: [
  //     {
  //       id: "users",
  //       label: "User Management",
  //       icon: Users,
  //       children: [
  //         {
  //           id: "users-all",
  //           label: "Modify User",
  //           path: "/users",
  //           icon: List,
  //         },
  //         {
  //           id: "users-add",
  //           label: "Add User",
  //           path: "/users/create",
  //           icon: Plus,
  //         },
  //         {
  //           id: "users-reports",
  //           label: "User Reports",
  //           path: "/user-reports",
  //           icon: BarChart3,
  //         },
  //       ],
  //     },
  //   ],
  // },

  // =========================
  // ANALYTICS
  // =========================
  {
    id: "analytics",
    title: "ANALYTICS",
    items: [
      {
        id: "reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          {
            id: "reports-transaction",
            label: "Transaction Report",
            path: "/reporting",
            icon: FileText,
          },
          {
            id: "reports-token",
            label: "Token Report",
            path: "/token-reports",
            icon: Receipt,
          },
          // {
          //   id: "reports-user",
          //   label: "User Report",
          //   path: "/user-reports",
          //   icon: Users,
          // },
          // {
          //   id: "reports-portfolio",
          //   label: "Portfolio Report",
          //   path: "/portfolio-report",
          //   icon: PieChart,
          // },
        ],
      },
    ],
  },
];

export default function Sidebar({
  footerLabel,
  onNavigate,
  onClose,
  showClose,
}) {
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});

  const groups = useMemo(() => NAV_GROUPS, []);

  const iconClassName = (active) =>
    [
      "h-[18px] w-[18px]",
      active
        ? "text-[#00A651]"
        : "text-muted-foreground group-hover:text-[#00A651]",
    ]
      .filter(Boolean)
      .join(" ");

  const resolveClassName = ({ isActive }) =>
    [
      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
      "text-muted-foreground hover:bg-[#00A651]/10 hover:text-foreground",
      isActive ? "bg-[#00A651]/15 text-foreground" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const resolveSubClassName = ({ isActive }) =>
    [
      "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] transition",
      "text-muted-foreground hover:bg-[#00A651]/10 hover:text-foreground",
      isActive ? "bg-[#00A651]/10 text-foreground" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev?.[id],
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    onNavigate();
    navigate("/");
  };

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-card/60 px-3 py-4 text-[13px] backdrop-blur">
      {/* =========================
          LOGO
      ========================= */}
      <header className="relative flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={() => {
            onNavigate();
            navigate("/dashboard");
          }}
          className="flex items-center gap-3 rounded-xl border border-[#00A651]/20 bg-[#00A651]/5 px-2 py-1.5 text-left shadow-sm backdrop-blur transition hover:bg-[#00A651]/10 hover:border-[#00A651]/30"
          aria-label="Go to dashboard"
        >
          {/* Mindcraft Logo */}
          <img
            src={logo}
            alt="Mindcraft"
            className="h-8 w-auto object-contain brightness-0 dark:brightness-0 dark:invert"
          />

          {/* RAAST Logo */}
          <div className="h-7 w-px bg-border/60" />

          <img
            src={RaastLogo}
            alt="RAAST"
            className="h-7 w-auto max-w-[75px] object-contain"
          />
        </button>

        <button
          type="button"
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/30 text-foreground",
            "transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 hover:scale-105",
            showClose ? "" : "hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onClose}
          aria-label="Close menu"
        >
          <i className="pi pi-times" aria-hidden />
        </button>
      </header>

      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="sidebar-scroll mt-6 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {groups.map((group, groupIdx) => (
          <div key={group.id} className="flex flex-col">
            <div className="flex flex-col gap-2">
              {group.title ? (
                <div className="px-3 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground/80">
                  {group.title}
                </div>
              ) : null}

              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const hasChildren =
                    Array.isArray(item.children) && item.children.length > 0;

                  {
                    /* =========================
                      SIMPLE MENU ITEM
                  ========================= */
                  }
                  if (!hasChildren) {
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={resolveClassName}
                        onClick={onNavigate}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={iconClassName(isActive)}
                              aria-hidden
                            />

                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  }

                  {
                    /* =========================
                      DROPDOWN MENU
                  ========================= */
                  }
                  const open = Boolean(openGroups?.[item.id]);

                  return (
                    <div key={item.id} className="flex flex-col">
                      <button
                        type="button"
                        className={[
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
                          "text-muted-foreground hover:bg-[#00A651]/10 hover:text-foreground",
                          open ? "bg-[#00A651]/10 text-foreground" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => toggleGroup(item.id)}
                      >
                        <item.icon
                          className={iconClassName(open)}
                          aria-hidden
                        />

                        <span className="min-w-0 flex-1 truncate text-left">
                          {item.label}
                        </span>

                        <i
                          className={[
                            "pi pi-angle-right text-xs transition-transform",
                            open ? "rotate-90" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          aria-hidden
                        />
                      </button>

                      {open ? (
                        <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-border pl-3">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.id}
                              to={child.path}
                              className={resolveSubClassName}
                              onClick={onNavigate}
                            >
                              {child.icon ? (
                                <child.icon
                                  className="h-4 w-4 text-muted-foreground group-hover:text-[#00A651]"
                                  aria-hidden
                                />
                              ) : null}

                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {groupIdx < groups.length - 1 ? (
              <div className="my-3 h-px w-full bg-border/50" />
            ) : null}
          </div>
        ))}
      </nav>

      {/* =========================
          LOGOUT
      ========================= */}
      <footer className="mt-auto flex flex-col gap-3 pt-6">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/20 px-3 py-2 text-sm text-foreground hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
          onClick={handleLogout}
        >
          <i className="pi pi-sign-out" aria-hidden />
          Logout
        </button>
      </footer>
    </aside>
  );
}

Sidebar.propTypes = {
  footerLabel: PropTypes.string,
  onNavigate: PropTypes.func,
  onClose: PropTypes.func,
  showClose: PropTypes.bool,
};

Sidebar.defaultProps = {
  footerLabel: "Profile",
  onNavigate: () => {},
  onClose: () => {},
  showClose: false,
};