import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import api from "../../network/api/";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const TRANSACTION_TYPES = [
  { label: "All Types", value: "all" },
  { label: "Sale", value: "Sale" },
  { label: "Refund", value: "Refund" },
  { label: "Void", value: "Void" },
  { label: "Reversal", value: "Reversal" },
];

export default function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get("/transaction/portal");

        const data = response.data?.data ?? response.data;

        setTransactions(Array.isArray(data) ? data : data?.transactions || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const searchSuggestions = (event) => {
    const query = event.query.trim().toLowerCase();

    if (!query) {
      setSuggestions([]);
      return;
    }

    const results = transactions
      .flatMap((transaction) => [
        transaction.transactionId,
        transaction.tokenId,
        transaction.referenceNumber,
      ])
      .filter((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      )
      .filter(Boolean);

    setSuggestions([...new Set(results)].slice(0, 10));
  };

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        [
          transaction.transactionId,
          transaction.tokenId,
          transaction.transactionType,
          transaction.amount,
          transaction.currencyCode,
          transaction.referenceNumber,
          transaction.description,
          transaction.status,
          transaction.transactionDate,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      const matchesTransactionType =
        transactionTypeFilter === "all" ||
        transaction.transactionType === transactionTypeFilter;

      return matchesSearch && matchesStatus && matchesTransactionType;
    });
  }, [transactions, search, statusFilter, transactionTypeFilter]);

  const clearFilters = () => {
    setSearch("");
    setSuggestions([]);
    setStatusFilter("all");
    setTransactionTypeFilter("all");
  };

  const openEdit = (transaction) => {
    setEditForm({ ...transaction });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editForm) return;

    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === editForm.id
          ? { ...editForm, amount: Number(editForm.amount) }
          : transaction,
      ),
    );

    setEditOpen(false);
    setEditForm(null);
  };

  const openStatusDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setStatusDialogOpen(true);
  };

  const toggleStatus = () => {
    if (!selectedTransaction) return;

    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === selectedTransaction.id
          ? {
              ...transaction,
              status: transaction.status === "active" ? "inactive" : "active",
            }
          : transaction,
      ),
    );

    setStatusDialogOpen(false);
    setSelectedTransaction(null);
  };

  const openDeleteDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const deleteTransaction = () => {
    if (!selectedTransaction) return;

    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== selectedTransaction.id),
    );

    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const exportCsv = () => {
    const headers = [
      "Transaction ID",
      "Token ID",
      "Transaction Type",
      "Amount",
      "Currency",
      "Reference Number",
      "Status",
      "Transaction Date",
      "Description",
    ];

    const csvRows = filteredTransactions.map((transaction) => [
      transaction.transactionId,
      transaction.tokenId,
      transaction.transactionType,
      transaction.amount,
      transaction.currencyCode,
      transaction.referenceNumber,
      transaction.status,
      transaction.transactionDate,
      transaction.description,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-background px-6 py-8 text-foreground transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="mb-5 text-xs text-muted-foreground">
        Operations / Transaction
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            All/Modify Transaction
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter and manage transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="min-w-[280px] flex-1">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Search
            </label>

            <div className="relative">
              <i className="pi pi-search absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs text-muted-foreground" />

              <AutoComplete
                value={search}
                suggestions={suggestions}
                completeMethod={searchSuggestions}
                onChange={(e) => setSearch(e.value)}
                placeholder="Search transaction, token, reference, amount..."
                className="w-full"
                panelClassName="theme-search-suggestions"
                inputClassName="theme-page-input w-full !rounded-xl !border !border-border !bg-background !py-2.5 !pl-9 !text-sm !text-foreground placeholder:!text-muted-foreground"
              />
              <style>{`
  .theme-search-suggestions {
    background: hsl(var(--card)) !important;
    color: hsl(var(--foreground)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 10px !important;
  }

  .theme-search-suggestions .p-autocomplete-items {
    background: hsl(var(--card)) !important;
    padding: 4px !important;
  }

  .theme-search-suggestions .p-autocomplete-item {
    background: transparent !important;
    color: hsl(var(--foreground)) !important;
    border-radius: 6px !important;
    padding: 0.65rem 0.75rem !important;
  }

  .theme-search-suggestions .p-autocomplete-item:hover {
    background: hsl(var(--muted)) !important;
    color: hsl(var(--foreground)) !important;
  }

  .theme-search-suggestions .p-autocomplete-item.p-highlight {
    background: hsl(var(--primary) / 0.12) !important;
    color: hsl(var(--primary)) !important;
  }
`}</style>
            </div>
          </div>

          {/* Transaction Type */}
          <div className="min-w-[170px]">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Transaction Type
            </label>

            <Dropdown
              value={transactionTypeFilter}
              options={TRANSACTION_TYPES}
              onChange={(e) => setTransactionTypeFilter(e.value)}
              panelClassName="theme-dropdown-panel"
              appendTo="self"
              className="theme-page-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
            />
          </div>

          {/* Status */}
          <div className="min-w-[140px]">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Status
            </label>

            <Dropdown
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(e) => setStatusFilter(e.value)}
              panelClassName="theme-dropdown-panel"
              appendTo="self"
              className="theme-page-dropdown w-full !rounded-xl !border !border-border !bg-background !text-foreground"
            />
          </div>

          {/* Clear */}
          <Button
            type="button"
            label="Clear"
            icon="pi pi-filter-slash"
            onClick={clearFilters}
            className="!rounded-lg !border !border-border !bg-muted !px-4 !py-2.5 !text-xs !text-foreground hover:!bg-muted/80"
          />

          {/* Export */}
          <Button
            type="button"
            label="Export"
            icon="pi pi-download"
            onClick={exportCsv}
            className="!rounded-lg !border !border-border !bg-muted !px-4 !py-2.5 !text-xs !text-foreground hover:!bg-muted/80"
          />
        </div>
      </div>

      {/* Result Count */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <span className="text-foreground">{filteredTransactions.length}</span>{" "}
          of <span className="text-foreground">{transactions.length}</span>{" "}
          transactions
        </span>
      </div>

      {/* Table */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
        <DataTable
          value={filteredTransactions}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          rowHover
          emptyMessage="No transactions found."
          scrollable
          scrollHeight="540px"
          className="theme-datatable"
        >
          <Column
            header="Transaction ID"
            body={(row) => (
              <span className="font-medium text-primary">
                {row.transactionId}
              </span>
            )}
          />

          <Column
            header="Token ID"
            body={(row) => (
              <span className="text-foreground">{row.tokenId}</span>
            )}
          />

          <Column
            header="Transaction Type"
            body={(row) => (
              <span className="text-foreground">{row.transactionType}</span>
            )}
          />

          <Column
            header="Amount"
            body={(row) => (
              <span className="font-semibold text-foreground">
                {Number(row.amount).toLocaleString()}
              </span>
            )}
          />

          <Column
            header="Reference"
            body={(row) => (
              <span className="text-muted-foreground">
                {row.referenceNumber}
              </span>
            )}
          />

          <Column
            header="Date"
            body={(row) => (
              <span className="text-muted-foreground">
                {row.transactionDate}
              </span>
            )}
          />

          <Column
            header="Status"
            body={(row) => (
              <span
                className={
                  row.status === "active"
                    ? "inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300"
                    : "inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                }
              >
                <span
                  className={
                    row.status === "active"
                      ? "h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"
                      : "h-2 w-2 rounded-full bg-muted-foreground"
                  }
                />
                {row.status === "active" ? "Active" : "Inactive"}
              </span>
            )}
          />

          <Column
            header="Actions"
            body={(row) => (
              <div className="flex items-center gap-3">
                {/* Edit */}
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="table-action-btn edit"
                  title="Edit"
                >
                  <i className="pi pi-pencil text-xs" />
                </button>

                {/* Activate / Deactivate */}
                <button
                  type="button"
                  onClick={() => openStatusDialog(row)}
                  className={`table-status-btn ${
                    row.status === "active" ? "deactivate" : "activate"
                  }`}
                >
                  {row.status === "active" ? "Deactivate" : "Activate"}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => openDeleteDialog(row)}
                  className="table-action-btn delete"
                  title="Delete"
                >
                  <i className="pi pi-trash text-xs" />
                </button>
              </div>
            )}
          />
        </DataTable>
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
    background: hsl(var(--primary) / 0.15) !important;
    color: hsl(var(--primary)) !important;
  }

  /* =========================
     PAGINATOR DROPDOWN
  ========================= */

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

  /* =========================
     ALL DROPDOWNS
  ========================= */

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

  /* =========================
     DROPDOWN POPUP
  ========================= */

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

  /* =========================
     DROPDOWN SCROLLBAR
  ========================= */

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

      {/* Edit Dialog */}
      <Dialog
        visible={editOpen}
        onHide={() => {
          setEditOpen(false);
          setEditForm(null);
        }}
        header="Edit Transaction"
        modal
        dismissableMask
        className="theme-dialog w-[700px] max-w-[95vw]"
        contentClassName="!border-border !bg-card !text-foreground"
        headerClassName="!border-border !bg-card !text-foreground"
      >
        {editForm && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Transaction ID */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Transaction ID
              </label>

              <InputText
                value={editForm.transactionId}
                disabled
                className="theme-page-input w-full !border-border !bg-background !text-foreground disabled:!opacity-70"
              />
            </div>

            {/* Token ID */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Token ID
              </label>

              <InputText
                value={editForm.tokenId}
                disabled
                className="theme-page-input w-full !border-border !bg-background !text-foreground disabled:!opacity-70"
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Transaction Type
              </label>

              <Dropdown
                value={editForm.transactionType}
                options={TRANSACTION_TYPES.filter(
                  (item) => item.value !== "all",
                )}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    transactionType: e.value,
                  })
                }
                panelClassName="theme-dropdown-panel"
                appendTo="self"
                className="theme-page-dropdown w-full !border-border !bg-background !text-foreground"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Amount
              </label>

              <InputText
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    amount: e.target.value,
                  })
                }
                className="theme-page-input w-full !border-border !bg-background !text-foreground"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Reference Number
              </label>

              <InputText
                value={editForm.referenceNumber}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    referenceNumber: e.target.value,
                  })
                }
                className="theme-page-input w-full !border-border !bg-background !text-foreground"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Status
              </label>

              <Dropdown
                value={editForm.status}
                options={STATUS_OPTIONS.filter((item) => item.value !== "all")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.value,
                  })
                }
                panelClassName="theme-dropdown-panel"
                appendTo="self"
                className="theme-page-dropdown w-full !border-border !bg-background !text-foreground"
              />
            </div>

            {/* Transaction Date */}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                Transaction Date
              </label>

              <InputText
                type="date"
                value={editForm.transactionDate}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    transactionDate: e.target.value,
                  })
                }
                className="theme-page-input w-full !border-border !bg-background !text-foreground"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs text-muted-foreground">
                Description
              </label>

              <InputText
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value,
                  })
                }
                className="theme-page-input w-full !border-border !bg-background !text-foreground"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setEditForm(null);
                }}
                className="!border !border-border !bg-muted !text-foreground hover:!bg-muted/80"
              />

              <Button
                label="Save Changes"
                type="button"
                onClick={saveEdit}
                className="!border-0 !bg-primary !text-primary-foreground hover:!opacity-90"
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Status Dialog */}
      <Dialog
        visible={statusDialogOpen}
        onHide={() => {
          setStatusDialogOpen(false);
          setSelectedTransaction(null);
        }}
        header="Change Transaction Status"
        modal
        dismissableMask
        className="theme-dialog w-[450px] max-w-[92vw]"
        contentClassName="!border-border !bg-card !text-foreground"
        headerClassName="!border-border !bg-card !text-foreground"
      >
        {selectedTransaction && (
          <div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to{" "}
              <span className="font-semibold text-foreground">
                {selectedTransaction.status === "active"
                  ? "deactivate"
                  : "activate"}
              </span>{" "}
              this transaction?
            </p>

            <div className="mt-4 rounded-lg border border-border bg-muted p-3">
              <div className="text-xs text-muted-foreground">
                Transaction ID
              </div>

              <div className="mt-1 font-semibold text-primary">
                {selectedTransaction.transactionId}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setStatusDialogOpen(false);
                  setSelectedTransaction(null);
                }}
                className="!border !border-border !bg-muted !text-foreground hover:!bg-muted/80"
              />

              <Button
                label={
                  selectedTransaction.status === "active"
                    ? "Deactivate"
                    : "Activate"
                }
                type="button"
                onClick={toggleStatus}
                className="!border-0 !bg-primary !text-primary-foreground hover:!opacity-90"
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        visible={deleteDialogOpen}
        onHide={() => {
          setDeleteDialogOpen(false);
          setSelectedTransaction(null);
        }}
        header="Delete Transaction"
        modal
        dismissableMask
        className="theme-dialog w-[450px] max-w-[92vw]"
        contentClassName="!border-border !bg-card !text-foreground"
        headerClassName="!border-border !bg-card !text-foreground"
      >
        {selectedTransaction && (
          <div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this transaction?
            </p>

            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <div className="text-xs text-muted-foreground">
                Transaction ID
              </div>

              <div className="mt-1 font-semibold text-red-600 dark:text-red-300">
                {selectedTransaction.transactionId}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedTransaction(null);
                }}
                className="!border !border-border !bg-muted !text-foreground hover:!bg-muted/80"
              />

              <Button
                label="Delete"
                type="button"
                onClick={deleteTransaction}
                className="!border-0 !bg-red-500 !text-white hover:!bg-red-600"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
