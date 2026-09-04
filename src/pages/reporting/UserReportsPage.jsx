import { useCallback, useEffect, useMemo, useState } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

// =====================================================
// DUMMY TOKEN DATA
// =====================================================

const TOKEN_DATA = [
  {
    id: 1,
    tokenId: "TKN-10001",
    tokenType: "Payment Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 4521",
    status: "Active",
    createdDate: "2026-06-15",
  },
  {
    id: 2,
    tokenId: "TKN-10002",
    tokenType: "Network Token",
    cardType: "Mastercard",
    tokenNumber: "**** **** **** 7834",
    status: "Active",
    createdDate: "2026-06-20",
  },
  {
    id: 3,
    tokenId: "TKN-10003",
    tokenType: "Device Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 2198",
    status: "Active",
    createdDate: "2026-07-02",
  },
  {
    id: 4,
    tokenId: "TKN-10004",
    tokenType: "Payment Token",
    cardType: "Mastercard",
    tokenNumber: "**** **** **** 6542",
    status: "Inactive",
    createdDate: "2026-07-10",
  },
  {
    id: 5,
    tokenId: "TKN-10005",
    tokenType: "Network Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 9187",
    status: "Active",
    createdDate: "2026-07-18",
  },
  {
    id: 6,
    tokenId: "TKN-10006",
    tokenType: "Device Token",
    cardType: "Mastercard",
    tokenNumber: "**** **** **** 3365",
    status: "Active",
    createdDate: "2026-07-25",
  },
  {
    id: 7,
    tokenId: "TKN-10007",
    tokenType: "Payment Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 7412",
    status: "Active",
    createdDate: "2026-08-01",
  },
  {
    id: 8,
    tokenId: "TKN-10008",
    tokenType: "Network Token",
    cardType: "Mastercard",
    tokenNumber: "**** **** **** 5821",
    status: "Inactive",
    createdDate: "2026-08-08",
  },
  {
    id: 9,
    tokenId: "TKN-10009",
    tokenType: "Device Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 4678",
    status: "Active",
    createdDate: "2026-08-15",
  },
  {
    id: 10,
    tokenId: "TKN-10010",
    tokenType: "Payment Token",
    cardType: "Mastercard",
    tokenNumber: "**** **** **** 8254",
    status: "Active",
    createdDate: "2026-08-22",
  },
];

// =====================================================
// DUMMY TRANSACTION DATA
// =====================================================

const TRANSACTION_DATA = [
  {
    id: 1,
    transactionId: "TXN-100001",
    tokenId: "TKN-10001",
    transactionType: "Payment",
    amount: 12500,
    status: "Success",
    responseCode: "00",
    date: "2026-06-18",
  },
  {
    id: 2,
    transactionId: "TXN-100002",
    tokenId: "TKN-10002",
    transactionType: "Sale",
    amount: 18500,
    status: "Success",
    responseCode: "00",
    date: "2026-06-21",
  },
  {
    id: 3,
    transactionId: "TXN-100003",
    tokenId: "TKN-10003",
    transactionType: "Payment",
    amount: 7200,
    status: "Failed",
    responseCode: "05",
    date: "2026-06-25",
  },
  {
    id: 4,
    transactionId: "TXN-100004",
    tokenId: "TKN-10004",
    transactionType: "Sale",
    amount: 25000,
    status: "Success",
    responseCode: "00",
    date: "2026-07-03",
  },
  {
    id: 5,
    transactionId: "TXN-100005",
    tokenId: "TKN-10005",
    transactionType: "Payment",
    amount: 15600,
    status: "Success",
    responseCode: "00",
    date: "2026-07-06",
  },
  {
    id: 6,
    transactionId: "TXN-100006",
    tokenId: "TKN-10006",
    transactionType: "Sale",
    amount: 9800,
    status: "Failed",
    responseCode: "05",
    date: "2026-07-09",
  },
  {
    id: 7,
    transactionId: "TXN-100007",
    tokenId: "TKN-10007",
    transactionType: "Payment",
    amount: 32000,
    status: "Success",
    responseCode: "00",
    date: "2026-07-12",
  },
  {
    id: 8,
    transactionId: "TXN-100008",
    tokenId: "TKN-10008",
    transactionType: "Sale",
    amount: 11400,
    status: "Success",
    responseCode: "00",
    date: "2026-07-15",
  },
  {
    id: 9,
    transactionId: "TXN-100009",
    tokenId: "TKN-10009",
    transactionType: "Payment",
    amount: 22100,
    status: "Success",
    responseCode: "00",
    date: "2026-07-18",
  },
  {
    id: 10,
    transactionId: "TXN-100010",
    tokenId: "TKN-10010",
    transactionType: "Sale",
    amount: 17800,
    status: "Failed",
    responseCode: "05",
    date: "2026-07-22",
  },
  {
    id: 11,
    transactionId: "TXN-100011",
    tokenId: "TKN-10001",
    transactionType: "Payment",
    amount: 14500,
    status: "Success",
    responseCode: "00",
    date: "2026-07-25",
  },
  {
    id: 12,
    transactionId: "TXN-100012",
    tokenId: "TKN-10002",
    transactionType: "Sale",
    amount: 28600,
    status: "Success",
    responseCode: "00",
    date: "2026-07-28",
  },
  {
    id: 13,
    transactionId: "TXN-100013",
    tokenId: "TKN-10003",
    transactionType: "Payment",
    amount: 9300,
    status: "Success",
    responseCode: "00",
    date: "2026-08-02",
  },
  {
    id: 14,
    transactionId: "TXN-100014",
    tokenId: "TKN-10004",
    transactionType: "Sale",
    amount: 19800,
    status: "Failed",
    responseCode: "05",
    date: "2026-08-04",
  },
  {
    id: 15,
    transactionId: "TXN-100015",
    tokenId: "TKN-10005",
    transactionType: "Payment",
    amount: 35200,
    status: "Success",
    responseCode: "00",
    date: "2026-08-06",
  },
  {
    id: 16,
    transactionId: "TXN-100016",
    tokenId: "TKN-10006",
    transactionType: "Sale",
    amount: 12400,
    status: "Success",
    responseCode: "00",
    date: "2026-08-09",
  },
  {
    id: 17,
    transactionId: "TXN-100017",
    tokenId: "TKN-10007",
    transactionType: "Payment",
    amount: 27500,
    status: "Success",
    responseCode: "00",
    date: "2026-08-11",
  },
  {
    id: 18,
    transactionId: "TXN-100018",
    tokenId: "TKN-10008",
    transactionType: "Sale",
    amount: 8500,
    status: "Failed",
    responseCode: "05",
    date: "2026-08-13",
  },
  {
    id: 19,
    transactionId: "TXN-100019",
    tokenId: "TKN-10009",
    transactionType: "Payment",
    amount: 41800,
    status: "Success",
    responseCode: "00",
    date: "2026-08-17",
  },
  {
    id: 20,
    transactionId: "TXN-100020",
    tokenId: "TKN-10010",
    transactionType: "Sale",
    amount: 22400,
    status: "Success",
    responseCode: "00",
    date: "2026-08-20",
  },
  {
    id: 21,
    transactionId: "TXN-100021",
    tokenId: "TKN-10001",
    transactionType: "Payment",
    amount: 18900,
    status: "Success",
    responseCode: "00",
    date: "2026-08-22",
  },
  {
    id: 22,
    transactionId: "TXN-100022",
    tokenId: "TKN-10002",
    transactionType: "Sale",
    amount: 31500,
    status: "Success",
    responseCode: "00",
    date: "2026-08-24",
  },
  {
    id: 23,
    transactionId: "TXN-100023",
    tokenId: "TKN-10003",
    transactionType: "Payment",
    amount: 7600,
    status: "Failed",
    responseCode: "05",
    date: "2026-08-25",
  },
  {
    id: 24,
    transactionId: "TXN-100024",
    tokenId: "TKN-10005",
    transactionType: "Sale",
    amount: 26700,
    status: "Success",
    responseCode: "00",
    date: "2026-08-27",
  },
  {
    id: 25,
    transactionId: "TXN-100025",
    tokenId: "TKN-10007",
    transactionType: "Payment",
    amount: 38200,
    status: "Success",
    responseCode: "00",
    date: "2026-08-29",
  },
  {
    id: 26,
    transactionId: "TXN-100026",
    tokenId: "TKN-10009",
    transactionType: "Sale",
    amount: 14500,
    status: "Failed",
    responseCode: "05",
    date: "2026-08-30",
  },
  {
    id: 27,
    transactionId: "TXN-100027",
    tokenId: "TKN-10001",
    transactionType: "Payment",
    amount: 22000,
    status: "Success",
    responseCode: "00",
    date: "2026-09-01",
  },
  {
    id: 28,
    transactionId: "TXN-100028",
    tokenId: "TKN-10002",
    transactionType: "Sale",
    amount: 18500,
    status: "Success",
    responseCode: "00",
    date: "2026-09-01",
  },
  {
    id: 29,
    transactionId: "TXN-100029",
    tokenId: "TKN-10003",
    transactionType: "Payment",
    amount: 9200,
    status: "Success",
    responseCode: "00",
    date: "2026-09-01",
  },
  {
    id: 30,
    transactionId: "TXN-100030",
    tokenId: "TKN-10005",
    transactionType: "Sale",
    amount: 33200,
    status: "Success",
    responseCode: "00",
    date: "2026-09-01",
  },
  {
    id: 31,
    transactionId: "TXN-100031",
    tokenId: "TKN-10006",
    transactionType: "Payment",
    amount: 12700,
    status: "Failed",
    responseCode: "05",
    date: "2026-09-02",
  },
  {
    id: 32,
    transactionId: "TXN-100032",
    tokenId: "TKN-10007",
    transactionType: "Sale",
    amount: 29800,
    status: "Success",
    responseCode: "00",
    date: "2026-09-02",
  },
  {
    id: 33,
    transactionId: "TXN-100033",
    tokenId: "TKN-10009",
    transactionType: "Payment",
    amount: 45500,
    status: "Success",
    responseCode: "00",
    date: "2026-09-02",
  },
  {
    id: 34,
    transactionId: "TXN-100034",
    tokenId: "TKN-10010",
    transactionType: "Sale",
    amount: 16400,
    status: "Success",
    responseCode: "00",
    date: "2026-09-02",
  },
  {
    id: 35,
    transactionId: "TXN-100035",
    tokenId: "TKN-10004",
    transactionType: "Payment",
    amount: 11800,
    status: "Failed",
    responseCode: "05",
    date: "2026-09-02",
  },
  {
    id: 36,
    transactionId: "TXN-100036",
    tokenId: "TKN-10008",
    transactionType: "Sale",
    amount: 8900,
    status: "Success",
    responseCode: "00",
    date: "2026-09-02",
  },
];

// =====================================================
// HELPERS
// =====================================================

const formatAmount = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";

  return `"${String(value).replace(/"/g, '""')}"`;
};

// =====================================================
// COMPONENT
// =====================================================

export default function TransactionReportsPage() {
  // ===================================================
  // THEME DETECTION
  // ===================================================

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

  // ===================================================
  // TOKEN + TRANSACTION SUMMARY
  // ===================================================

  const tokenStats = useMemo(() => {
    const total = TOKEN_DATA.length;

    const active = TOKEN_DATA.filter(
      (token) => token.status === "Active",
    ).length;

    const inactive = total - active;

    const paymentTokens = TOKEN_DATA.filter(
      (token) => token.tokenType === "Payment Token",
    ).length;

    const networkTokens = TOKEN_DATA.filter(
      (token) => token.tokenType === "Network Token",
    ).length;

    const deviceTokens = TOKEN_DATA.filter(
      (token) => token.tokenType === "Device Token",
    ).length;

    return {
      total,
      active,
      inactive,
      paymentTokens,
      networkTokens,
      deviceTokens,
    };
  }, []);

  const transactionStats = useMemo(() => {
    const total = TRANSACTION_DATA.length;

    const successful = TRANSACTION_DATA.filter(
      (tx) => tx.status === "Success",
    ).length;

    const failed = TRANSACTION_DATA.filter(
      (tx) => tx.status === "Failed",
    ).length;

    const volume = TRANSACTION_DATA.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    const successRate = total ? (successful / total) * 100 : 0;

    return {
      total,
      successful,
      failed,
      volume,
      successRate,
    };
  }, []);

  // ===================================================
  // TOKEN TRANSACTION SUMMARY
  // ===================================================

  const tokenSummary = useMemo(() => {
    return TOKEN_DATA.map((token) => {
      const transactions = TRANSACTION_DATA.filter(
        (tx) => tx.tokenId === token.tokenId,
      );

      const totalTransactions = transactions.length;

      const successfulTransactions = transactions.filter(
        (tx) => tx.status === "Success",
      ).length;

      const volume = transactions.reduce(
        (sum, tx) => sum + Number(tx.amount || 0),
        0,
      );

      const averageTransaction =
        totalTransactions > 0 ? volume / totalTransactions : 0;

      const successRate =
        totalTransactions > 0
          ? (successfulTransactions / totalTransactions) * 100
          : 0;

      return {
        ...token,
        transactions: totalTransactions,
        successfulTransactions,
        failedTransactions: totalTransactions - successfulTransactions,
        volume,
        averageTransaction,
        successRate,
      };
    }).sort((a, b) => b.volume - a.volume);
  }, []);

  // ===================================================
  // MONTHLY TRANSACTION TREND
  // ===================================================

  const monthlyTrend = useMemo(() => {
    const months = [
      { key: "2026-06", label: "Jun 2026" },
      { key: "2026-07", label: "Jul 2026" },
      { key: "2026-08", label: "Aug 2026" },
      { key: "2026-09", label: "Sep 2026" },
    ];

    const counts = months.map(
      (month) =>
        TRANSACTION_DATA.filter((tx) => tx.date.startsWith(month.key)).length,
    );

    const volumes = months.map((month) =>
      TRANSACTION_DATA.filter((tx) => tx.date.startsWith(month.key)).reduce(
        (sum, tx) => sum + Number(tx.amount || 0),
        0,
      ),
    );

    return {
      labels: months.map((month) => month.label),
      counts,
      volumes,
    };
  }, []);

  // ===================================================
  // TRANSACTION TREND CHART
  // ===================================================

  const transactionTrendData = useMemo(
    () => ({
      labels: monthlyTrend.labels,
      datasets: [
        {
          label: "Transactions",
          data: monthlyTrend.counts,
          tension: 0.35,
          fill: true,
          borderColor: "rgba(34,211,238,0.9)",
          backgroundColor: "rgba(34,211,238,0.12)",
          pointRadius: 4,
          pointHoverRadius: 5,
        },
      ],
    }),
    [monthlyTrend],
  );

  // ===================================================
  // TRANSACTION STATUS CHART
  // ===================================================

  const transactionStatusData = useMemo(
    () => ({
      labels: ["Successful", "Failed"],
      datasets: [
        {
          data: [transactionStats.successful, transactionStats.failed],
          backgroundColor: ["rgba(52,211,153,0.9)", "rgba(244,63,94,0.9)"],
          borderWidth: 0,
        },
      ],
    }),
    [transactionStats],
  );

  // ===================================================
  // TOKEN TYPE CHART
  // ===================================================

  const tokenTypeData = useMemo(
    () => ({
      labels: ["Payment Token", "Network Token", "Device Token"],
      datasets: [
        {
          data: [
            tokenStats.paymentTokens,
            tokenStats.networkTokens,
            tokenStats.deviceTokens,
          ],
          backgroundColor: [
            "rgba(14,165,233,0.9)",
            "rgba(168,85,247,0.9)",
            "rgba(245,158,11,0.9)",
          ],
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 2,
          cutout: "72%",
        },
      ],
    }),
    [tokenStats, isDark],
  );

  // ===================================================
  // TOP TOKENS CHART
  // ===================================================

  const topTokens = useMemo(() => tokenSummary.slice(0, 10), [tokenSummary]);

  const topTokenData = useMemo(
    () => ({
      labels: topTokens.map((token) => token.tokenId),
      datasets: [
        {
          label: "Transaction Volume",
          data: topTokens.map((token) => token.volume),
          backgroundColor: "rgba(139,92,246,0.75)",
          borderRadius: 6,
        },
      ],
    }),
    [topTokens],
  );

  // ===================================================
  // CHART OPTIONS
  // ===================================================

  const lineChartOptions = useMemo(() => {
    const textColor = isDark ? "#cbd5e1" : "#334155";
    const mutedColor = isDark ? "#94a3b8" : "#64748b";
    const borderColor = isDark ? "#334155" : "#e2e8f0";
    const cardColor = isDark ? "#0f172a" : "#ffffff";
    const gridColor = isDark
      ? "rgba(148,163,184,0.12)"
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
          backgroundColor: cardColor,
          titleColor: textColor,
          bodyColor: textColor,
          borderColor,
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
          beginAtZero: true,
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
    const textColor = isDark ? "#cbd5e1" : "#334155";
    const borderColor = isDark ? "#334155" : "#e2e8f0";
    const cardColor = isDark ? "#0f172a" : "#ffffff";

    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            boxWidth: 10,
            boxHeight: 10,
            padding: 14,
          },
        },
        tooltip: {
          backgroundColor: cardColor,
          titleColor: textColor,
          bodyColor: textColor,
          borderColor,
          borderWidth: 1,
        },
      },
      layout: {
        padding: {
          bottom: 15,
        },
      },
    };
  }, [isDark]);

  const barChartOptions = useMemo(() => {
    const textColor = isDark ? "#cbd5e1" : "#334155";
    const mutedColor = isDark ? "#94a3b8" : "#64748b";
    const borderColor = isDark ? "#334155" : "#e2e8f0";
    const cardColor = isDark ? "#0f172a" : "#ffffff";
    const gridColor = isDark
      ? "rgba(148,163,184,0.12)"
      : "rgba(100,116,139,0.15)";

    return {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          backgroundColor: cardColor,
          titleColor: textColor,
          bodyColor: textColor,
          borderColor,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: mutedColor,
            callback: (value) => `PKR ${Number(value).toLocaleString()}`,
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
            display: false,
          },
        },
      },
    };
  }, [isDark]);

  // ===================================================
  // BADGES
  // ===================================================

  const statusBadge = useCallback((row) => {
    const success = String(row?.status).toLowerCase() === "success";

    return (
      <span
        className={
          success
            ? "inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            : "inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400"
        }
      >
        <span
          className={
            success
              ? "h-2 w-2 rounded-full bg-emerald-500"
              : "h-2 w-2 rounded-full bg-rose-500"
          }
        />
        {row?.status}
      </span>
    );
  }, []);

  const tokenStatusBadge = useCallback((row) => {
    const active = String(row?.status).toLowerCase() === "active";

    return (
      <span
        className={
          active
            ? "inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            : "inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
        }
      >
        <span
          className={
            active
              ? "h-2 w-2 rounded-full bg-emerald-500"
              : "h-2 w-2 rounded-full bg-muted-foreground"
          }
        />
        {row?.status}
      </span>
    );
  }, []);

  const tokenTypeBadge = useCallback((row) => {
    return (
      <span className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
        {row?.tokenType}
      </span>
    );
  }, []);

  // ===================================================
  // CSV EXPORT
  // ===================================================

  const handleExport = useCallback(() => {
    const headers = [
      "Token ID",
      "Token Type",
      "Card Type",
      "Token Number",
      "Transactions",
      "Successful",
      "Failed",
      "Volume",
      "Average Transaction",
      "Success Rate",
      "Status",
    ];

    const lines = [headers.join(",")];

    tokenSummary.forEach((token) => {
      const values = [
        csvEscape(token.tokenId),
        csvEscape(token.tokenType),
        csvEscape(token.cardType),
        csvEscape(token.tokenNumber),
        csvEscape(token.transactions),
        csvEscape(token.successfulTransactions),
        csvEscape(token.failedTransactions),
        csvEscape(token.volume.toFixed(2)),
        csvEscape(token.averageTransaction.toFixed(2)),
        csvEscape(`${token.successRate.toFixed(1)}%`),
        csvEscape(token.status),
      ];

      lines.push(values.join(","));
    });

    const csv = lines.join("\n");

    const blob = new Blob(["\ufeff", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `token-transaction-report-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, [tokenSummary]);

  // ===================================================
  // TABLE CLASSES
  // ===================================================

  const tableHeaderClass =
    "!border-0 !bg-transparent px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";
  const tableBodyClass =
    "px-4 py-3 !border-0 border-t border-border text-sm text-foreground";

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Breadcrumb */}

      <div className="mb-5 text-xs text-muted-foreground">
        Reports /{" "}
        <span className="text-sky-600 dark:text-sky-400">
          Transaction Report
        </span>
      </div>

      {/* HEADER */}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Token & Transaction Report
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Complete overview of tokens and transaction activity
          </p>
        </div>

        <Button type="button" label="Export CSV" icon="pi pi-download" iconPos="left" onClick={handleExport} className="!rounded-xl !border !border-primary/30 !bg-primary/10 !px-4 !py-2.5 !text-xs !font-semibold !text-primary shadow-none transition-all duration-200 hover:!bg-primary/15 disabled:!cursor-not-allowed disabled:!opacity-50" />
      </div>

      {/* TOKEN STATS */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Tokens
          </div>
          <div className="mt-3 text-2xl font-semibold text-sky-600 dark:text-sky-400">
            {tokenStats.total.toLocaleString()}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Tokens
          </div>
          <div className="mt-3 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {tokenStats.active.toLocaleString()}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Transactions
          </div>
          <div className="mt-3 text-2xl font-semibold text-violet-600 dark:text-violet-400">
            {transactionStats.total.toLocaleString()}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Transaction Volume
          </div>
          <div className="mt-3 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {formatAmount(transactionStats.volume)}
          </div>
        </article>
      </section>

      {/* TRANSACTION STATS */}

      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Successful Transactions
          </div>
          <div className="mt-3 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {transactionStats.successful.toLocaleString()}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Failed Transactions
          </div>
          <div className="mt-3 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {transactionStats.failed.toLocaleString()}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Success Rate
          </div>
          <div className="mt-3 text-2xl font-semibold text-sky-600 dark:text-sky-400">
            {transactionStats.successRate.toFixed(1)}%
          </div>
        </article>
      </section>

      {/* CHARTS */}

      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="text-sm font-semibold text-foreground">
            Monthly Transaction Activity
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Transaction count for the last four months
          </p>

          <div className="mt-4 h-[280px]">
            <Chart
              type="line"
              data={transactionTrendData}
              options={lineChartOptions}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="text-sm font-semibold text-foreground">
            Transaction Status
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Successful vs failed transactions
          </p>

          <div className="mt-4 h-[280px]">
            <Chart
              type="doughnut"
              data={transactionStatusData}
              options={donutOptions}
            />
          </div>
        </article>
      </section>

      {/* TOKEN CHARTS */}

      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="text-sm font-semibold text-foreground">
            Token Type Distribution
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Distribution of issued tokens
          </p>

          <div className="mt-4 h-[280px]">
            <Chart
              type="doughnut"
              data={tokenTypeData}
              options={donutOptions}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
          <div className="text-sm font-semibold text-foreground">
            Top Tokens by Transaction Volume
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Tokens generating the highest transaction volume
          </p>

          <div className="mt-4 h-[280px]">
            <Chart type="bar" data={topTokenData} options={barChartOptions} />
          </div>
        </article>
      </section>

      {/* TOKEN PERFORMANCE TABLE */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
        <div className="mb-4">
          <div className="text-sm font-semibold text-foreground">
            Token Performance Summary
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Transaction performance by token
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <DataTable
            value={tokenSummary}
            dataKey="tokenId"
            className="!bg-transparent"
            tableClassName="!bg-transparent"
            rowHover
            size="small"
            responsiveLayout="scroll"
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            paginatorClassName="!border-0 !bg-transparent border-t border-border"
            emptyMessage="No token data found"
          >
            <Column
              field="tokenId"
              header="Token ID"
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} text-sky-600 dark:text-sky-400`}
            />

            <Column
              field="tokenType"
              header="Token Type"
              body={tokenTypeBadge}
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />

            <Column
              field="cardType"
              header="Card Type"
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />

            <Column
              field="tokenNumber"
              header="Token Number"
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} text-muted-foreground`}
            />

            <Column
              field="transactions"
              header="Transactions"
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />

            <Column
              field="volume"
              header="Volume"
              body={(row) => formatAmount(row?.volume)}
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} font-semibold text-amber-600 dark:text-amber-400`}
            />

            <Column
              field="averageTransaction"
              header="Avg Txn"
              body={(row) => formatAmount(row?.averageTransaction)}
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />

            <Column
              field="successRate"
              header="Success %"
              body={(row) => `${Number(row?.successRate || 0).toFixed(1)}%`}
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} text-emerald-600 dark:text-emerald-400`}
            />

            <Column
              field="status"
              header="Status"
              body={tokenStatusBadge}
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />
          </DataTable>
        </div>
      </section>

      {/* TRANSACTION DETAIL TABLE */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
        <div className="mb-4">
          <div className="text-sm font-semibold text-foreground">
            Transaction Details
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Complete token transaction activity
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <DataTable
            value={TRANSACTION_DATA}
            dataKey="transactionId"
            className="!bg-transparent"
            tableClassName="!bg-transparent"
            rowHover
            size="small"
            responsiveLayout="scroll"
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            paginatorClassName="!border-0 !bg-transparent border-t border-border"
            emptyMessage="No transactions found"
          >
            <Column
              field="transactionId"
              header="Transaction ID"
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} text-sky-600 dark:text-sky-400`}
            />

            <Column
              field="date"
              header="Date"
              body={(row) => formatDate(row?.date)}
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} text-muted-foreground`}
            />

            <Column
              field="tokenId"
              header="Token ID"
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} text-violet-600 dark:text-violet-400`}
            />

            <Column
              field="transactionType"
              header="Transaction Type"
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />

            <Column
              field="amount"
              header="Amount"
              body={(row) => formatAmount(row?.amount)}
              headerClassName={tableHeaderClass}
              bodyClassName={`${tableBodyClass} font-semibold text-amber-600 dark:text-amber-400`}
            />

            <Column
              field="responseCode"
              header="Response Code"
              body={(row) => (
                <span
                  className={
                    row?.responseCode === "00"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }
                >
                  {row?.responseCode}
                </span>
              )}
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />

            <Column
              field="status"
              header="Status"
              body={statusBadge}
              headerClassName={tableHeaderClass}
              bodyClassName={tableBodyClass}
            />
          </DataTable>
        </div>
      </section>
    </div>
  );
}
