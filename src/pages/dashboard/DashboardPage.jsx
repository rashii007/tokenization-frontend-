import { useMemo, useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import {
  Activity,
  CheckCircle2,
  Clock3,
  CreditCard,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";
import api from "../../network/api";

export default function DashboardPage() {
  const { darkMode } = useTheme();

  /* =========================================================
     STATE
  ========================================================= */

  const [tokens, setTokens] = useState([]);
  const [transactionRows, setTransactionRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  /* =========================================================
     CLOCK
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     API RESPONSE NORMALIZER
  ========================================================= */

  const extractArray = useCallback((response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.tokens)) {
      return data.tokens;
    }

    if (Array.isArray(data?.transactions)) {
      return data.transactions;
    }

    return [];
  }, []);

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [tokenResponse, transactionResponse] = await Promise.all([
        api.get("/token/portal"),
        api.get("/transaction/portal"),
      ]);

      const tokenData = extractArray(tokenResponse);
      const transactionData = extractArray(transactionResponse);

      setTokens(tokenData);
      setTransactionRows(transactionData);
    } catch (err) {
      console.error("Dashboard API error:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load dashboard data. Please try again.";

      setError(errorMessage);

      setTokens([]);
      setTransactionRows([]);
    } finally {
      setLoading(false);
    }
  }, [extractArray]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getTxnCreatedAt = useCallback((row) => {
    return (
      row?.transactionDate ??
      row?.CreatedAt ??
      row?.createdAt ??
      row?.created_at ??
      row?.CreatedDate ??
      row?.createdDate ??
      ""
    );
  }, []);

  const formatTxnTime = useCallback(
    (row) => {
      const createdAt = getTxnCreatedAt(row);

      if (!createdAt) return "--";

      const parsed = new Date(createdAt);

      if (Number.isNaN(parsed.getTime())) return "--";

      return parsed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    },
    [getTxnCreatedAt],
  );

  const parseAmount = useCallback((value) => {
    if (value === null || value === undefined) return 0;

    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    const number = Number.parseFloat(cleaned);

    return Number.isFinite(number) ? number : 0;
  }, []);

  const toLocalYmd = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =========================================================
     TOKEN COUNT
  ========================================================= */

  const tokenCount = useMemo(() => {
    return tokens.length;
  }, [tokens]);

  /* =========================================================
     TRANSACTION COUNT
  ========================================================= */

  const transactionCount = useMemo(() => {
    return transactionRows.length;
  }, [transactionRows]);

  /* =========================================================
     DATE SERIES
  ========================================================= */

  const dateSeries = useMemo(() => {
    const now = new Date();

    const todayKey = toLocalYmd(now);

    const yesterdayKey = toLocalYmd(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    );

    const thisMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    const previousMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(
      previousMonthDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    let todayCount = 0;
    let yesterdayCount = 0;
    let thisMonthCount = 0;
    let previousMonthCount = 0;

    transactionRows.forEach((row) => {
      const createdAt = getTxnCreatedAt(row);

      if (!createdAt) return;

      const date = new Date(createdAt);

      if (Number.isNaN(date.getTime())) return;

      const ymd = toLocalYmd(date);

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (ymd === todayKey) todayCount++;

      if (ymd === yesterdayKey) yesterdayCount++;

      if (monthKey === thisMonthKey) thisMonthCount++;

      if (monthKey === previousMonthKey) previousMonthCount++;
    });

    const percentageVsYesterday =
      yesterdayCount > 0
        ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
        : null;

    return {
      todayCount,
      yesterdayCount,
      thisMonthCount,
      previousMonthCount,
      percentageVsYesterday,
      monthDifference: thisMonthCount - previousMonthCount,
    };
  }, [transactionRows, getTxnCreatedAt, toLocalYmd]);

  /* =========================================================
     MONTHLY SERIES
  ========================================================= */

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const keys = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      keys.push(key);
    }

    const buckets = new Map(
      keys.map((key) => [
        key,
        {
          count: 0,
          volume: 0,
        },
      ]),
    );

    transactionRows.forEach((row) => {
      const createdAt = getTxnCreatedAt(row);

      if (!createdAt) return;

      const date = new Date(createdAt);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      if (!buckets.has(key)) return;

      const bucket = buckets.get(key);

      bucket.count += 1;
      bucket.volume += parseAmount(row?.amount);
    });

    const labels = keys.map((key) => {
      const [year, month] = key.split("-");

      return new Date(Number(year), Number(month) - 1, 1).toLocaleString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        },
      );
    });

    const counts = keys.map((key) => buckets.get(key)?.count ?? 0);

    const volumes = keys.map((key) => buckets.get(key)?.volume ?? 0);

    return {
      labels,
      counts,
      volumes,
    };
  }, [transactionRows, getTxnCreatedAt, parseAmount]);

  /* =========================================================
     TOTAL VOLUME
  ========================================================= */

  const totalVolume = useMemo(() => {
    return transactionRows.reduce(
      (total, row) => total + parseAmount(row?.amount),
      0,
    );
  }, [transactionRows, parseAmount]);

  /* =========================================================
     TRANSACTION STATS
  ========================================================= */

  const transactionStats = useMemo(() => {
    let success = 0;
    let failed = 0;

    transactionRows.forEach((row) => {
      const status = String(row?.status ?? "")
        .trim()
        .toLowerCase();

      if (
        status === "success" ||
        status === "successful" ||
        status === "completed"
      ) {
        success++;
      } else {
        failed++;
      }
    });

    const total = success + failed;

    const successRate = total > 0 ? (success / total) * 100 : 0;

    const failedRate = total > 0 ? (failed / total) * 100 : 0;

    const averageValue = total > 0 ? totalVolume / total : 0;

    return {
      success,
      failed,
      total,
      successRate,
      failedRate,
      averageValue,
    };
  }, [transactionRows, totalVolume]);

  /* =========================================================
     HOURLY ACTIVITY
  ========================================================= */

  const hourlyActivity = useMemo(() => {
    const hours = new Array(24).fill(0);

    transactionRows.forEach((row) => {
      const createdAt = getTxnCreatedAt(row);

      if (!createdAt) return;

      const date = new Date(createdAt);

      if (Number.isNaN(date.getTime())) return;

      hours[date.getHours()]++;
    });

    return hours;
  }, [transactionRows, getTxnCreatedAt]);

  /* =========================================================
     CHART OPTIONS
  ========================================================= */

  const chartOptions = useMemo(() => {
    const textColor = darkMode ? "#f8fafc" : "#1c1f4a";

    const mutedColor = darkMode ? "#94a3b8" : "#677079";

    const gridColor = darkMode
      ? "rgba(148,163,184,0.15)"
      : "rgba(103,112,121,0.15)";

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
          backgroundColor: darkMode ? "#111827" : "#ffffff",
          borderColor: darkMode ? "#334155" : "#e0e0e0",
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

  /* =========================================================
     CHART DATA
  ========================================================= */

  const transactionChartData = useMemo(
    () => ({
      labels: monthlySeries.labels,

      datasets: [
        {
          label: "Transactions",

          data: monthlySeries.counts,

          backgroundColor: "rgba(34, 211, 238, 0.35)",

          borderColor: "rgba(34, 211, 238, 0.9)",

          borderWidth: 1,

          borderRadius: 8,
        },
      ],
    }),
    [monthlySeries],
  );

  const volumeChartData = useMemo(
    () => ({
      labels: monthlySeries.labels,

      datasets: [
        {
          label: "Transaction Volume",

          data: monthlySeries.volumes,

          tension: 0.3,

          fill: true,

          backgroundColor: "rgba(34, 211, 238, 0.10)",

          borderColor: "rgba(34, 211, 238, 0.85)",

          pointRadius: 3,

          pointHoverRadius: 5,
        },
      ],
    }),
    [monthlySeries],
  );

  const hourlyChartData = useMemo(() => {
    const labels = Array.from({ length: 24 }, (_, hour) => {
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;

      const ampm = hour >= 12 ? "PM" : "AM";

      return `${displayHour} ${ampm}`;
    });

    return {
      labels,

      datasets: [
        {
          label: "Transactions",

          data: hourlyActivity,

          borderColor: "rgba(139, 92, 246, 0.9)",

          backgroundColor: "rgba(139, 92, 246, 0.12)",

          fill: true,

          tension: 0.35,

          pointRadius: 3,
        },
      ],
    };
  }, [hourlyActivity]);

  /* =========================================================
     TABLE COLUMNS
     NEW API:
     transactionId
     tokenId
     transactionType
     amount
     currencyCode
     referenceNumber
     status
     transactionDate
  ========================================================= */

  const columns = useMemo(
    () => [
      {
        field: "transactionDate",
        header: "Time",
        body: (row) => formatTxnTime(row),
      },

      {
        field: "transactionId",
        header: "Transaction ID",
        body: (row) => row?.transactionId ?? "--",
      },

      {
        field: "tokenId",
        header: "Token ID",
        body: (row) => row?.tokenId ?? "--",
      },

      {
        field: "transactionType",
        header: "Type",
        body: (row) => row?.transactionType ?? "--",
      },

      {
        field: "amount",
        header: "Amount",
        body: (row) =>
          `${row?.currencyCode ?? "PKR"} ${parseAmount(
            row?.amount,
          ).toLocaleString()}`,
      },

      {
        field: "currencyCode",
        header: "Currency",
        body: (row) => row?.currencyCode ?? "--",
      },

      {
        field: "referenceNumber",
        header: "Reference",
        body: (row) => row?.referenceNumber ?? "--",
      },

      {
        field: "status",
        header: "Status",
        body: (row) => {
          const status = String(row?.status ?? "--");
          const normalizedStatus = status.toLowerCase();

          const success =
            normalizedStatus === "success" ||
            normalizedStatus === "successful" ||
            normalizedStatus === "completed";

          const pending = normalizedStatus === "pending";

          return (
            <span
              className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                success
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                  : pending
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300",
              ].join(" ")}
            >
              {status}
            </span>
          );
        },
      },

      {
        field: "transactionDate",
        header: "Date",
        body: (row) => row?.transactionDate ?? "--",
      },
    ],
    [formatTxnTime, parseAmount],
  );

  /* =========================================================
     STATS
  ========================================================= */

  const stats = [
    {
      id: "token",
      label: "Total Tokens",
      value: tokenCount,
      icon: Wallet,
      accent: "bg-cyan-400",
      bottom: "Live token data",
    },

    {
      id: "transactions",
      label: "Total Transactions",
      value: transactionCount,
      icon: Activity,
      accent: "bg-violet-400",

      bottom: `${
        dateSeries.monthDifference >= 0 ? "+" : ""
      }${dateSeries.monthDifference} vs last month`,
    },

    {
      id: "today",
      label: "Transactions Today",
      value: dateSeries.todayCount,
      icon: CreditCard,
      accent: "bg-emerald-400",

      bottom:
        dateSeries.percentageVsYesterday === null
          ? "-- vs yesterday"
          : `${
              dateSeries.percentageVsYesterday >= 0 ? "+" : ""
            }${dateSeries.percentageVsYesterday.toFixed(1)}% vs yesterday`,
    },

    {
      id: "volume",
      label: "Transaction Volume",
      value: totalVolume,
      icon: TrendingUp,
      accent: "bg-amber-400",
      bottom: "PKR volume",
    },
  ];

  /* =========================================================
     RETURN
  ========================================================= */

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
              Dashboard
            </h1>

            <div className="mt-1 text-xs text-muted-foreground">
              Token & Transaction Overview
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
              <Clock3 className="h-4 w-4 text-cyan-400" />

              <span className="text-sm font-medium text-foreground">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadDashboardData}
            className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold transition hover:bg-rose-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <Icon className="h-5 w-5 text-primary" />

                  {stat.id === "token" && (
                    <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-600 dark:text-cyan-300">
                      LIVE
                    </span>
                  )}
                </div>

                <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : stat.id === "volume" ? (
                    `PKR ${Number(stat.value).toLocaleString()}`
                  ) : (
                    Number(stat.value).toLocaleString()
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>

                <div className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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

      {/* INFORMATION CARDS */}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div className="text-sm font-semibold text-foreground">
            Token Information
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Current token state
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5">
            <div>
              <div className="text-xs text-muted-foreground">
                Available Tokens
              </div>

              <div className="mt-2 text-3xl font-semibold text-foreground">
                {loading ? "..." : tokenCount.toLocaleString()}
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Wallet className="h-6 w-6 text-cyan-400" />
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
            System Time
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Current dashboard time
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-5">
            <div>
              <div className="text-xs text-muted-foreground">Current Time</div>

              <div className="mt-2 text-3xl font-semibold text-foreground">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10">
              <Clock3 className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </article>
      </section>

      {/* CHARTS */}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="text-sm font-semibold text-foreground">
              Transactions per Month
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Last 6 months
            </div>
          </div>

          <div className="mt-5 h-[280px]">
            <Chart
              key={`transactions-${darkMode}`}
              type="bar"
              data={transactionChartData}
              options={chartOptions}
            />
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
              Transaction Volume
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Monthly PKR volume
            </div>
          </div>

          <div className="mt-5 h-[280px]">
            <Chart
              key={`volume-${darkMode}`}
              type="line"
              data={volumeChartData}
              options={chartOptions}
            />
          </div>
        </article>
      </section>

      {/* HOURLY ACTIVITY */}

      <section className="mt-6">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="text-sm font-semibold text-foreground">
              Transaction Activity
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Transaction activity by hour
            </div>
          </div>

          <div className="mt-5 h-[280px]">
            <Chart
              key={`hourly-${darkMode}`}
              type="line"
              data={hourlyChartData}
              options={chartOptions}
            />
          </div>
        </article>
      </section>

      {/* INSIGHTS */}

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
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />

                <span className="text-xs font-semibold text-foreground">
                  Success Rate
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                {transactionStats.successRate.toFixed(1)}%
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                {transactionStats.success} successful
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500 dark:text-rose-400" />

                <span className="text-xs font-semibold text-foreground">
                  Failed Transactions
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                {transactionStats.failed}
              </div>

              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                {transactionStats.failedRate.toFixed(1)}% failure rate
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />

                <span className="text-xs font-semibold text-foreground">
                  Avg Transaction
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                PKR {Math.round(transactionStats.averageValue).toLocaleString()}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Average transaction value
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500 dark:text-violet-400" />

                <span className="text-xs font-semibold text-foreground">
                  Total Volume
                </span>
              </div>

              <div className="mt-4 text-2xl font-semibold text-foreground">
                PKR {Math.round(totalVolume).toLocaleString()}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Current transaction data
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* TRANSACTION LOG */}

      <section className="mt-8">
        <article
          className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
          }}
        >
          <div>
            <div className="mb-1 text-sm font-semibold text-foreground">
              Transaction Log
            </div>

            <div className="mb-4 text-xs text-muted-foreground">
              Recent token transaction activity
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-border"
            style={{
              backgroundColor: "hsl(var(--muted) / 0.3)",
            }}
          >
            <DataTable
              value={transactionRows}
              dataKey="id"
              rowHover
              size="small"
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 20]}
              emptyMessage={
                loading ? "Loading transactions..." : "No transactions found"
              }
              scrollable
              scrollHeight="500px"
              className="theme-datatable"
              tableStyle={{
                minWidth: "1200px",
              }}
            >
              {columns.map((column) => (
                <Column
                  key={column.field}
                  field={column.field}
                  header={column.header}
                  body={column.body}
                  headerClassName="theme-table-header"
                  bodyClassName="theme-table-body"
                />
              ))}
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
          background: hsl(var(--primary) / 0.15) !important;
          color: hsl(var(--primary)) !important;
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
          background: hsl(var(--primary) / 0.12) !important;
          color: hsl(var(--primary)) !important;
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
