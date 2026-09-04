import { useMemo, useState, useEffect, useCallback } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

/* =========================================================
   HELPERS
========================================================= */

const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (key) => {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    },
  );
};

const parseAmount = (value) => {
  if (typeof value === "number") return value;
  return Number(String(value).replace(/[^0-9.-]+/g, "")) || 0;
};

const csvEscape = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/* =========================================================
   DUMMY TOKEN DATA
========================================================= */

const TOKEN_ROWS = [
  {
    id: 1,
    TokenID: "TKN-10001",
    TokenType: "Payment Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 4521",
    Status: "Active",
    CreatedDate: "2026-06-05",
  },
  {
    id: 2,
    TokenID: "TKN-10002",
    TokenType: "Payment Token",
    CardType: "Mastercard",
    TokenNumber: "**** **** **** 7832",
    Status: "Active",
    CreatedDate: "2026-06-12",
  },
  {
    id: 3,
    TokenID: "TKN-10003",
    TokenType: "Network Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 1124",
    Status: "Inactive",
    CreatedDate: "2026-06-20",
  },
  {
    id: 4,
    TokenID: "TKN-10004",
    TokenType: "Payment Token",
    CardType: "Mastercard",
    TokenNumber: "**** **** **** 9921",
    Status: "Active",
    CreatedDate: "2026-07-02",
  },
  {
    id: 5,
    TokenID: "TKN-10005",
    TokenType: "Network Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 6721",
    Status: "Active",
    CreatedDate: "2026-07-10",
  },
  {
    id: 6,
    TokenID: "TKN-10006",
    TokenType: "Payment Token",
    CardType: "Mastercard",
    TokenNumber: "**** **** **** 3301",
    Status: "Active",
    CreatedDate: "2026-07-18",
  },
  {
    id: 7,
    TokenID: "TKN-10007",
    TokenType: "Payment Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 8845",
    Status: "Inactive",
    CreatedDate: "2026-07-25",
  },
  {
    id: 8,
    TokenID: "TKN-10008",
    TokenType: "Network Token",
    CardType: "Mastercard",
    TokenNumber: "**** **** **** 2298",
    Status: "Active",
    CreatedDate: "2026-08-01",
  },
  {
    id: 9,
    TokenID: "TKN-10009",
    TokenType: "Payment Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 5402",
    Status: "Active",
    CreatedDate: "2026-08-08",
  },
  {
    id: 10,
    TokenID: "TKN-10010",
    TokenType: "Network Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 7632",
    Status: "Active",
    CreatedDate: "2026-08-15",
  },
  {
    id: 11,
    TokenID: "TKN-10011",
    TokenType: "Payment Token",
    CardType: "Mastercard",
    TokenNumber: "**** **** **** 1458",
    Status: "Active",
    CreatedDate: "2026-08-21",
  },
  {
    id: 12,
    TokenID: "TKN-10012",
    TokenType: "Payment Token",
    CardType: "Visa",
    TokenNumber: "**** **** **** 9187",
    Status: "Inactive",
    CreatedDate: "2026-08-28",
  },
];

/* =========================================================
   DUMMY TRANSACTION DATA
========================================================= */

const TX_ROWS = [
  {
    id: 1,
    TokenID: "TKN-10001",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 12500,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-06-06",
  },
  {
    id: 2,
    TokenID: "TKN-10002",
    TransactionType: "Purchase",
    CardType: "Mastercard",
    Amount: 18900,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-06-08",
  },
  {
    id: 3,
    TokenID: "TKN-10003",
    TransactionType: "Refund",
    CardType: "Visa",
    Amount: 5400,
    Status: "Failed",
    RiskLevel: "Medium",
    CreatedDate: "2026-06-15",
  },
  {
    id: 4,
    TokenID: "TKN-10004",
    TransactionType: "Purchase",
    CardType: "Mastercard",
    Amount: 22500,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-07-03",
  },
  {
    id: 5,
    TokenID: "TKN-10005",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 15600,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-07-05",
  },
  {
    id: 6,
    TokenID: "TKN-10006",
    TransactionType: "Refund",
    CardType: "Mastercard",
    Amount: 4200,
    Status: "Success",
    RiskLevel: "Medium",
    CreatedDate: "2026-07-11",
  },
  {
    id: 7,
    TokenID: "TKN-10007",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 31000,
    Status: "Failed",
    RiskLevel: "High",
    CreatedDate: "2026-07-19",
  },
  {
    id: 8,
    TokenID: "TKN-10008",
    TransactionType: "Purchase",
    CardType: "Mastercard",
    Amount: 27500,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-07-22",
  },
  {
    id: 9,
    TokenID: "TKN-10009",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 19800,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-07-29",
  },
  {
    id: 10,
    TokenID: "TKN-10010",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 22400,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-02",
  },
  {
    id: 11,
    TokenID: "TKN-10011",
    TransactionType: "Refund",
    CardType: "Mastercard",
    Amount: 6500,
    Status: "Success",
    RiskLevel: "Medium",
    CreatedDate: "2026-08-05",
  },
  {
    id: 12,
    TokenID: "TKN-10012",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 34500,
    Status: "Failed",
    RiskLevel: "High",
    CreatedDate: "2026-08-09",
  },
  {
    id: 13,
    TokenID: "TKN-10001",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 16700,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-12",
  },
  {
    id: 14,
    TokenID: "TKN-10002",
    TransactionType: "Purchase",
    CardType: "Mastercard",
    Amount: 28800,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-15",
  },
  {
    id: 15,
    TokenID: "TKN-10004",
    TransactionType: "Refund",
    CardType: "Mastercard",
    Amount: 7800,
    Status: "Success",
    RiskLevel: "Medium",
    CreatedDate: "2026-08-18",
  },
  {
    id: 16,
    TokenID: "TKN-10005",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 41200,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-21",
  },
  {
    id: 17,
    TokenID: "TKN-10006",
    TransactionType: "Purchase",
    CardType: "Mastercard",
    Amount: 23500,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-23",
  },
  {
    id: 18,
    TokenID: "TKN-10008",
    TransactionType: "Purchase",
    CardType: "Mastercard",
    Amount: 19200,
    Status: "Failed",
    RiskLevel: "High",
    CreatedDate: "2026-08-25",
  },
  {
    id: 19,
    TokenID: "TKN-10009",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 26700,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-27",
  },
  {
    id: 20,
    TokenID: "TKN-10010",
    TransactionType: "Purchase",
    CardType: "Visa",
    Amount: 31800,
    Status: "Success",
    RiskLevel: "Low",
    CreatedDate: "2026-08-29",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function PortfolioReportPage() {
  const [tokenRows] = useState(TOKEN_ROWS);
  const [txRows] = useState(TX_ROWS);

  /* =======================================================
     THEME DETECTION
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
     MONTH DATA
  ======================================================= */

  const monthKeys = useMemo(() => {
    const keys = new Set();

    txRows.forEach((row) => {
      keys.add(monthKey(row.CreatedDate));
    });

    return Array.from(keys).sort();
  }, [txRows]);

  const monthLabels = useMemo(
    () => monthKeys.map((key) => formatMonthLabel(key)),
    [monthKeys],
  );

  /* =======================================================
     LAST 3 MONTHS
  ======================================================= */

  const lastThreeMonthKeys = useMemo(() => monthKeys.slice(-3), [monthKeys]);

  const filteredTxRows = useMemo(
    () =>
      txRows.filter((row) =>
        lastThreeMonthKeys.includes(monthKey(row.CreatedDate)),
      ),
    [txRows, lastThreeMonthKeys],
  );

  /* =======================================================
     TOKEN TRANSACTION STATS
  ======================================================= */

  const tokenPerformanceRows = useMemo(() => {
    return tokenRows.map((token) => {
      const transactions = filteredTxRows.filter(
        (tx) => tx.TokenID === token.TokenID,
      );

      const successful = transactions.filter((tx) => tx.Status === "Success");

      const failed = transactions.filter((tx) => tx.Status === "Failed");

      const volume = transactions.reduce(
        (sum, tx) => sum + parseAmount(tx.Amount),
        0,
      );

      const successRate =
        transactions.length > 0
          ? (successful.length / transactions.length) * 100
          : 0;

      return {
        ...token,
        Transactions: transactions.length,
        Successful: successful.length,
        Failed: failed.length,
        Volume: volume,
        SuccessRate: successRate,
      };
    });
  }, [tokenRows, filteredTxRows]);

  /* =======================================================
     TOKEN DISTRIBUTION
  ======================================================= */

  const tokenDistribution = useMemo(() => {
    const counts = {};

    tokenRows.forEach((token) => {
      counts[token.TokenType] = (counts[token.TokenType] || 0) + 1;
    });

    return counts;
  }, [tokenRows]);

  /* =======================================================
     MONTHLY TRANSACTION SERIES
  ======================================================= */

  const monthlyTransactionSeries = useMemo(() => {
    return lastThreeMonthKeys.map((key) => {
      const rows = filteredTxRows.filter(
        (tx) => monthKey(tx.CreatedDate) === key,
      );

      const volume = rows.reduce((sum, tx) => sum + parseAmount(tx.Amount), 0);

      const successful = rows.filter((tx) => tx.Status === "Success").length;

      const failed = rows.filter((tx) => tx.Status === "Failed").length;

      return {
        key,
        label: formatMonthLabel(key),
        volume,
        transactions: rows.length,
        successful,
        failed,
      };
    });
  }, [filteredTxRows, lastThreeMonthKeys]);

  /* =======================================================
     TRANSACTION TYPE MIX
  ======================================================= */

  const transactionTypeMix = useMemo(() => {
    const result = {};

    filteredTxRows.forEach((tx) => {
      result[tx.TransactionType] = (result[tx.TransactionType] || 0) + 1;
    });

    return result;
  }, [filteredTxRows]);

  /* =======================================================
     CARD TYPE MIX
  ======================================================= */

  const cardTypeMix = useMemo(() => {
    const result = {};

    filteredTxRows.forEach((tx) => {
      result[tx.CardType] = (result[tx.CardType] || 0) + 1;
    });

    return result;
  }, [filteredTxRows]);

  /* =======================================================
     SUMMARY STATS
  ======================================================= */

  const stats = useMemo(() => {
    const totalTokens = tokenRows.length;

    const activeTokens = tokenRows.filter(
      (token) => token.Status === "Active",
    ).length;

    const totalTransactions = filteredTxRows.length;

    const successfulTransactions = filteredTxRows.filter(
      (tx) => tx.Status === "Success",
    ).length;

    const failedTransactions = filteredTxRows.filter(
      (tx) => tx.Status === "Failed",
    ).length;

    const totalVolume = filteredTxRows.reduce(
      (sum, tx) => sum + parseAmount(tx.Amount),
      0,
    );

    const successRate =
      totalTransactions > 0
        ? (successfulTransactions / totalTransactions) * 100
        : 0;

    return {
      totalTokens,
      activeTokens,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      totalVolume,
      successRate,
    };
  }, [tokenRows, filteredTxRows]);

  /* =======================================================
     CHART COLORS
  ======================================================= */

  const chartTextColor = isDark ? "#cbd5e1" : "#475569";
  const chartMutedColor = isDark ? "#94a3b8" : "#64748b";
  const chartGridColor = isDark
    ? "rgba(148,163,184,0.12)"
    : "rgba(100,116,139,0.15)";

  const tooltipBackground = isDark
    ? "rgba(15,23,42,0.96)"
    : "rgba(255,255,255,0.98)";

  const tooltipTextColor = isDark ? "#f8fafc" : "#0f172a";

  /* =======================================================
     COMBO CHART
  ======================================================= */

  const comboChartData = useMemo(
    () => ({
      labels: monthLabels.slice(-3),
      datasets: [
        {
          type: "bar",
          label: "Transaction Volume",
          data: monthlyTransactionSeries.map((item) => item.volume),
          backgroundColor: "rgba(139,92,246,0.45)",
          borderColor: "#8b5cf6",
          borderWidth: 1,
          borderRadius: 8,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Successful",
          data: monthlyTransactionSeries.map((item) => item.successful),
          borderColor: "#10b981",
          backgroundColor: "#10b981",
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: "y1",
        },
        {
          type: "line",
          label: "Failed",
          data: monthlyTransactionSeries.map((item) => item.failed),
          borderColor: "#f43f5e",
          backgroundColor: "#f43f5e",
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: "y1",
        },
      ],
    }),
    [monthLabels, monthlyTransactionSeries],
  );

  const comboChartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            color: chartTextColor,
            usePointStyle: true,
            padding: 18,
          },
        },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          borderColor: isDark
            ? "rgba(148,163,184,0.2)"
            : "rgba(100,116,139,0.2)",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        x: {
          ticks: {
            color: chartMutedColor,
          },
          grid: {
            color: chartGridColor,
            drawBorder: false,
          },
        },
        y: {
          beginAtZero: true,
          position: "left",
          ticks: {
            color: chartMutedColor,
            callback: (value) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value),
          },
          grid: {
            color: chartGridColor,
            drawBorder: false,
          },
        },
        y1: {
          beginAtZero: true,
          position: "right",
          ticks: {
            color: chartMutedColor,
            precision: 0,
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    }),
    [
      chartTextColor,
      chartMutedColor,
      chartGridColor,
      tooltipBackground,
      tooltipTextColor,
      isDark,
    ],
  );

  /* =======================================================
     TOP TOKEN BAR
  ======================================================= */

  const topTokenBarData = useMemo(() => {
    const sorted = [...tokenPerformanceRows]
      .sort((a, b) => b.Volume - a.Volume)
      .slice(0, 8);

    return {
      labels: sorted.map((token) => token.TokenID),
      datasets: [
        {
          label: "Volume",
          data: sorted.map((token) => token.Volume),
          backgroundColor: "rgba(139,92,246,0.65)",
          borderColor: "#8b5cf6",
          borderWidth: 1,
          borderRadius: 7,
        },
      ],
    };
  }, [tokenPerformanceRows]);

  const topTokenBarOptions = useMemo(
    () => ({
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          borderColor: isDark
            ? "rgba(148,163,184,0.2)"
            : "rgba(100,116,139,0.2)",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: chartMutedColor,
            callback: (value) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value),
          },
          grid: {
            color: chartGridColor,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: chartMutedColor,
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    [
      tooltipBackground,
      tooltipTextColor,
      chartMutedColor,
      chartGridColor,
      isDark,
    ],
  );

  /* =======================================================
     TOKEN DONUT
  ======================================================= */

  const tokenDonutData = useMemo(
    () => ({
      labels: Object.keys(tokenDistribution),
      datasets: [
        {
          data: Object.values(tokenDistribution),
          backgroundColor: ["#06b6d4", "#8b5cf6", "#10b981"],
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 3,
        },
      ],
    }),
    [tokenDistribution, isDark],
  );

  /* =======================================================
     TRANSACTION TYPE DONUT
  ======================================================= */

  const transactionTypeData = useMemo(
    () => ({
      labels: Object.keys(transactionTypeMix),
      datasets: [
        {
          data: Object.values(transactionTypeMix),
          backgroundColor: ["#06b6d4", "#f59e0b", "#8b5cf6", "#10b981"],
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 3,
        },
      ],
    }),
    [transactionTypeMix, isDark],
  );

  /* =======================================================
     CARD TYPE DONUT
  ======================================================= */

  const cardTypeData = useMemo(
    () => ({
      labels: Object.keys(cardTypeMix),
      datasets: [
        {
          data: Object.values(cardTypeMix),
          backgroundColor: ["#8b5cf6", "#06b6d4"],
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 3,
        },
      ],
    }),
    [cardTypeMix, isDark],
  );

  /* =======================================================
     DONUT OPTIONS
  ======================================================= */

  const donutOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: chartTextColor,
            usePointStyle: true,
            padding: 18,
          },
        },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          borderColor: isDark
            ? "rgba(148,163,184,0.2)"
            : "rgba(100,116,139,0.2)",
          borderWidth: 1,
          padding: 12,
        },
      },
    }),
    [chartTextColor, tooltipBackground, tooltipTextColor, isDark],
  );

  /* =======================================================
     FORMATTERS
  ======================================================= */

  const moneyCompact = useCallback((value) => {
    const amount = parseAmount(value);

    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }, []);

  const statusPill = useCallback((status) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        {status}
      </span>
    );
  }, []);

  const transactionStatusPill = useCallback((status) => {
    if (status === "Success") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400">
        {status}
      </span>
    );
  }, []);

  const riskPill = useCallback((risk) => {
    if (risk === "Low") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {risk}
        </span>
      );
    }

    if (risk === "Medium") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          {risk}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400">
        {risk}
      </span>
    );
  }, []);

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const exportCSV = useCallback(() => {
    const headers = [
      "Token ID",
      "Token Type",
      "Card Type",
      "Token Number",
      "Status",
      "Created Date",
      "Transactions",
      "Successful",
      "Failed",
      "Volume",
      "Success Rate",
    ];

    const rows = tokenPerformanceRows.map((row) => [
      row.TokenID,
      row.TokenType,
      row.CardType,
      row.TokenNumber,
      row.Status,
      row.CreatedDate,
      row.Transactions,
      row.Successful,
      row.Failed,
      row.Volume,
      `${row.SuccessRate.toFixed(1)}%`,
    ]);

    const csv = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "portfolio-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }, [tokenPerformanceRows]);

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const tokenColumns = useMemo(
    () => [
      {
        field: "TokenID",
        header: "Token ID",
      },
      {
        field: "TokenType",
        header: "Token Type",
      },
      {
        field: "CardType",
        header: "Card Type",
      },
      {
        field: "TokenNumber",
        header: "Token Number",
      },
      {
        field: "Status",
        header: "Status",
        body: (row) => statusPill(row.Status),
      },
      {
        field: "CreatedDate",
        header: "Created Date",
        body: (row) => (
          <span className="text-muted-foreground">{row.CreatedDate}</span>
        ),
      },
    ],
    [statusPill],
  );

  const transactionColumns = useMemo(
    () => [
      {
        field: "TokenID",
        header: "Token ID",
      },
      {
        field: "TransactionType",
        header: "Type",
      },
      {
        field: "CardType",
        header: "Card Type",
      },
      {
        field: "Amount",
        header: "Amount",
        body: (row) => (
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            Rs. {row.Amount.toLocaleString()}
          </span>
        ),
      },
      {
        field: "Status",
        header: "Status",
        body: (row) => transactionStatusPill(row.Status),
      },
      {
        field: "RiskLevel",
        header: "Risk",
        body: (row) => riskPill(row.RiskLevel),
      },
      {
        field: "CreatedDate",
        header: "Created Date",
        body: (row) => (
          <span className="text-muted-foreground">{row.CreatedDate}</span>
        ),
      },
    ],
    [transactionStatusPill, riskPill],
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Portfolio Report
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Overview of token portfolio and transaction performance for the
              last 3 months.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors duration-200 hover:bg-muted"
          >
            Export CSV
          </button>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Tokens
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTokens}
              </p>

              <span className="rounded-lg bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                Portfolio
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Tokens
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">
                {stats.activeTokens}
              </p>

              <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transactions
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTransactions}
              </p>

              <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                3 Months
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transaction Volume
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">
                Rs. {moneyCompact(stats.totalVolume)}
              </p>

              <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                Volume
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Success Rate
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">
                {stats.successRate.toFixed(1)}%
              </p>

              <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Success
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN COMBO CHART
        ================================================= */}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Transaction Performance
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Monthly transaction volume and success/failure activity.
            </p>
          </div>

          <div className="h-[350px]">
            <Chart
              type="bar"
              data={comboChartData}
              options={comboChartOptions}
              className="h-full"
            />
          </div>
        </section>

        {/* =================================================
            DONUT CHARTS
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Token Distribution
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Distribution by token type.
              </p>
            </div>

            <div className="h-[280px]">
              <Chart
                type="doughnut"
                data={tokenDonutData}
                options={donutOptions}
                className="h-full"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Transaction Type
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Transaction activity by type.
              </p>
            </div>

            <div className="h-[280px]">
              <Chart
                type="doughnut"
                data={transactionTypeData}
                options={donutOptions}
                className="h-full"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Card Type Mix
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Transaction distribution by card network.
              </p>
            </div>

            <div className="h-[280px]">
              <Chart
                type="doughnut"
                data={cardTypeData}
                options={donutOptions}
                className="h-full"
              />
            </div>
          </section>
        </div>

        {/* =================================================
            TOP TOKENS
        ================================================= */}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Top Tokens by Volume
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tokens generating the highest transaction volume.
            </p>
          </div>

          <div className="h-[360px]">
            <Chart
              type="bar"
              data={topTokenBarData}
              options={topTokenBarOptions}
              className="h-full"
            />
          </div>
        </section>

        {/* =================================================
            TOKEN TABLE
        ================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Token Portfolio
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Current token inventory and status.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <DataTable
                value={tokenRows}
                dataKey="id"
                className="!bg-transparent"
                tableClassName="!bg-transparent"
                rowHover
                size="small"
                responsiveLayout="scroll"
                paginator
                rows={50}
                rowsPerPageOptions={[25, 50, 100, 200]}
                paginatorClassName="!border-0 !bg-transparent border-t border-border"
                emptyMessage="No tokens found"
              >
                {tokenColumns.map((column) => (
                  <Column
                    key={column.field}
                    field={column.field}
                    header={column.header}
                    body={column.body}
                    headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                    bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                  />
                ))}
              </DataTable>
            </div>
          </div>
        </section>

        {/* =================================================
            TOKEN PERFORMANCE TABLE
        ================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Token Performance
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Transaction and volume performance for each token.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <DataTable
                value={tokenPerformanceRows}
                dataKey="id"
                className="!bg-transparent"
                tableClassName="!bg-transparent"
                rowHover
                size="small"
                responsiveLayout="scroll"
                paginator
                rows={50}
                rowsPerPageOptions={[25, 50, 100, 200]}
                paginatorClassName="!border-0 !bg-transparent border-t border-border"
                emptyMessage="No performance data found"
              >
                <Column
                  field="TokenID"
                  header="Token ID"
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm font-medium text-foreground"
                />

                <Column
                  field="TokenType"
                  header="Token Type"
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="Transactions"
                  header="Transactions"
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="Successful"
                  header="Successful"
                  body={(row) => (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {row.Successful}
                    </span>
                  )}
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="Failed"
                  header="Failed"
                  body={(row) => (
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {row.Failed}
                    </span>
                  )}
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="Volume"
                  header="Volume"
                  body={(row) => (
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      Rs. {row.Volume.toLocaleString()}
                    </span>
                  )}
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="SuccessRate"
                  header="Success Rate"
                  body={(row) => (
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      {row.SuccessRate.toFixed(1)}%
                    </span>
                  )}
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="Status"
                  header="Status"
                  body={(row) => statusPill(row.Status)}
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />

                <Column
                  field="CreatedDate"
                  header="Created Date"
                  body={(row) => (
                    <span className="text-muted-foreground">
                      {row.CreatedDate}
                    </span>
                  )}
                  headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                />
              </DataTable>
            </div>
          </div>
        </section>

        {/* =================================================
            TRANSACTION TABLE
        ================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Transactions included in the current 3-month reporting period.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <DataTable
                value={filteredTxRows}
                dataKey="id"
                className="!bg-transparent"
                tableClassName="!bg-transparent"
                rowHover
                size="small"
                responsiveLayout="scroll"
                paginator
                rows={50}
                rowsPerPageOptions={[25, 50, 100, 200]}
                paginatorClassName="!border-0 !bg-transparent border-t border-border"
                emptyMessage="No transactions found"
              >
                {transactionColumns.map((column) => (
                  <Column
                    key={column.field}
                    field={column.field}
                    header={column.header}
                    body={column.body}
                    headerClassName="!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                    bodyClassName="px-4 py-3 !border-0 border-t border-border text-sm text-foreground"
                  />
                ))}
              </DataTable>
            </div>
          </div>
        </section>

        {/* =================================================
            MONTHLY SUMMARY
        ================================================= */}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Monthly Summary
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Month-by-month transaction overview.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Month
                  </th>

                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transactions
                  </th>

                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Successful
                  </th>

                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Failed
                  </th>

                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Volume
                  </th>

                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Success Rate
                  </th>
                </tr>
              </thead>

              <tbody>
                {monthlyTransactionSeries.map((item) => {
                  const rate =
                    item.transactions > 0
                      ? (item.successful / item.transactions) * 100
                      : 0;

                  return (
                    <tr
                      key={item.key}
                      className="transition-colors duration-200 hover:bg-muted/50"
                    >
                      <td className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
                        {item.label}
                      </td>

                      <td className="border-b border-border px-4 py-3 text-sm text-foreground">
                        {item.transactions}
                      </td>

                      <td className="border-b border-border px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.successful}
                      </td>

                      <td className="border-b border-border px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
                        {item.failed}
                      </td>

                      <td className="border-b border-border px-4 py-3 text-sm font-semibold text-violet-600 dark:text-violet-400">
                        Rs. {item.volume.toLocaleString()}
                      </td>

                      <td className="border-b border-border px-4 py-3 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                        {rate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
