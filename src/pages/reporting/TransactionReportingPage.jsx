import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  Activity,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Filter,
  TrendingUp,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";
import api from "../../network/api";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last month", value: "1m" },
  { label: "Last 3 months", value: "3m" },
];

const normalizeTransactions = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) {
    return body;
  }

  if (body && typeof body === "object" && body.transactionId) {
    return [body];
  }

  return [];
};

const getTransactionId = (row) => row?.transactionId ?? "-";

const getTokenId = (row) => row?.tokenId ?? "-";

const getTransactionType = (row) => row?.transactionType ?? "-";

const getAmount = (row) => {
  const amount = Number(row?.amount ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const getCurrencyCode = (row) => row?.currencyCode ?? "PKR";

const getReferenceNumber = (row) => row?.referenceNumber ?? "-";

const getStatus = (row) => row?.status ?? "-";

const getDate = (row) => {
  const value = row?.transactionDate;

  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTime = (row) => {
  const value = row?.transactionDate;

  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const formatAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });
};

const getStatusClass = (status) => {
  const value = String(status ?? "").toLowerCase();

  if (
    value === "success" ||
    value === "successful" ||
    value === "completed"
  ) {
    return "inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300";
  }

  if (
    value === "failed" ||
    value === "failure" ||
    value === "rejected"
  ) {
    return "inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300";
  }

  if (value === "pending") {
    return "inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-600 dark:text-teal-300";
  }

  return "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground";
};

export default function TransactionReportingPage() {
  const { darkMode } = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("3m");
  const [type, setType] = useState("all");

  const [applied, setApplied] = useState({
    period: "3m",
    type: "all",
  });

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/transaction/portal");
        const data = normalizeTransactions(response);

        if (mounted) {
          setTransactions(data);
        }
      } catch (err) {
        console.error("Transaction Portal Error:", err);

        if (mounted) {
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.response?.data?.detail ||
            "Failed to load transaction report.";

          setError(message);
          setTransactions([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      mounted = false;
    };
  }, []);

  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set();

    transactions.forEach((transaction) => {
      const transactionType = getTransactionType(transaction);

      if (transactionType && transactionType !== "-") {
        uniqueTypes.add(String(transactionType));
      }
    });

    return [
      {
        label: "All Types",
        value: "all",
      },
      ...Array.from(uniqueTypes).map((transactionType) => ({
        label: transactionType,
        value: transactionType,
      })),
    ];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (applied.period === "7d") {
      start.setDate(start.getDate() - 6);
    } else if (applied.period === "1m") {
      start.setMonth(start.getMonth() - 1);
    } else {
      start.setMonth(start.getMonth() - 3);
    }

    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return transactions.filter((transaction) => {
      const transactionDateString = getDate(transaction);

      if (!transactionDateString) {
        return false;
      }

      const transactionDate = new Date(transactionDateString);

      const dateMatch =
        transactionDate >= start && transactionDate <= end;

      const transactionType = getTransactionType(transaction);

      const typeMatch =
        applied.type === "all" || transactionType === applied.type;

      return dateMatch && typeMatch;
    });
  }, [transactions, applied]);

  const summary = useMemo(() => {
    const totalTransactions = filteredTransactions.length;

    const successfulTransactions = filteredTransactions.filter((item) => {
      const status = String(getStatus(item)).toLowerCase();

      return (
        status === "success" ||
        status === "successful" ||
        status === "completed"
      );
    }).length;

    const failedTransactions = filteredTransactions.filter((item) => {
      const status = String(getStatus(item)).toLowerCase();

      return (
        status === "failed" ||
        status === "failure" ||
        status === "rejected"
      );
    }).length;

    const totalVolume = filteredTransactions.reduce(
      (sum, item) => sum + getAmount(item),
      0,
    );

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      totalVolume,
    };
  }, [filteredTransactions]);

  const monthData = useMemo(() => {
    const monthMap = new Map();

    filteredTransactions.forEach((transaction) => {
      const date = getDate(transaction);

      if (!date) {
        return;
      }

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return;
      }

      const key = `${parsedDate.getFullYear()}-${String(
        parsedDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      const label = parsedDate.toLocaleString("en", {
        month: "short",
        year: "numeric",
      });

      const current = monthMap.get(key);

      monthMap.set(key, {
        key,
        label,
        count: (current?.count ?? 0) + 1,
      });
    });

    const sortedMonths = Array.from(monthMap.values()).sort((a, b) =>
      a.key.localeCompare(b.key),
    );

    return {
      labels: sortedMonths.map((item) => item.label),
      datasets: [
        {
          label: "Transactions",
          data: sortedMonths.map((item) => item.count),
          borderColor: darkMode ? "#36C58A" : "#00A651",
          backgroundColor: darkMode
            ? "rgba(0, 166, 81, 0.20)"
            : "rgba(0, 166, 81, 0.12)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBackgroundColor: darkMode ? "#36C58A" : "#00A651",
          pointBorderColor: darkMode ? "#36C58A" : "#00A651",
        },
      ],
    };
  }, [filteredTransactions, darkMode]);

  const typeData = useMemo(() => {
    const typeMap = new Map();

    filteredTransactions.forEach((transaction) => {
      const transactionType = getTransactionType(transaction);

      if (transactionType && transactionType !== "-") {
        typeMap.set(
          transactionType,
          (typeMap.get(transactionType) ?? 0) + 1,
        );
      }
    });

    const entries = Array.from(typeMap.entries());

    return {
      labels: entries.map(([label]) => label),
      datasets: [
        {
          data: entries.map(([, count]) => count),
          backgroundColor: darkMode
            ? [
                "rgba(54, 197, 138, 0.85)",
                "rgba(36, 181, 207, 0.85)",
                "rgba(0, 166, 81, 0.85)",
                "rgba(36, 181, 207, 0.65)",
                "rgba(54, 197, 138, 0.65)",
              ]
            : [
                "rgba(0, 166, 81, 0.85)",
                "rgba(36, 181, 138, 0.85)",
                "rgba(0, 166, 81, 0.70)",
                "rgba(36, 181, 138, 0.70)",
                "rgba(0, 166, 81, 0.55)",
              ],
          borderWidth: 2,
          cutout: "70%",
        },
      ],
    };
  }, [filteredTransactions, darkMode]);

  const chartOptions = useMemo(() => {
    const textColor = darkMode ? "#E8F5F1" : "#1f2937";
    const mutedColor = darkMode ? "#9FB8B1" : "#64748b";

    const gridColor = darkMode
      ? "rgba(80, 190, 160, 0.14)"
      : "rgba(100,116,139,0.15)";

    return {
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: textColor,
            boxWidth: 10,
            boxHeight: 10,
          },
        },

        tooltip: {
          titleColor: textColor,
          bodyColor: textColor,
          backgroundColor: darkMode ? "#071B22" : "#ffffff",
          borderColor: darkMode ? "#174B55" : "#d1d5db",
          borderWidth: 1,
        },
      },

      scales: {
        x: {
          ticks: {
            color: mutedColor,
            maxRotation: 0,
            autoSkip: true,
          },

          grid: {
            color: gridColor,
          },
        },

        y: {
          ticks: {
            color: mutedColor,
          },

          grid: {
            color: gridColor,
          },
        },
      },
    };
  }, [darkMode]);

  const donutOptions = useMemo(() => {
    return {
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            color: darkMode ? "#E8F5F1" : "#1f2937",
            padding: 14,
            boxWidth: 10,
          },
        },

        tooltip: {
          titleColor: darkMode ? "#E8F5F1" : "#1f2937",
          bodyColor: darkMode ? "#E8F5F1" : "#1f2937",
          backgroundColor: darkMode ? "#071B22" : "#ffffff",
          borderColor: darkMode ? "#174B55" : "#d1d5db",
          borderWidth: 1,
        },
      },
    };
  }, [darkMode]);

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      return;
    }

    const headers = [
      "Transaction ID",
      "Token ID",
      "Transaction Type",
      "Amount",
      "Currency",
      "Reference Number",
      "Status",
      "Date",
    ];

    const rows = filteredTransactions.map((item) => [
      getTransactionId(item),
      getTokenId(item),
      getTransactionType(item),
      getAmount(item),
      getCurrencyCode(item),
      getReferenceNumber(item),
      getStatus(item),
      getDate(item),
    ]);

    const escapeCsv = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      return `"${String(value).replace(/"/g, '""')}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const now = new Date();
    const date = now.toISOString().slice(0, 10);

    link.href = url;
    link.download = `transaction-report_${date}.csv`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    setApplied({
      period,
      type,
    });
  };

  const stats = [
    {
      id: "total",
      label: "Total Transactions",
      value: summary.totalTransactions,
      icon: Activity,
      accent: darkMode ? "bg-[#36C58A]" : "bg-[#00A651]",
      bottom: "Filtered transaction data",
    },
    {
      id: "success",
      label: "Successful",
      value: summary.successfulTransactions,
      icon: CheckCircle2,
      accent: darkMode ? "bg-[#36C58A]" : "bg-[#00A651]",
      bottom: "Successful transactions",
    },
    {
      id: "failed",
      label: "Failed",
      value: summary.failedTransactions,
      icon: Activity,
      accent: "bg-rose-500",
      bottom: "Failed transactions",
    },
    {
      id: "volume",
      label: "Total Volume",
      value: summary.totalVolume,
      icon: TrendingUp,
      accent: darkMode ? "bg-[#24B5CF]" : "bg-[#00A651]",
      bottom: "PKR transaction volume",
    },
  ];

  return (
    <div
      className="min-h-full transition-colors duration-300"
      style={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      {/* HEADER */}

      <header className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Transaction Reports
            </h1>

            <div className="mt-1 text-xs text-muted-foreground">
              Token & Transaction Reporting Overview
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Button
              type="button"
              label="Export CSV"
              icon="pi pi-download"
              onClick={handleExport}
              disabled={loading || filteredTransactions.length === 0}
              className="!rounded-xl !border !border-[#00A651]/30 !bg-[#00A651]/10 !px-4 !py-2.5 !text-xs !font-semibold !text-[#00A651] hover:!bg-[#00A651]/15 dark:!text-[#36C58A]"
            />
          </div>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold transition hover:bg-rose-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}

      <section className="rounded-2xl border border-border p-5 shadow-sm backdrop-blur transition-colors duration-300"
        style={{
          backgroundColor: "hsl(var(--card) / 0.7)",
        }}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#00A651] dark:text-[#36C58A]" />

          <div className="text-sm font-semibold text-foreground">
            Report Filters
          </div>
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          Filter transaction reporting data
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full lg:max-w-[240px]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Period
            </div>

            <Dropdown
              value={period}
              options={PERIOD_OPTIONS}
              onChange={(e) => setPeriod(e.value)}
              className="theme-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
            />
          </div>

          <div className="w-full lg:max-w-[240px]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Transaction Type
            </div>

            <Dropdown
              value={type}
              options={typeOptions}
              onChange={(e) => setType(e.value)}
              className="theme-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
            />
          </div>

          <Button
            type="button"
            label="Apply"
            onClick={handleApply}
            className="!rounded-xl !border !border-[#00A651]/30 !bg-[#00A651]/10 !px-5 !py-3 !text-xs !font-semibold !text-[#00A651] hover:!bg-[#00A651]/15 dark:!text-[#36C58A]"
          />
        </div>
      </section>

      {/* STATS */}

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.id}
              className="relative overflow-hidden rounded-2xl border border-border px-5 py-4 shadow-sm backdrop-blur transition-colors duration-300"
              style={{
                backgroundColor: "hsl(var(--card) / 0.7)",
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent dark:from-white/[0.04]"
                aria-hidden
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[#00A651] dark:text-[#36C58A]" />

                  {stat.id === "total" && (
                    <span className="rounded-full bg-[#00A651]/10 px-2 py-1 text-[10px] font-medium text-[#008F45] dark:bg-[#36C58A]/10 dark:text-[#65D9AD]">
                      REPORT
                    </span>
                  )}
                </div>

                <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : stat.id === "volume" ? (
                    `PKR ${formatAmount(stat.value)}`
                  ) : (
                    Number(stat.value).toLocaleString()
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>

                <div className="mt-3 text-xs font-semibold text-[#008F45] dark:text-[#4DD39E]">
                  {stat.bottom}
                </div>
              </div>

              <div
                className={`absolute bottom-0 left-0 h-[2px] w-full ${stat.accent}`}
              />
            </article>
          );
        })}
      </section>

      {/* CHARTS */}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300 lg:col-span-2"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="text-sm font-semibold text-foreground">
              Transaction Activity
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Transaction count from API data
            </div>
          </div>

          <div className="mt-5 h-[280px]">
            {monthData.labels.length > 0 ? (
              <Chart
                key={`transaction-activity-${darkMode}`}
                type="line"
                data={monthData}
                options={chartOptions}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No transaction data
              </div>
            )}
          </div>
        </article>

        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="text-sm font-semibold text-foreground">
              Transactions by Type
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Distribution from backend data
            </div>
          </div>

          <div className="mt-5 h-[280px]">
            {typeData.labels.length > 0 ? (
              <Chart
                key={`transaction-type-${darkMode}`}
                type="doughnut"
                data={typeData}
                options={donutOptions}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No transaction type data
              </div>
            )}
          </div>
        </article>
      </section>

      {/* SUMMARY INFORMATION */}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div className="text-sm font-semibold text-foreground">
            Reporting Information
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Current filtered transaction state
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5">
            <div>
              <div className="text-xs text-muted-foreground">
                Filtered Transactions
              </div>

              <div className="mt-2 text-3xl font-semibold text-foreground">
                {loading
                  ? "..."
                  : summary.totalTransactions.toLocaleString()}
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A651]/10 dark:bg-[#36C58A]/10">
              <Activity className="h-6 w-6 text-[#00A651] dark:text-[#36C58A]" />
            </div>
          </div>
        </article>

        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div className="text-sm font-semibold text-foreground">
            Transaction Volume
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Current filtered payment volume
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5">
            <div>
              <div className="text-xs text-muted-foreground">
                Total Volume
              </div>

              <div className="mt-2 text-3xl font-semibold text-foreground">
                {loading
                  ? "..."
                  : `PKR ${formatAmount(summary.totalVolume)}`}
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A651]/10 dark:bg-[#24B5CF]/10">
              <TrendingUp className="h-6 w-6 text-[#00A651] dark:text-[#24B5CF]" />
            </div>
          </div>
        </article>
      </section>

      {/* TRANSACTION INSIGHTS */}

      <section className="mt-6">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="text-sm font-semibold text-foreground">
              Transaction Insights
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Operational transaction metrics
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#36C58A]" />

                <span className="text-xs font-semibold text-foreground">
                  Successful
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                {summary.successfulTransactions}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Successful transactions
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500 dark:text-rose-400" />

                <span className="text-xs font-semibold text-foreground">
                  Failed
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                {summary.failedTransactions}
              </div>

              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                Failed transactions
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#00A651] dark:text-[#24B5CF]" />

                <span className="text-xs font-semibold text-foreground">
                  Total Transactions
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                {summary.totalTransactions}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Current filtered data
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#00A651] dark:text-[#36C58A]" />

                <span className="text-xs font-semibold text-foreground">
                  Total Volume
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                PKR {formatAmount(summary.totalVolume)}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Current transaction volume
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* TRANSACTION DETAIL */}

      <section className="mt-8">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="mb-1 text-sm font-semibold text-foreground">
              Transaction Detail
            </div>

            <div className="mb-4 text-xs text-muted-foreground">
              Detailed transaction report from backend
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-border"
            style={{
              backgroundColor: "hsl(var(--muted) / 0.3)",
            }}
          >
            <DataTable
              value={filteredTransactions}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              rowHover
              scrollable
              scrollHeight="450px"
              loading={loading}
              emptyMessage={
                loading
                  ? "Loading transactions..."
                  : "No transactions found."
              }
              className="theme-datatable"
              tableStyle={{
                minWidth: "1200px",
              }}
            >
              <Column
                header="Time"
                body={(row) => getTime(row)}
              />

              <Column
                header="Transaction ID"
                body={(row) => (
                  <span className="font-medium text-foreground">
                    {getTransactionId(row)}
                  </span>
                )}
              />

              <Column
                header="Token ID"
                body={(row) => getTokenId(row)}
              />

              <Column
                header="Type"
                body={(row) => getTransactionType(row)}
              />

              <Column
                header="Amount"
                body={(row) => (
                  <span className="font-semibold text-foreground">
                    {getCurrencyCode(row)}{" "}
                    {formatAmount(getAmount(row))}
                  </span>
                )}
              />

              <Column
                header="Currency"
                body={(row) => getCurrencyCode(row)}
              />

              <Column
                header="Reference"
                body={(row) => getReferenceNumber(row)}
              />

              <Column
                header="Status"
                body={(row) => {
                  const status = getStatus(row);

                  return (
                    <span className={getStatusClass(status)}>
                      {status}
                    </span>
                  );
                }}
              />

              <Column
                header="Date"
                body={(row) => getDate(row) || "-"}
              />
            </DataTable>
          </div>
        </article>
      </section>

      {/* PRIMEREACT THEME */}

      <style>{`
        .theme-datatable .p-datatable-table {
          background: transparent !important;
        }

        .theme-datatable .p-datatable-thead > tr > th {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--muted-foreground)) !important;
          border-color: hsl(var(--border)) !important;
          padding: 0.75rem 1rem !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .theme-datatable .p-datatable-tbody > tr {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
          transition: background-color 0.2s ease;
        }

        .theme-datatable .p-datatable-tbody > tr > td {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
          padding: 0.75rem 1rem !important;
          font-size: 0.875rem !important;
        }

        .theme-datatable .p-datatable-tbody > tr:nth-child(even) {
          background: hsl(var(--muted) / 0.35) !important;
        }

        .theme-datatable .p-datatable-tbody > tr:hover {
          background: hsl(var(--primary) / 0.08) !important;
        }

        .theme-datatable .p-paginator {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
        }

        .theme-datatable .p-paginator .p-paginator-page,
        .theme-datatable .p-paginator .p-paginator-first,
        .theme-datatable .p-paginator .p-paginator-prev,
        .theme-datatable .p-paginator .p-paginator-next,
        .theme-datatable .p-paginator .p-paginator-last {
          color: hsl(var(--foreground)) !important;
          background: transparent !important;
          border-radius: 0.5rem !important;
        }

        .theme-datatable .p-paginator .p-paginator-element:hover {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--foreground)) !important;
        }

        .theme-datatable .p-paginator .p-paginator-page.p-highlight {
          background: ${darkMode
            ? "rgba(36, 181, 207, 0.15)"
            : "hsl(var(--primary) / 0.15)"} !important;
          color: ${darkMode
            ? "#24B5CF"
            : "hsl(var(--primary))"} !important;
        }

        .theme-datatable .p-paginator .p-dropdown {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.5rem !important;
        }

        .theme-datatable .p-paginator .p-dropdown .p-dropdown-label {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
        }

        .theme-datatable .p-paginator .p-dropdown .p-dropdown-trigger {
          background: transparent !important;
          color: hsl(var(--muted-foreground)) !important;
        }

        .theme-datatable .p-paginator .p-dropdown:hover,
        .theme-datatable .p-paginator .p-dropdown.p-focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 1px hsl(var(--primary) / 0.2) !important;
        }

        .theme-dropdown.p-dropdown,
        .theme-datatable .p-dropdown {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
        }

        .theme-dropdown.p-dropdown:hover,
        .theme-dropdown.p-dropdown.p-focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 1px hsl(var(--primary) / 0.2) !important;
        }

        .theme-dropdown .p-dropdown-label,
        .theme-datatable .p-dropdown .p-dropdown-label {
          color: hsl(var(--foreground)) !important;
          background: transparent !important;
        }

        .theme-dropdown .p-dropdown-trigger,
        .theme-datatable .p-dropdown .p-dropdown-trigger {
          color: hsl(var(--muted-foreground)) !important;
          background: transparent !important;
        }

        .p-dropdown-panel {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 10px !important;
        }

        .p-dropdown-panel .p-dropdown-items {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          padding: 4px !important;
        }

        .p-dropdown-panel .p-dropdown-item {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 6px !important;
        }

        .p-dropdown-panel .p-dropdown-item:hover {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--foreground)) !important;
        }

        .p-dropdown-panel .p-dropdown-item.p-highlight {
          background: ${darkMode
            ? "rgba(36, 181, 207, 0.12)"
            : "hsl(var(--primary) / 0.12)"} !important;
          color: ${darkMode
            ? "#24B5CF"
            : "hsl(var(--primary))"} !important;
        }

        .theme-datatable .p-datatable-wrapper {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.4)
            hsl(var(--muted) / 0.3);
        }

        .theme-datatable .p-datatable-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .theme-datatable .p-datatable-wrapper::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
          border-radius: 999px;
        }

        .theme-datatable .p-datatable-wrapper::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 999px;
        }

        .theme-datatable .p-datatable-wrapper::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }

        .p-dropdown-panel .p-dropdown-items-wrapper {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.4)
            hsl(var(--muted) / 0.3);
        }

        .p-dropdown-panel .p-dropdown-items-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .p-dropdown-panel .p-dropdown-items-wrapper::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
        }

        .p-dropdown-panel .p-dropdown-items-wrapper::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 999px;
        }

        .p-dropdown-panel .p-dropdown-items-wrapper::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }

        .theme-datatable .p-datatable-emptymessage > tr > td {
          background: transparent !important;
          color: hsl(var(--muted-foreground)) !important;
          border-color: hsl(var(--border)) !important;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
