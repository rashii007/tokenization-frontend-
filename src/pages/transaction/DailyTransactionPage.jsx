import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const API_BASE_URL = "http://203.175.74.144:8000/api";

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";

  return `"${String(value).replace(/"/g, '""')}"`;
};

const downloadCsv = ({ rows, columns, filename }) => {
  const headers = columns.map(
    (column) => column.header ?? column.field,
  );

  const valueGetters = columns.map(
    (column) =>
      column.value ?? ((row) => row?.[column.field]),
  );

  const lines = [headers.map(csvEscape).join(",")];

  rows.forEach((row) => {
    const values = valueGetters.map((getValue) =>
      csvEscape(getValue(row)),
    );

    lines.push(values.join(","));
  });

  const csv = lines.join("\n");

  const blob = new Blob(["\ufeff", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};

const getTransactionDate = (row) => {
  if (!row?.date) return "";

  const parsed = new Date(row.date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return row.date;
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
  if (status === "Success") {
    return "inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300";
  }

  if (status === "Failed") {
    return "inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300";
  }

  return "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground";
};

const getResponseData = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export default function TokenDailyTransactionsPage() {
  const [rows, setRows] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tokenId, setTokenId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const tableScrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [transactionResponse, tokenResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/transaction/portal`),
            axios.get(`${API_BASE_URL}/token/portal`),
          ]);

        const transactionData =
          getResponseData(transactionResponse);

        const tokenData =
          getResponseData(tokenResponse);

        if (!mounted) return;

        setRows(transactionData);
        setTokens(tokenData);
      } catch (err) {
        console.error(
          "Token Daily Transactions API Error:",
          err,
        );

        if (!mounted) return;

        setRows([]);
        setTokens([]);

        if (err?.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err?.response?.status) {
          setError(`API Error: ${err.response.status}`);
        } else {
          setError(
            "Unable to fetch data from server. Please check API/CORS.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const tokenById = useMemo(() => {
    const map = new Map();

    tokens.forEach((token) => {
      const id =
        token?.tokenId ??
        token?.token_id ??
        token?.id;

      if (id !== undefined && id !== null) {
        map.set(String(id), token);
      }
    });

    return map;
  }, [tokens]);

  const tokenOptions = useMemo(
    () => [
      {
        label: "All Tokens",
        value: "",
      },
      ...tokens.map((token) => {
        const id =
          token?.tokenId ??
          token?.token_id ??
          token?.id;

        return {
          label: String(id ?? "-"),
          value: String(id ?? ""),
        };
      }),
    ],
    [tokens],
  );

  const statusOptions = useMemo(
    () => [
      {
        label: "All Status",
        value: "",
      },
      {
        label: "Success",
        value: "Success",
      },
      {
        label: "Failed",
        value: "Failed",
      },
    ],
    [],
  );

  const transactionTypeOptions = useMemo(
    () => [
      {
        label: "All Types",
        value: "",
      },
      {
        label: "Sale",
        value: "Sale",
      },
      {
        label: "Payment",
        value: "Payment",
      },
    ],
    [],
  );

  const createdAtRange = useMemo(() => {
    if (
      !(startDate instanceof Date) &&
      !(endDate instanceof Date)
    ) {
      return {
        startYmd: null,
        endYmd: null,
      };
    }

    const toLocalYmd = (date) => {
      const year = date.getFullYear();
      const month = String(
        date.getMonth() + 1,
      ).padStart(2, "0");
      const day = String(
        date.getDate(),
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    let startYmd =
      startDate instanceof Date
        ? toLocalYmd(startDate)
        : null;

    let endYmd =
      endDate instanceof Date
        ? toLocalYmd(endDate)
        : null;

    if (
      startYmd &&
      endYmd &&
      endYmd < startYmd
    ) {
      const temp = startYmd;
      startYmd = endYmd;
      endYmd = temp;
    }

    return {
      startYmd,
      endYmd,
    };
  }, [startDate, endDate]);

  const filteredRows = useMemo(() => {
    const selectedToken = String(
      tokenId ?? "",
    ).trim();

    const selectedStatus = String(
      transactionStatus ?? "",
    ).trim();

    const selectedType = String(
      transactionType ?? "",
    ).trim();

    const { startYmd, endYmd } =
      createdAtRange;

    if (
      !selectedToken &&
      !selectedStatus &&
      !selectedType &&
      !startYmd &&
      !endYmd
    ) {
      return rows;
    }

    return rows.filter((row) => {
      if (!row || typeof row !== "object") {
        return false;
      }

      const rowTokenId = String(
        row?.tokenId ??
          row?.token_id ??
          row?.token?.tokenId ??
          row?.token?.id ??
          "",
      ).trim();

      const rowStatus = String(
        row?.status ??
          row?.transactionStatus ??
          "",
      ).trim();

      const rowType = String(
        row?.transactionType ??
          row?.type ??
          "",
      ).trim();

      if (
        selectedToken &&
        rowTokenId !== selectedToken
      ) {
        return false;
      }

      if (
        selectedStatus &&
        rowStatus !== selectedStatus
      ) {
        return false;
      }

      if (
        selectedType &&
        rowType !== selectedType
      ) {
        return false;
      }

      if (startYmd || endYmd) {
        const transactionDate =
          getTransactionDate(row);

        if (!transactionDate) {
          return false;
        }

        if (
          startYmd &&
          transactionDate < startYmd
        ) {
          return false;
        }

        if (
          endYmd &&
          transactionDate > endYmd
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    rows,
    tokenId,
    transactionStatus,
    transactionType,
    createdAtRange,
  ]);

  const filteredTotalAmount = useMemo(
    () =>
      filteredRows.reduce((total, row) => {
        const amount = Number(
          row?.amount ??
            row?.transactionAmount ??
            row?.txnAmount ??
            0,
        );

        return (
          total +
          (Number.isFinite(amount)
            ? amount
            : 0)
        );
      }, 0),
    [filteredRows],
  );

  const columns = useMemo(
    () => [
      {
        field: "date",
        header: "Transaction Date",
        value: (row) =>
          getTransactionDate(row) ||
          row?.createdAt ||
          row?.transactionDate ||
          "-",
      },
      {
        field: "transactionId",
        header: "Transaction ID",
        value: (row) =>
          row?.transactionId ??
          row?.transaction_id ??
          row?.id ??
          "-",
      },
      {
        field: "tokenId",
        header: "Token ID",
        value: (row) =>
          row?.tokenId ??
          row?.token_id ??
          row?.token?.tokenId ??
          row?.token?.id ??
          "-",
      },
      {
        field: "tokenType",
        header: "Token Type",
        value: (row) => {
          const id =
            row?.tokenId ??
            row?.token_id ??
            row?.token?.tokenId ??
            row?.token?.id;

          const token =
            tokenById.get(String(id));

          return (
            token?.tokenType ??
            token?.token_type ??
            row?.tokenType ??
            "-"
          );
        },
      },
      {
        field: "tokenNumber",
        header: "Token Number",
        value: (row) => {
          const id =
            row?.tokenId ??
            row?.token_id ??
            row?.token?.tokenId ??
            row?.token?.id;

          const token =
            tokenById.get(String(id));

          return (
            token?.tokenNumber ??
            token?.token_number ??
            row?.tokenNumber ??
            "-"
          );
        },
      },
      {
        field: "transactionType",
        header: "Transaction Type",
        value: (row) =>
          row?.transactionType ??
          row?.type ??
          "-",
      },
      {
        field: "amount",
        header: "Amount",
        value: (row) =>
          formatAmount(
            row?.amount ??
              row?.transactionAmount ??
              row?.txnAmount ??
              0,
          ),
      },
      {
        field: "status",
        header: "Status",
        value: (row) =>
          row?.status ??
          row?.transactionStatus ??
          "-",
      },
      {
        field: "responseCode",
        header: "Response Code",
        value: (row) =>
          row?.responseCode ??
          row?.response_code ??
          "-",
      },
      {
        field: "tokenStatus",
        header: "Token Status",
        value: (row) => {
          const id =
            row?.tokenId ??
            row?.token_id ??
            row?.token?.tokenId ??
            row?.token?.id;

          return (
            tokenById.get(String(id))
              ?.status ?? "-"
          );
        },
      },
    ],
    [tokenById],
  );

  const handleDownloadCsv = () => {
    const now = new Date();

    const yyyy = now.getFullYear();

    const mm = String(
      now.getMonth() + 1,
    ).padStart(2, "0");

    const dd = String(
      now.getDate(),
    ).padStart(2, "0");

    const filename =
      `token-daily-transactions_${yyyy}-${mm}-${dd}.csv`;

    downloadCsv({
      rows: filteredRows,
      columns,
      filename,
    });
  };

  const handleScrollTable = (direction) => {
    const root = tableScrollRef.current;

    if (!root) return;

    const scrollEl =
      root.querySelector(
        ".p-datatable-wrapper",
      ) ||
      root.querySelector(
        ".p-datatable-scrollable-body",
      ) ||
      root;

    if (!scrollEl) return;

    if (
      scrollEl.scrollWidth <=
      scrollEl.clientWidth
    ) {
      return;
    }

    const amount = Math.max(
      240,
      Math.floor(
        scrollEl.clientWidth * 0.8,
      ),
    );

    scrollEl.scrollBy({
      left:
        direction === "right"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  };

  const handleClearFilters = () => {
    setTokenId("");
    setTransactionStatus("");
    setTransactionType("");
    setStartDate(null);
    setEndDate(null);
  };

  const inputClassName = [
    "h-10",
    "w-full",
    "rounded-xl",
    "border",
    "border-border",
    "bg-background",
    "px-3",
    "text-sm",
    "text-foreground",
    "placeholder:text-muted-foreground",
    "outline-none",
    "transition",
  ].join(" ");

  return (
    <div
      className="token-daily-page min-h-full w-full transition-colors duration-300"
      style={{
        backgroundColor:
          "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 text-xs text-muted-foreground">
          Reports
          <span className="mx-2">/</span>
          Token Daily Transactions
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Token Daily Transactions
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Daily token transaction report
            </p>
          </div>

          <Button
            type="button"
            label="Export CSV"
            icon="pi pi-download"
            iconPos="left"
            onClick={handleDownloadCsv}
            disabled={
              loading ||
              !filteredRows.length
            }
            className="!rounded-xl !border !border-[#00A651]/30 !bg-[#00A651]/10 !px-4 !py-2.5 !text-xs !font-semibold !text-[#00A651] !shadow-none transition-all duration-200 hover:!bg-[#00A651]/15 dark:!text-[#36C58A] disabled:!cursor-not-allowed disabled:!opacity-50"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Summary */}
        <section
          className="relative mb-5 overflow-hidden rounded-2xl border border-border px-5 py-4 shadow-sm backdrop-blur"
          style={{
            backgroundColor:
              "hsl(var(--card) / 0.7)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,166,81,0.06), transparent 55%, rgba(36,181,207,0.05))",
            }}
          />

          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Transactions
              </p>

              <p className="mt-1 text-xl font-semibold text-foreground">
                {loading
                  ? "..."
                  : filteredRows.length.toLocaleString()}
              </p>
            </div>

            <div className="hidden h-8 w-px bg-border sm:block" />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Amount
              </p>

              <p className="mt-1 text-xl font-semibold text-[#00A651] dark:text-[#36C58A]">
                {loading
                  ? "..."
                  : formatAmount(
                      filteredTotalAmount,
                    )}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00A651] dark:bg-[#36C58A]" />
        </section>

        {/* Filters */}
        <section
          className="mb-5 rounded-2xl border border-border p-5 shadow-sm"
          style={{
            backgroundColor:
              "hsl(var(--card) / 0.7)",
          }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Filters
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Filter transactions by date, token, type and status
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
              {/* Start Date */}
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Start Date
                </label>

                <Calendar
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.value)
                  }
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="theme-page-calendar w-full"
                  inputClassName={
                    inputClassName
                  }
                  panelClassName="theme-calendar-panel"
                  appendTo="self"
                />
              </div>

              {/* End Date */}
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  End Date
                </label>

                <Calendar
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.value)
                  }
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="theme-page-calendar w-full"
                  inputClassName={
                    inputClassName
                  }
                  panelClassName="theme-calendar-panel"
                  appendTo="self"
                />
              </div>

              {/* Token */}
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Token
                </label>

                <Dropdown
                  value={tokenId}
                  options={tokenOptions}
                  onChange={(e) =>
                    setTokenId(e.value)
                  }
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select token"
                  panelClassName="theme-dropdown-panel"
                  appendTo="self"
                  className="theme-page-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
                  disabled={loading}
                />
              </div>

              {/* Transaction Type */}
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transaction Type
                </label>

                <Dropdown
                  value={transactionType}
                  options={
                    transactionTypeOptions
                  }
                  onChange={(e) =>
                    setTransactionType(
                      e.value,
                    )
                  }
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select type"
                  panelClassName="theme-dropdown-panel"
                  appendTo="self"
                  className="theme-page-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
                  disabled={loading}
                />
              </div>

              {/* Transaction Status */}
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transaction Status
                </label>

                <Dropdown
                  value={
                    transactionStatus
                  }
                  options={statusOptions}
                  onChange={(e) =>
                    setTransactionStatus(
                      e.value,
                    )
                  }
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                  panelClassName="theme-dropdown-panel"
                  appendTo="self"
                  className="theme-page-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
                  disabled={loading}
                />
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={
                    handleClearFilters
                  }
                  className="h-10 w-full rounded-xl border border-border bg-muted px-4 text-xs font-semibold text-foreground transition hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 lg:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Table Controls */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Transaction Records
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Showing filtered transaction data
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleScrollTable(
                  "left",
                )
              }
              className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[#00A651]/20"
              aria-label="Scroll table left"
            >
              {"<"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleScrollTable(
                  "right",
                )
              }
              className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[#00A651]/20"
              aria-label="Scroll table right"
            >
              {">"}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <section
          ref={tableScrollRef}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <DataTable
            value={filteredRows}
            dataKey="id"
            className="theme-datatable"
            loading={loading}
            scrollable
            scrollHeight="60vh"
            tableStyle={{
              minWidth: "1200px",
            }}
            paginator
            rows={50}
            rowsPerPageOptions={[
              25,
              50,
              100,
              200,
            ]}
            emptyMessage={
              loading
                ? "Loading transactions..."
                : "No transactions found"
            }
            rowHover
            size="small"
          >
            {columns.map((column) => {
              const commonProps = {
                key: column.field,
                field: column.field,
                header: column.header,
                headerClassName:
                  "theme-table-header",
                bodyClassName:
                  "theme-table-body",
              };

              if (
                column.field ===
                "status"
              ) {
                return (
                  <Column
                    {...commonProps}
                    body={(row) => {
                      const status =
                        row?.status ??
                        row?.transactionStatus ??
                        "-";

                      return (
                        <span
                          className={getStatusClass(
                            status,
                          )}
                        >
                          {status}
                        </span>
                      );
                    }}
                  />
                );
              }

              if (
                column.field ===
                "tokenStatus"
              ) {
                return (
                  <Column
                    {...commonProps}
                    body={(row) => {
                      const id =
                        row?.tokenId ??
                        row?.token_id ??
                        row?.token?.tokenId ??
                        row?.token?.id;

                      const status =
                        tokenById.get(
                          String(id),
                        )?.status ?? "-";

                      const statusClass =
                        status === "Active"
                          ? "inline-flex items-center rounded-full border border-[#00A651]/20 bg-[#00A651]/10 px-2.5 py-1 text-xs font-semibold text-[#00A651] dark:text-[#36C58A]"
                          : "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground";

                      return (
                        <span
                          className={
                            statusClass
                          }
                        >
                          {status}
                        </span>
                      );
                    }}
                  />
                );
              }

              if (
                typeof column.value ===
                "function"
              ) {
                return (
                  <Column
                    {...commonProps}
                    body={(row) =>
                      column.value(
                        row,
                      )
                    }
                  />
                );
              }

              return (
                <Column
                  {...commonProps}
                />
              );
            })}
          </DataTable>
        </section>
      </div>

      <style>{`
        .token-daily-page
          .theme-page-calendar,
        .token-daily-page
          .theme-page-dropdown {
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .token-daily-page
          .theme-page-calendar
          .p-inputtext:hover,
        .token-daily-page
          .theme-page-dropdown:hover {
          border-color: rgba(
            0,
            166,
            81,
            0.55
          ) !important;
        }

        .token-daily-page
          .theme-page-calendar.p-calendar:focus-within
          .p-inputtext,
        .token-daily-page
          .theme-page-calendar.p-calendar:focus-within
          .p-datepicker-trigger,
        .token-daily-page
          .theme-page-dropdown.p-focus {
          border-color: rgba(
            0,
            166,
            81,
            0.65
          ) !important;

          box-shadow:
            0 0 0 3px
            rgba(
              0,
              166,
              81,
              0.12
            ) !important;

          outline: none !important;
        }

        /* =========================
           DATATABLE
        ========================= */

        .theme-datatable
          .p-datatable-table {
          background: transparent !important;
        }

        .theme-datatable
          .p-datatable-thead
          > tr
          > th {
          background: hsl(var(--muted)) !important;
          color: hsl(
            var(--muted-foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;

          padding: 0.75rem 1rem !important;

          font-size: 10px !important;
          font-weight: 600 !important;

          text-transform: uppercase;
          letter-spacing: 0.05em;

          white-space: nowrap;
        }

        .theme-datatable
          .p-datatable-tbody
          > tr {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;

          transition:
            background-color 0.2s ease;
        }

        .theme-datatable
          .p-datatable-tbody
          > tr
          > td {
          background: transparent !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;

          padding: 0.75rem 1rem !important;

          font-size: 0.875rem !important;
        }

        .theme-datatable
          .p-datatable-tbody
          > tr:nth-child(even) {
          background: hsl(
            var(--muted) / 0.35
          ) !important;
        }

        .theme-datatable
          .p-datatable-tbody
          > tr:hover {
          background: hsl(
            var(--primary) / 0.08
          ) !important;
        }

        /* =========================
           PAGINATOR
        ========================= */

        .theme-datatable
          .p-paginator {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;
        }

        .theme-datatable
          .p-paginator
          .p-paginator-page,
        .theme-datatable
          .p-paginator
          .p-paginator-first,
        .theme-datatable
          .p-paginator
          .p-paginator-prev,
        .theme-datatable
          .p-paginator
          .p-paginator-next,
        .theme-datatable
          .p-paginator
          .p-paginator-last {
          color: hsl(
            var(--foreground)
          ) !important;

          background: transparent !important;

          border-radius: 0.5rem !important;
        }

        .theme-datatable
          .p-paginator
          .p-paginator-element:hover {
          background: hsl(
            var(--muted)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;
        }

        .theme-datatable
          .p-paginator
          .p-paginator-page.p-highlight {
          background: rgba(
            0,
            166,
            81,
            0.15
          ) !important;

          color: #00a651 !important;
        }

        /* =========================
           PAGINATOR DROPDOWN
        ========================= */

        .theme-datatable
          .p-paginator
          .p-dropdown {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;
        }

        .theme-datatable
          .p-paginator
          .p-dropdown-label {
          color: hsl(
            var(--foreground)
          ) !important;

          background: transparent !important;
        }

        .theme-datatable
          .p-paginator
          .p-dropdown-trigger {
          color: hsl(
            var(--muted-foreground)
          ) !important;

          background: transparent !important;
        }

        /* =========================
           DROPDOWN PANEL
        ========================= */

        .theme-dropdown-panel {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border: 1px solid
            hsl(var(--border)) !important;

          border-radius: 10px !important;

          box-shadow:
            0 10px 30px
            hsl(
              var(--foreground) / 0.12
            ) !important;
        }

        .theme-dropdown-panel
          .p-dropdown-items-wrapper {
          background: hsl(
            var(--card)
          ) !important;
        }

        .theme-dropdown-panel
          .p-dropdown-items {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          padding: 4px !important;
        }

        .theme-dropdown-panel
          .p-dropdown-item {
          background: transparent !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-radius: 6px !important;

          padding: 0.65rem 0.75rem !important;
        }

        .theme-dropdown-panel
          .p-dropdown-item:hover {
          background: hsl(
            var(--muted)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;
        }

        .theme-dropdown-panel
          .p-dropdown-item.p-highlight {
          background: rgba(
            0,
            166,
            81,
            0.12
          ) !important;

          color: #00a651 !important;
        }

        /* =========================
           DROPDOWN SCROLLBAR
        ========================= */

        .theme-dropdown-panel
          .p-dropdown-items-wrapper {
          scrollbar-width: thin;

          scrollbar-color:
            hsl(
              var(--muted-foreground) /
                0.4
            )
            hsl(
              var(--muted) / 0.3
            );
        }

        .theme-dropdown-panel
          .p-dropdown-items-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .theme-dropdown-panel
          .p-dropdown-items-wrapper::-webkit-scrollbar-track {
          background: hsl(
            var(--muted) / 0.3
          );
        }

        .theme-dropdown-panel
          .p-dropdown-items-wrapper::-webkit-scrollbar-thumb {
          background: hsl(
            var(--border)
          );

          border-radius: 999px;
        }

        .theme-dropdown-panel
          .p-dropdown-items-wrapper::-webkit-scrollbar-thumb:hover {
          background: hsl(
            var(--muted-foreground) /
              0.5
          );
        }

        /* =========================
           TABLE SCROLLBAR
        ========================= */

        .theme-datatable
          .p-datatable-wrapper {
          scrollbar-width: thin;

          scrollbar-color:
            hsl(
              var(--muted-foreground) /
                0.4
            )
            hsl(
              var(--muted) / 0.3
            );
        }

        .theme-datatable
          .p-datatable-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .theme-datatable
          .p-datatable-wrapper::-webkit-scrollbar-track {
          background: hsl(
            var(--muted) / 0.3
          );

          border-radius: 999px;
        }

        .theme-datatable
          .p-datatable-wrapper::-webkit-scrollbar-thumb {
          background: hsl(
            var(--border)
          );

          border-radius: 999px;
        }

        .theme-datatable
          .p-datatable-wrapper::-webkit-scrollbar-thumb:hover {
          background: hsl(
            var(--muted-foreground) /
              0.5
          );
        }

        /* =========================
           EMPTY MESSAGE
        ========================= */

        .theme-datatable
          .p-datatable-emptymessage
          > tr
          > td {
          background: transparent !important;

          color: hsl(
            var(--muted-foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;

          text-align: center;
        }

        /* =========================
           CALENDAR INPUT
        ========================= */

        .theme-page-calendar
          .p-inputtext {
          background: hsl(
            var(--background)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;
        }

        .theme-page-calendar
          .p-datepicker-trigger {
          background: hsl(
            var(--background)
          ) !important;

          color: hsl(
            var(--muted-foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;
        }

        /* =========================
           CALENDAR PANEL
        ========================= */

        .theme-calendar-panel,
        .theme-calendar-panel.p-datepicker {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border: 1px solid
            hsl(var(--border)) !important;

          border-radius: 10px !important;

          box-shadow:
            0 10px 30px
            hsl(
              var(--foreground) / 0.12
            ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-header {
          background: hsl(
            var(--card)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;

          border-color: hsl(
            var(--border)
          ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-title,
        .theme-calendar-panel
          .p-datepicker-title
          button {
          color: hsl(
            var(--foreground)
          ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-calendar
          th {
          color: hsl(
            var(--muted-foreground)
          ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-calendar
          td
          > span {
          color: hsl(
            var(--foreground)
          ) !important;

          background: transparent !important;
        }

        .theme-calendar-panel
          .p-datepicker-calendar
          td
          > span:hover {
          background: hsl(
            var(--muted)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-calendar
          td
          > span.p-highlight {
          background: rgba(
            0,
            166,
            81,
            0.15
          ) !important;

          color: #00a651 !important;
        }

        .theme-calendar-panel
          .p-datepicker-prev,
        .theme-calendar-panel
          .p-datepicker-next {
          color: hsl(
            var(--foreground)
          ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-prev:hover,
        .theme-calendar-panel
          .p-datepicker-next:hover {
          background: hsl(
            var(--muted)
          ) !important;

          color: hsl(
            var(--foreground)
          ) !important;
        }

        .theme-calendar-panel
          .p-datepicker-today
          > span {
          border-color: #00a651 !important;
        }
      `}</style>
    </div>
  );
}