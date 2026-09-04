import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import api from "../../network/api";

/* =========================================================
   PERIOD OPTIONS
========================================================= */

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last month", value: "1m" },
  { label: "Last 3 months", value: "3m" },
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeTransactions = (response) => {
  const body = response?.data;

  // API returns array
  if (Array.isArray(body)) {
    return body;
  }

  // API returns single transaction object
  if (body && typeof body === "object" && body.transactionId) {
    return [body];
  }

  return [];
};

/* =========================================================
   API FIELD HELPERS
========================================================= */

const getTransactionId = (row) => {
  return row?.transactionId ?? "-";
};

const getTokenId = (row) => {
  return row?.tokenId ?? "-";
};

const getTransactionType = (row) => {
  return row?.transactionType ?? "-";
};

const getAmount = (row) => {
  const amount = Number(row?.amount ?? 0);

  return Number.isFinite(amount) ? amount : 0;
};

const getCurrencyCode = (row) => {
  return row?.currencyCode ?? "PKR";
};

const getReferenceNumber = (row) => {
  return row?.referenceNumber ?? "-";
};

const getStatus = (row) => {
  return row?.status ?? "-";
};

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
    return "inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400";
  }

  if (
    value === "failed" ||
    value === "failure" ||
    value === "rejected"
  ) {
    return "inline-flex rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400";
  }

  if (value === "pending") {
    return "inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400";
  }

  return "inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground";
};

/* =========================================================
   PAGE
========================================================= */

export default function TransactionReportingPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("3m");
  const [type, setType] = useState("all");

  const [applied, setApplied] = useState({
    period: "3m",
    type: "all",
  });

  /* =======================================================
     THEME
  ======================================================= */

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

  /* =======================================================
     GET TRANSACTIONS FROM API
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/transaction/portal");

        console.log("Transaction Portal Response:", response.data);

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

  /* =======================================================
     TRANSACTION TYPE OPTIONS
  ======================================================= */

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

  /* =======================================================
     FILTER TRANSACTIONS
  ======================================================= */

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

  /* =======================================================
     SUMMARY
  ======================================================= */

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

  /* =======================================================
     MONTHLY CHART
  ======================================================= */

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
          borderColor: "rgba(14, 165, 233, 0.95)",
          backgroundColor: "rgba(14, 165, 233, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
      ],
    };
  }, [filteredTransactions]);

  /* =======================================================
     TRANSACTION TYPE CHART
  ======================================================= */

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
          backgroundColor: [
            "rgba(14, 165, 233, 0.85)",
            "rgba(34, 197, 94, 0.85)",
            "rgba(168, 85, 247, 0.85)",
            "rgba(244, 63, 94, 0.85)",
            "rgba(245, 158, 11, 0.85)",
          ],
          borderWidth: 2,
          cutout: "70%",
        },
      ],
    };
  }, [filteredTransactions]);

  /* =======================================================
     CHART OPTIONS
  ======================================================= */

  const chartOptions = useMemo(() => {
    const textColor = isDark ? "#cbd5e1" : "#475569";

    const mutedColor = isDark ? "#94a3b8" : "#64748b";

    const gridColor = isDark
      ? "rgba(148, 163, 184, 0.12)"
      : "rgba(100, 116, 139, 0.15)";

    return {
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: textColor,
            boxWidth: 10,
          },
        },

        tooltip: {
          backgroundColor: isDark
            ? "rgba(15, 23, 42, 0.95)"
            : "rgba(255, 255, 255, 0.98)",

          titleColor: isDark ? "#e2e8f0" : "#0f172a",

          bodyColor: isDark ? "#e2e8f0" : "#334155",

          borderColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(15,23,42,0.10)",

          borderWidth: 1,
        },
      },

      scales: {
        x: {
          ticks: {
            color: mutedColor,
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
  }, [isDark]);

  const donutOptions = useMemo(() => {
    return {
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            color: isDark ? "#cbd5e1" : "#475569",
            padding: 14,
            boxWidth: 10,
          },
        },
      },
    };
  }, [isDark]);

  /* =======================================================
     EXPORT CSV
  ======================================================= */

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

  /* =======================================================
     APPLY
  ======================================================= */

  const handleApply = () => {
    setApplied({
      period,
      type,
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Breadcrumb */}

      <div className="mb-5 text-xs text-muted-foreground">
        Operations / Transaction /{" "}
        <span className="text-sky-600 dark:text-sky-400">Reports</span>
      </div>

      {/* Header */}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Transaction Reports
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Transaction activity and payment performance
          </p>
        </div>

        <Button
          type="button"
          label="Export CSV"
          icon="pi pi-download"
          onClick={handleExport}
          disabled={loading || filteredTransactions.length === 0}
          className="!rounded-lg !border !border-sky-500/30 !bg-sky-500/10 !px-4 !py-2.5 !text-xs !font-semibold !text-sky-600 hover:!bg-sky-500/20 dark:!text-sky-400"
        />
      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          <div className="flex items-start gap-2">
            <i className="pi pi-exclamation-circle mt-0.5" />

            <div>
              <div className="font-semibold">Failed to load report</div>

              <div className="mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
        <div className="flex flex-wrap items-end gap-3">
          {/* Period */}

          <div className="min-w-[190px]">
            <div className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
              PERIOD
            </div>

            <Dropdown
              value={period}
              options={PERIOD_OPTIONS}
              onChange={(e) => setPeriod(e.value)}
              className="theme-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
            />
          </div>

          {/* Transaction Type */}

          <div className="min-w-[180px]">
            <div className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
              TRANSACTION TYPE
            </div>

            <Dropdown
              value={type}
              options={typeOptions}
              onChange={(e) => setType(e.value)}
              className="theme-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
            />
          </div>

          {/* Apply */}

          <Button
            type="button"
            label="Apply"
            onClick={handleApply}
            className="!rounded-lg !border !border-sky-500/30 !bg-sky-500/10 !px-4 !py-2.5 !text-xs !font-semibold !text-sky-600 hover:!bg-sky-500/20 dark:!text-sky-400"
          />
        </div>
      </section>

      {/* Summary Cards */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Total */}

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[11px] font-semibold tracking-wider text-muted-foreground">
            TOTAL TRANSACTIONS
          </div>

          <div className="mt-2 text-2xl font-semibold text-foreground">
            {summary.totalTransactions}
          </div>
        </div>

        {/* Successful */}

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[11px] font-semibold tracking-wider text-muted-foreground">
            SUCCESSFUL
          </div>

          <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {summary.successfulTransactions}
          </div>
        </div>

        {/* Failed */}

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[11px] font-semibold tracking-wider text-muted-foreground">
            FAILED
          </div>

          <div className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {summary.failedTransactions}
          </div>
        </div>

        {/* Volume */}

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[11px] font-semibold tracking-wider text-muted-foreground">
            TOTAL VOLUME
          </div>

          <div className="mt-2 text-2xl font-semibold text-violet-600 dark:text-violet-400">
            PKR {formatAmount(summary.totalVolume)}
          </div>
        </div>
      </div>

      {/* Charts */}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity */}

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300 lg:col-span-2">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">
              Transaction Activity
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Transaction count from API data
            </div>
          </div>

          <div className="h-[280px]">
            {monthData.labels.length > 0 ? (
              <Chart type="line" data={monthData} options={chartOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No transaction data
              </div>
            )}
          </div>
        </section>

        {/* Type */}

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">
              Transactions by Type
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Distribution from backend data
            </div>
          </div>

          <div className="h-[280px]">
            {typeData.labels.length > 0 ? (
              <Chart type="doughnut" data={typeData} options={donutOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No transaction type data
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Transaction Table */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
        <div className="mb-4">
          <div className="text-sm font-semibold text-foreground">
            Transaction Detail
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Detailed transaction report from backend
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
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
              loading ? "Loading transactions..." : "No transactions found."
            }
            className="theme-datatable"
            tableStyle={{
              minWidth: "1100px",
            }}
          >
            {/* 1. Time */}

            <Column
              header="Time"
              body={(row) => getTime(row)}
            />

            {/* 2. Transaction ID */}

            <Column
              header="Transaction ID"
              body={(row) => (
                <span className="font-medium text-foreground">
                  {getTransactionId(row)}
                </span>
              )}
            />

            {/* 3. Token ID */}

            <Column
              header="Token ID"
              body={(row) => getTokenId(row)}
            />

            {/* 4. Type */}

            <Column
              header="Type"
              body={(row) => getTransactionType(row)}
            />

            {/* 5. Amount */}

            <Column
              header="Amount"
              body={(row) => (
                <span className="font-semibold text-foreground">
                  {formatAmount(getAmount(row))}
                </span>
              )}
            />

            {/* 6. Currency */}

            <Column
              header="Currency"
              body={(row) => getCurrencyCode(row)}
            />

            {/* 7. Reference */}

            <Column
              header="Reference"
              body={(row) => getReferenceNumber(row)}
            />

            {/* 8. Status */}

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

            {/* 9. Date */}

            <Column
              header="Date"
              body={(row) => getDate(row) || "-"}
            />
          </DataTable>
        </div>
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
    background: hsl(var(--primary) / 0.15) !important;
    color: hsl(var(--primary)) !important;
  }

  .theme-datatable .p-paginator .p-dropdown {
    background: hsl(var(--card)) !important;
    color: hsl(var(--foreground)) !important;
    border-color: hsl(var(--border)) !important;
  }

  .theme-datatable .p-paginator .p-dropdown-label {
    color: hsl(var(--foreground)) !important;
    background: transparent !important;
  }

  .theme-datatable .p-paginator .p-dropdown-trigger {
    color: hsl(var(--muted-foreground)) !important;
    background: transparent !important;
  }

  .theme-dropdown.p-dropdown,
  .theme-datatable .p-dropdown {
    background: hsl(var(--card)) !important;
    color: hsl(var(--foreground)) !important;
    border-color: hsl(var(--border)) !important;
  }

  .theme-dropdown.p-dropdown:hover,
  .theme-dropdown.p-dropdown.p-focus,
  .theme-datatable .p-dropdown:hover,
  .theme-datatable .p-dropdown.p-focus {
    border-color: hsl(var(--primary)) !important;
    box-shadow: 0 0 0 1px hsl(var(--primary) / 0.2) !important;
  }

  .theme-dropdown .p-dropdown-label,
  .theme-datatable .p-dropdown-label {
    color: hsl(var(--foreground)) !important;
    background: transparent !important;
  }

  .theme-dropdown .p-dropdown-label.p-placeholder {
    color: hsl(var(--muted-foreground)) !important;
  }

  .theme-dropdown .p-dropdown-trigger,
  .theme-datatable .p-dropdown-trigger {
    color: hsl(var(--muted-foreground)) !important;
    background: transparent !important;
  }

  .p-dropdown-panel,
  .p-dropdown-panel.p-component {
    background: hsl(var(--card)) !important;
    color: hsl(var(--foreground)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 10px !important;
  }

  .p-dropdown-panel .p-dropdown-items-wrapper {
    background: hsl(var(--card)) !important;
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
    background: hsl(var(--primary) / 0.12) !important;
    color: hsl(var(--primary)) !important;
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