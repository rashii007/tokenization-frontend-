import { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import api from "../../network/api";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last month", value: "1m" },
  { label: "Last 3 months", value: "3m" },
];

const TOKEN_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Payment Token", value: "Payment Token" },
  { label: "Virtual Token", value: "Virtual Token" },
  { label: "Digital Token", value: "Digital Token" },
];

const CARD_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Visa", value: "Visa" },
  { label: "Mastercard", value: "Mastercard" },
  // { label: "PayPak", value: "PayPak" },
  { label: "Asan Card", value: "Asan Card" },
  { label: "Kissan Card", value: "Kissan Card" },
];

const toLocalYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateOnly = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getTokenId = (token) =>
  token?.tokenId ??
  token?.TokenID ??
  token?.id ??
  token?._id ??
  token?.token_id ??
  "";

const getTokenType = (token) =>
  token?.tokenType ??
  token?.TokenType ??
  token?.type ??
  token?.token_type ??
  "";

const getCardType = (token) =>
  token?.cardType ??
  token?.CardType ??
  token?.card_type ??
  token?.card?.type ??
  "";

const getTokenNumber = (token) =>
  token?.tokenNumber ??
  token?.TokenNumber ??
  token?.cardNumber ??
  token?.CardNumber ??
  token?.pan ??
  token?.PAN ??
  "";

const getTokenStatus = (token) => {
  if (
    token?.isActive === true ||
    token?.IsActive === true ||
    token?.active === true
  ) {
    return "Active";
  }

  if (
    token?.isActive === false ||
    token?.IsActive === false ||
    token?.active === false
  ) {
    return "Inactive";
  }

  return (
    token?.status ??
    token?.Status ??
    token?.tokenStatus ??
    token?.token_status ??
    "Active"
  );
};

const getTokenCreatedDate = (token) =>
  token?.createdDate ??
  token?.CreatedDate ??
  token?.createdAt ??
  token?.CreatedAt ??
  token?.created_at ??
  token?.date ??
  "";

const getTransactionTokenId = (transaction) =>
  transaction?.tokenId ??
  transaction?.TokenID ??
  transaction?.token_id ??
  transaction?.token?.tokenId ??
  transaction?.token?.id ??
  "";

const getTransactionAmount = (transaction) =>
  Number(
    transaction?.amount ??
      transaction?.Amount ??
      transaction?.instructed_amount ??
      transaction?.instructedAmount ??
      transaction?.transactionAmount ??
      transaction?.transaction_amount ??
      0,
  );

const getTransactionStatus = (transaction) =>
  transaction?.status ??
  transaction?.Status ??
  transaction?.transactionStatus ??
  transaction?.transaction_status ??
  "";

const getTransactionDate = (transaction) =>
  transaction?.date ??
  transaction?.Date ??
  transaction?.transactionDate ??
  transaction?.transaction_date ??
  transaction?.createdDate ??
  transaction?.createdAt ??
  transaction?.CreatedAt ??
  transaction?.created_at ??
  "";

const extractArray = (responseData, possibleKeys = []) => {
  if (Array.isArray(responseData)) return responseData;

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  for (const key of possibleKeys) {
    if (Array.isArray(responseData[key])) {
      return responseData[key];
    }
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (responseData.data && typeof responseData.data === "object") {
    for (const key of possibleKeys) {
      if (Array.isArray(responseData.data[key])) {
        return responseData.data[key];
      }
    }

    if (Array.isArray(responseData.data.data)) {
      return responseData.data.data;
    }
  }

  return [];
};

export default function TokenReportingPage() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const [period, setPeriod] = useState("3m");
  const [tokenType, setTokenType] = useState("all");
  const [cardType, setCardType] = useState("all");

  const [applied, setApplied] = useState({
    period: "3m",
    tokenType: "all",
    cardType: "all",
  });

  const [tokens, setTokens] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // THEME DETECTION
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

  // FETCH REPORT DATA
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [tokenResponse, transactionResponse] = await Promise.all([
        api.get("/token/portal"),
        api.get("/transaction/portal"),
      ]);

      console.log("Token Portal Response:", tokenResponse.data);
      console.log("Transaction Portal Response:", transactionResponse.data);

      const tokenData = extractArray(tokenResponse.data, [
        "tokens",
        "token",
        "results",
        "items",
      ]);

      const transactionData = extractArray(transactionResponse.data, [
        "transactions",
        "transaction",
        "results",
        "items",
      ]);

      setTokens(tokenData);
      setTransactions(transactionData);
    } catch (error) {
      console.error("Failed to fetch token report:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load token reports.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // DATE RANGE
  const range = useMemo(() => {
    const now = new Date();

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (applied.period === "7d") {
      start.setDate(start.getDate() - 6);
    } else if (applied.period === "1m") {
      start.setMonth(start.getMonth() - 1);
    } else {
      start.setMonth(start.getMonth() - 3);
    }

    return { start, end };
  }, [applied.period]);

  // FILTER TOKENS
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const createdDate = getDateOnly(getTokenCreatedDate(token));

      if (!createdDate) return false;

      if (createdDate < range.start || createdDate > range.end) {
        return false;
      }

      const currentTokenType = getTokenType(token);
      const currentCardType = getCardType(token);

      if (
        applied.tokenType !== "all" &&
        currentTokenType !== applied.tokenType
      ) {
        return false;
      }

      if (applied.cardType !== "all" && currentCardType !== applied.cardType) {
        return false;
      }

      return true;
    });
  }, [tokens, applied, range]);

  // FILTER TOKEN IDS
  const filteredTokenIds = useMemo(
    () => new Set(filteredTokens.map((token) => String(getTokenId(token)))),
    [filteredTokens],
  );

  // FILTER TRANSACTIONS
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = getDateOnly(getTransactionDate(transaction));

      if (!transactionDate) return false;

      if (transactionDate < range.start || transactionDate > range.end) {
        return false;
      }

      const transactionTokenId = String(getTransactionTokenId(transaction));

      return filteredTokenIds.has(transactionTokenId);
    });
  }, [transactions, filteredTokenIds, range]);

  // STATISTICS
  const stats = useMemo(() => {
    const totalTokens = filteredTokens.length;

    const activeTokens = filteredTokens.filter(
      (token) => String(getTokenStatus(token)).toLowerCase() === "active",
    ).length;

    const inactiveTokens = totalTokens - activeTokens;
    const totalTransactions = filteredTransactions.length;

    const successfulTransactions = filteredTransactions.filter(
      (transaction) =>
        String(getTransactionStatus(transaction)).toLowerCase() === "success",
    ).length;

    const failedTransactions = totalTransactions - successfulTransactions;

    const totalVolume = filteredTransactions.reduce(
      (total, transaction) => total + getTransactionAmount(transaction),
      0,
    );

    const successRate =
      totalTransactions > 0
        ? (successfulTransactions / totalTransactions) * 100
        : 0;

    return {
      totalTokens,
      activeTokens,
      inactiveTokens,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      totalVolume,
      successRate,
    };
  }, [filteredTokens, filteredTransactions]);

  // TOP TOKENS
  const topTokens = useMemo(() => {
    const tokenMap = new Map();

    filteredTransactions.forEach((transaction) => {
      const tokenId = String(getTransactionTokenId(transaction));

      const current = tokenMap.get(tokenId) || 0;

      tokenMap.set(tokenId, current + getTransactionAmount(transaction));
    });

    return filteredTokens
      .map((token) => {
        const tokenId = String(getTokenId(token));

        return {
          ...token,
          reportTokenId: tokenId,
          volume: tokenMap.get(tokenId) || 0,
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
  }, [filteredTokens, filteredTransactions]);

  // TOKEN TYPE BREAKDOWN
  const tokenTypeBreakdown = useMemo(() => {
    const buckets = new Map();

    filteredTokens.forEach((token) => {
      const type = getTokenType(token) || "Unknown";

      buckets.set(type, (buckets.get(type) || 0) + 1);
    });

    const labels = Array.from(buckets.keys());
    const data = labels.map((label) => buckets.get(label));

    return { labels, data };
  }, [filteredTokens]);

  // DETAIL ROWS
  const tokenDetailRows = useMemo(() => {
    return filteredTokens
      .map((token) => {
        const tokenId = String(getTokenId(token));

        const tokenTransactions = filteredTransactions.filter(
          (transaction) =>
            String(getTransactionTokenId(transaction)) === tokenId,
        );

        const transactionCount = tokenTransactions.length;

        const successCount = tokenTransactions.filter(
          (transaction) =>
            String(getTransactionStatus(transaction)).toLowerCase() ===
            "success",
        ).length;

        const failedCount = transactionCount - successCount;

        const volume = tokenTransactions.reduce(
          (total, transaction) => total + getTransactionAmount(transaction),
          0,
        );

        const successRate =
          transactionCount > 0 ? (successCount / transactionCount) * 100 : 0;

        return {
          tokenId,
          tokenType: getTokenType(token) || "Unknown",
          cardType: getCardType(token) || "Unknown",
          tokenNumber: getTokenNumber(token) || "N/A",
          transactionCount,
          successCount,
          failedCount,
          successRate,
          volume,
          status: getTokenStatus(token),
          createdDate: getTokenCreatedDate(token),
        };
      })
      .sort((a, b) => b.volume - a.volume);
  }, [filteredTokens, filteredTransactions]);

  // CHART THEME COLORS
  const chartText = isDark ? "#cbd5e1" : "#334155";
  const chartMuted = isDark ? "#94a3b8" : "#64748b";
  const chartBorder = isDark ? "#334155" : "#e2e8f0";
  const chartCard = isDark ? "#0f172a" : "#ffffff";

  // BAR CHART DATA
  const barData = useMemo(
    () => ({
      labels: topTokens.map((token) => token.reportTokenId),
      datasets: [
        {
          label: "Transaction Volume",
          data: topTokens.map((token) => token.volume),

          backgroundColor: isDark
            ? "rgba(0, 166, 81, 0.65)"
            : "rgba(0, 166, 81, 0.55)",

          borderColor: isDark
            ? "rgba(34, 197, 94, 1)"
            : "rgba(0, 166, 81, 0.95)",

          borderWidth: 1,
          borderRadius: 10,
          maxBarThickness: 46,
        },
      ],
    }),
    [topTokens, isDark],
  );

  // BAR CHART OPTIONS
  const barOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,

      plugins: {
        legend: {
          labels: {
            color: chartText,
            boxWidth: 10,
          },
        },

        tooltip: {
          backgroundColor: chartCard,
          titleColor: chartText,
          bodyColor: chartText,
          borderColor: chartBorder,
          borderWidth: 1,
          padding: 10,
        },
      },

      scales: {
        x: {
          ticks: {
            color: chartMuted,
          },

          grid: {
            color: isDark
              ? "rgba(148,163,184,0.12)"
              : "rgba(100,116,139,0.15)",
          },

          border: {
            color: chartBorder,
          },
        },

        y: {
          beginAtZero: true,

          ticks: {
            color: chartMuted,
            callback: (value) =>
              `PKR ${Number(value).toLocaleString()}`,
          },

          grid: {
            color: isDark
              ? "rgba(148,163,184,0.12)"
              : "rgba(100,116,139,0.15)",
          },

          border: {
            color: chartBorder,
          },
        },
      },
    }),
    [isDark, chartText, chartMuted, chartBorder, chartCard],
  );

  // DONUT CHART DATA
  const donutData = useMemo(
    () => ({
      labels: tokenTypeBreakdown.labels,

      datasets: [
        {
          data: tokenTypeBreakdown.data,

          backgroundColor: [
            "rgba(0, 166, 81, 0.88)",
            "rgba(34, 197, 94, 0.82)",
            "rgba(16, 185, 129, 0.82)",
            "rgba(74, 222, 128, 0.82)",
            "rgba(5, 150, 105, 0.82)",
          ],

          borderColor: chartCard,
          borderWidth: 2,
          cutout: "70%",
        },
      ],
    }),
    [tokenTypeBreakdown, chartCard],
  );

  // DONUT CHART OPTIONS
  const donutOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            color: chartText,
            padding: 14,
            boxWidth: 10,
          },
        },

        tooltip: {
          backgroundColor: chartCard,
          titleColor: chartText,
          bodyColor: chartText,
          borderColor: chartBorder,
          borderWidth: 1,
          padding: 10,
        },
      },
    }),
    [chartText, chartCard, chartBorder],
  );

  // EXPORT CSV
  const handleExport = () => {
    if (!tokenDetailRows.length) {
      alert("No report data available to export.");
      return;
    }

    const headers = [
      "TokenID",
      "TokenType",
      // "CardType",
      "TokenNumber",
      "TransactionCount",
      "SuccessCount",
      "FailedCount",
      "SuccessRate(%)",
      "Volume(PKR)",
      "Status",
      "CreatedDate",
    ];

    const lines = [headers.join(",")];

    tokenDetailRows.forEach((token) => {
      const values = [
        JSON.stringify(token.tokenId),
        JSON.stringify(token.tokenType),
        JSON.stringify(token.cardType),
        JSON.stringify(token.tokenNumber),
        token.transactionCount,
        token.successCount,
        token.failedCount,
        token.successRate.toFixed(2),
        token.volume.toFixed(2),
        JSON.stringify(token.status),
        JSON.stringify(token.createdDate),
      ];

      lines.push(values.join(","));
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `token-reports_${toLocalYmd(new Date())}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const rangeLabel = `${toLocalYmd(range.start)} to ${toLocalYmd(range.end)}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 text-foreground">
      {/* BREADCRUMB */}
      <div className="mb-5 text-xs text-muted-foreground">
        Operations / Token /{" "}
        <span className="font-medium text-primary">Reports</span>
      </div>

      {/* HEADER */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Token Reports
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Token performance and transaction analytics
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Range: {rangeLabel}
          </p>
        </div>

        <Button
          type="button"
          label="Export CSV"
          icon="pi pi-download"
          iconPos="left"
          onClick={handleExport}
          disabled={loading || !tokenDetailRows.length}
          className="!rounded-xl !border !border-[#00A651]/30 !bg-[#00A651]/10 !px-4 !py-2.5 !text-xs !font-semibold !text-[#00A651] shadow-none transition-all duration-200 hover:!bg-[#00A651]/15"
        />
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <i className="pi pi-exclamation-circle text-rose-500" />

            <span className="text-sm text-rose-600 dark:text-rose-300">
              {errorMessage}
            </span>
          </div>

          <Button
            type="button"
            label="Retry"
            icon="pi pi-refresh"
            onClick={fetchReportData}
            loading={loading}
            className="!rounded-lg !border !border-rose-500/30 !bg-rose-500/10 !px-4 !py-2 !text-xs !font-semibold !text-rose-600 dark:!text-rose-300"
          />
        </div>
      )}

      {/* FILTERS */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00A651]/10 text-[#00A651]">
            <i className="pi pi-filter text-sm" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Report Filters
            </h2>

            <p className="text-xs text-muted-foreground">
              Select criteria and apply the report
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full lg:min-w-[190px] lg:flex-1">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Period
            </label>

            <Dropdown
              value={period}
              options={PERIOD_OPTIONS}
              onChange={(e) => setPeriod(e.value)}
              optionLabel="label"
              optionValue="value"
              panelClassName="theme-dropdown-panel"
              appendTo="self"
              className="w-full !rounded-xl !border !border-border !bg-background !text-sm !text-foreground shadow-none"
            />
          </div>

          <div className="w-full lg:min-w-[190px] lg:flex-1">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Token Type
            </label>

            <Dropdown
              value={tokenType}
              options={TOKEN_TYPE_OPTIONS}
              onChange={(e) => setTokenType(e.value)}
              optionLabel="label"
              optionValue="value"
              panelClassName="theme-dropdown-panel"
              appendTo="self"
              className="w-full !rounded-xl !border !border-border !bg-background !text-sm !text-foreground shadow-none"
            />
          </div>

          <div className="w-full lg:min-w-[190px] lg:flex-1">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Card Type
            </label>

            <Dropdown
              value={cardType}
              options={CARD_TYPE_OPTIONS}
              onChange={(e) => setCardType(e.value)}
              optionLabel="label"
              optionValue="value"
              panelClassName="theme-dropdown-panel"
              appendTo="self"
              className="w-full !rounded-xl !border !border-border !bg-background !text-sm !text-foreground shadow-none"
            />
          </div>

          <div className="flex w-full gap-2 lg:w-auto">
            <Button
              type="button"
              label="Apply"
              icon="pi pi-check"
              onClick={() =>
                setApplied({
                  period,
                  tokenType,
                  cardType,
                })
              }
              className="!rounded-xl !border !border-[#00A651]/30 !bg-[#00A651]/10 !px-5 !py-2.5 !text-xs !font-semibold !text-[#00A651] shadow-none hover:!bg-[#00A651]/15"
            />

            <Button
              type="button"
              icon="pi pi-refresh"
              label="Refresh"
              onClick={fetchReportData}
              loading={loading}
              className="!rounded-xl !border !border-border !bg-background !px-5 !py-2.5 !text-xs !font-semibold !text-foreground shadow-none hover:!bg-muted"
            />
          </div>
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <i className="pi pi-spin pi-spinner text-2xl text-[#00A651]" />

          <p className="mt-3 text-sm text-muted-foreground">
            Loading token reports...
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* STAT CARDS */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Tokens
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {stats.totalTokens}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Registered tokens
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
                  <i className="pi pi-credit-card" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Tokens
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {stats.activeTokens}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.inactiveTokens} inactive
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <i className="pi pi-check-circle" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transactions
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#00A651]">
                    {stats.totalTransactions}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.successfulTransactions} successful /{" "}
                    {stats.failedTransactions} failed
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
                  <i className="pi pi-chart-line" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Volume
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#00A651]">
                    PKR{" "}
                    {stats.totalVolume.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Success rate: {stats.successRate.toFixed(1)}%
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
                  <i className="pi pi-wallet" />
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300 lg:col-span-2">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-foreground">
                  Top Tokens by Transaction Volume
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Based on selected filters
                </p>
              </div>

              <div className="h-[280px]">
                {topTokens.length > 0 ? (
                  <Chart type="bar" data={barData} options={barOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    No transaction data available
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-foreground">
                  Token Type Breakdown
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Tokens by type
                </p>
              </div>

              <div className="h-[280px]">
                {tokenTypeBreakdown.labels.length > 0 ? (
                  <Chart
                    type="doughnut"
                    data={donutData}
                    options={donutOptions}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    No token data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOKEN DETAIL REPORT */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Token Detail Report
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Token-wise transaction performance
              </p>
            </div>

            <div
              className="overflow-hidden rounded-2xl border border-border"
              style={{
                backgroundColor: "hsl(var(--muted) / 0.3)",
              }}
            >
              <DataTable
                value={tokenDetailRows}
                dataKey="tokenId"
                rowHover
                size="small"
                scrollable
                scrollHeight="420px"
                emptyMessage="No tokens found"
                className="theme-datatable"
                tableStyle={{
                  minWidth: "1100px",
                }}
              >
                <Column
                  field="tokenId"
                  header="Token ID"
                  headerClassName="theme-table-header"
                  bodyClassName="theme-table-body"
                />

                <Column
                  field="tokenType"
                  header="Token Type"
                  headerClassName="theme-table-header"
                  bodyClassName="theme-table-body"
                />

                {/* <Column
                  field="cardType"
                  header="Card Type"
                  headerClassName="theme-table-header"
                  bodyClassName="theme-table-body"
                /> */}

                <Column
                  field="tokenNumber"
                  header="Token Number"
                  headerClassName="theme-table-header"
                  bodyClassName="theme-table-body"
                />

                <Column
                  field="transactionCount"
                  header="Transactions"
                  headerClassName="theme-table-header"
                  bodyClassName="theme-table-body"
                />

                <Column
                  field="successCount"
                  header="Success"
                  headerClassName="theme-table-header"
                  body={(row) => (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {row.successCount}
                    </span>
                  )}
                  bodyClassName="theme-table-body"
                />

                <Column
                  field="failedCount"
                  header="Failed"
                  headerClassName="theme-table-header"
                  body={(row) => (
                    <span className="font-medium text-rose-600 dark:text-rose-400">
                      {row.failedCount}
                    </span>
                  )}
                  bodyClassName="theme-table-body"
                />

                <Column
                  header="Success Rate"
                  headerClassName="theme-table-header"
                  body={(row) => (
                    <span className="font-medium text-foreground">
                      {row.successRate.toFixed(1)}%
                    </span>
                  )}
                  bodyClassName="theme-table-body"
                />

                <Column
                  header="Volume"
                  headerClassName="theme-table-header"
                  body={(row) => (
                    <span className="font-medium text-[#00A651]">
                      PKR{" "}
                      {Number(row.volume).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  )}
                  bodyClassName="theme-table-body"
                />

                <Column
                  header="Status"
                  headerClassName="theme-table-header"
                  body={(row) => {
                    const active =
                      String(row.status).toLowerCase() === "active";

                    return (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            active ? "bg-emerald-500" : "bg-muted-foreground"
                          }`}
                        />

                        {row.status}
                      </span>
                    );
                  }}
                  bodyClassName="theme-table-body"
                />

                <Column
                  field="createdDate"
                  header="Created Date"
                  headerClassName="theme-table-header"
                  body={(row) => {
                    const date = getDateOnly(row.createdDate);

                    return (
                      <span className="text-muted-foreground">
                        {date ? toLocalYmd(date) : "N/A"}
                      </span>
                    );
                  }}
                  bodyClassName="theme-table-body"
                />
              </DataTable>
            </div>
          </section>

          <style>{`
            /* =========================
               DATA TABLE
            ========================= */

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

            /* =========================
               PAGINATOR
            ========================= */

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
              background: rgba(0, 166, 81, 0.12) !important;
              color: #00A651 !important;
            }

            /* =========================
               TABLE PAGINATOR DROPDOWN
            ========================= */

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

            /* =========================
               FILTER DROPDOWN
            ========================= */

            .theme-dropdown-panel {
              background: hsl(var(--card)) !important;
              color: hsl(var(--foreground)) !important;
              border: 1px solid hsl(var(--border)) !important;
              border-radius: 10px !important;
              box-shadow: 0 10px 30px hsl(var(--foreground) / 0.12) !important;
            }

            .theme-dropdown-panel .p-dropdown-items {
              background: hsl(var(--card)) !important;
              color: hsl(var(--foreground)) !important;
              padding: 4px !important;
            }

            .theme-dropdown-panel .p-dropdown-item {
              background: transparent !important;
              color: hsl(var(--foreground)) !important;
              border-radius: 6px !important;
              padding: 0.65rem 0.75rem !important;
            }

            .theme-dropdown-panel .p-dropdown-item:hover {
              background: rgba(0, 166, 81, 0.06) !important;
              color: hsl(var(--foreground)) !important;
            }

            .theme-dropdown-panel .p-dropdown-item.p-highlight {
              background: rgba(0, 166, 81, 0.12) !important;
              color: #00A651 !important;
            }

            /* =========================
               TABLE SCROLLBAR
            ========================= */

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

            /* =========================
               EMPTY MESSAGE
            ========================= */

            .theme-datatable .p-datatable-emptymessage > tr > td {
              background: transparent !important;
              color: hsl(var(--muted-foreground)) !important;
              border-color: hsl(var(--border)) !important;
              text-align: center;
            }
          `}</style>
        </>
      )}
    </div>
  );
}