import { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import api from "../../network/api";

export default function TokenPage() {
  const [searchValue, setSearchValue] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTokenId, setConfirmTokenId] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("q") ?? "");
  }, [location.search]);

  const extractRows = useCallback((body) => {
    const data =
      body?.data?.tokens ||
      body?.data?.results ||
      body?.data ||
      body?.tokens ||
      body?.results ||
      (Array.isArray(body) ? body : []);

    return Array.isArray(data) ? data : [];
  }, []);

  const normalizeToken = useCallback((token, index) => {
    const rawStatus = token?.status ?? token?.Status ?? token?.state ?? "";

    const status = String(rawStatus).toLowerCase();

    const isActive =
      token?.isActive !== undefined
        ? Boolean(token.isActive)
        : token?.IsActive !== undefined
          ? Boolean(token.IsActive)
          : status === "active";

    return {
      id:
        token?.id ??
        token?._id ??
        token?.tokenId ??
        token?.TokenID ??
        index + 1,

      TokenID: String(
        token?.tokenId ??
          token?.TokenID ??
          token?.token_id ??
          token?.id ??
          token?._id ??
          "",
      ),

      TokenNumber: String(
        token?.cardNumber ??
          token?.tokenNumber ??
          token?.TokenNumber ??
          token?.card_number ??
          "",
      ),

      Status: isActive ? "Active" : "Inactive",
      IsActive: isActive,

      CreateDate:
        token?.createdDate ??
        token?.createDate ??
        token?.CreateDate ??
        token?.createdAt ??
        token?.created_at ??
        token?.date ??
        "",
    };
  }, []);

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/token/portal");
      console.log("Token API response:", response.data);

      const apiRows = extractRows(response.data);
      setRows(apiRows.map(normalizeToken));
    } catch (error) {
      console.error("Failed to fetch tokens:", error);

      let message = "Failed to load tokens.";

      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;

        console.error("Backend status:", status);
        console.error("Backend response:", data);

        if (typeof data === "string") {
          message = data;
        } else if (data?.message) {
          message = data.message;
        } else if (data?.error) {
          message = data.error;
        } else if (data?.detail) {
          message = data.detail;
        } else {
          message = `Server error (${status}). Please try again.`;
        }
      } else if (error?.request) {
        message =
          "Unable to connect to the server. Please check the API connection.";
      } else {
        message = error?.message || "Something went wrong.";
      }

      setError(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [extractRows, normalizeToken]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const filteredRows = useMemo(() => {
    const q = searchValue.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((token) =>
      [token.TokenID, token.TokenNumber, token.Status, token.CreateDate].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(q),
      ),
    );
  }, [rows, searchValue]);

  const getTokenId = useCallback(
    (row) => String(row?.TokenID ?? "").trim(),
    [],
  );

  const getActive = useCallback((row) => Boolean(row?.IsActive), []);

  const openToggle = useCallback(
    (row) => {
      const tokenId = getTokenId(row);

      if (!tokenId) {
        setError("Token ID is missing.");
        return;
      }

      setConfirmTokenId(tokenId);
      setConfirmOpen(true);
    },
    [getTokenId],
  );

  const applyToggle = useCallback(async () => {
    if (!confirmTokenId) return;

    try {
      setLoading(true);
      setError("");

      console.log("Blocking token:", confirmTokenId);

      await api.put(`/token/${encodeURIComponent(confirmTokenId)}/block`);

      setConfirmOpen(false);
      setConfirmTokenId("");

      await fetchTokens();
    } catch (error) {
      console.error("Failed to deactivate token:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to deactivate token.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [confirmTokenId, fetchTokens]);

  const openDelete = useCallback((row) => {
    setSelectedToken({
      id: row?.id,
      tokenId: row?.TokenID,
    });

    setDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    const tokenId = selectedToken?.tokenId;

    if (!tokenId) return;

    try {
      setLoading(true);
      setError("");

      console.log("Deleting token:", tokenId);

      await api.delete(`/token/${encodeURIComponent(tokenId)}`);

      setDeleteOpen(false);
      setSelectedToken(null);

      await fetchTokens();
    } catch (error) {
      console.error("Failed to delete token:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to delete token.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedToken, fetchTokens]);

  const statusBody = useCallback(
    (row) => {
      const active = getActive(row);

      return (
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
            active
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              active ? "bg-emerald-500" : "bg-muted-foreground"
            }`}
          />
          {active ? "Active" : "Inactive"}
        </span>
      );
    },
    [getActive],
  );

  const dateBody = useCallback((row) => {
    if (!row?.CreateDate) return "-";

    const date = new Date(row.CreateDate);

    if (Number.isNaN(date.getTime())) {
      return row.CreateDate;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const actionsBody = useCallback(
    (row) => {
      const active = getActive(row);

      return (
        <div className="flex items-center gap-3">
          {active && (
            <button
              type="button"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/15 dark:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => openToggle(row)}
            >
              Deactivate
            </button>
          )}

          {!active && (
            <span className="text-xs text-muted-foreground">
              No action available
            </span>
          )}

          <button
            type="button"
            disabled={loading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => openDelete(row)}
            title="Delete"
          >
            <i className="pi pi-trash text-xs" />
          </button>
        </div>
      );
    },
    [getActive, loading, openDelete, openToggle],
  );

  const columns = useMemo(
    () => [
      {
        field: "TokenID",
        header: "Token ID",
      },
      {
        field: "TokenNumber",
        header: "Token Number",
      },
      {
        field: "CreateDate",
        header: "Create Date",
        body: dateBody,
      },
      {
        field: "Status",
        header: "Status",
        body: statusBody,
      },
      {
        field: "Actions",
        header: "Actions",
        body: actionsBody,
      },
    ],
    [actionsBody, dateBody, statusBody],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 text-foreground">
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

      {/* BREADCRUMB */}
      <div className="mb-5 text-xs text-muted-foreground">
        Operations / Token
      </div>

      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Tokens</h1>

        <p className="mt-1 text-xs text-muted-foreground">
          Manage system tokens
        </p>
      </header>

      {/* SEARCH */}
      <section className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-300">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />

            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search Token ID or Token Number..."
              className="!h-[42px] w-full !rounded-xl !border !border-border !bg-background !pl-10 !pr-4 !text-sm !text-foreground placeholder:!text-muted-foreground focus:!shadow-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {filteredRows.length} token
              {filteredRows.length !== 1 ? "s" : ""} found
            </div>

            <Button
              type="button"
              icon="pi pi-refresh"
              label="Refresh"
              loading={loading}
              onClick={fetchTokens}
              className="!rounded-lg !border !border-border !bg-background !px-4 !py-2 !text-xs !font-semibold !text-foreground hover:!bg-muted"
            />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          <div className="font-semibold">Unable to load tokens</div>

          <div className="mt-1">{error}</div>
        </div>
      )}

      {/* TABLE */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur transition-colors duration-300">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <DataTable
              value={filteredRows}
              dataKey="TokenID"
              loading={loading}
              className="theme-datatable !bg-transparent"
              tableClassName="!bg-transparent"
              rowHover
              size="small"
              responsiveLayout="scroll"
              paginator
              rows={50}
              rowsPerPageOptions={[25, 50, 100, 200]}
              paginatorClassName="!border-0 !bg-transparent border-t border-border"
              emptyMessage={loading ? "Loading tokens..." : "No tokens found"}
            >
              {columns.map((column) => (
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

      {/* DEACTIVATE DIALOG */}
      <Dialog
        visible={confirmOpen}
        onHide={() => setConfirmOpen(false)}
        header="Deactivate Token"
        draggable={false}
        className="w-[95vw] max-w-md"
        contentClassName="!border-0 !bg-card !text-foreground"
        headerClassName="!border-0 !bg-card !text-foreground"
        maskClassName="backdrop-blur-sm"
      >
        <div className="text-sm text-muted-foreground">
          Are you sure you want to deactivate this token?
        </div>

        {confirmTokenId && (
          <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            Token ID:{" "}
            <span className="font-semibold text-primary">{confirmTokenId}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            onClick={applyToggle}
          >
            {loading ? "Deactivating..." : "Deactivate"}
          </button>
        </div>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        visible={deleteOpen}
        onHide={() => setDeleteOpen(false)}
        dismissableMask
        modal
        showHeader={false}
        className="!border-0 !bg-transparent !shadow-none"
        contentClassName="!border-0 !bg-transparent !p-0"
        style={{ width: "min(420px, 92vw)" }}
      >
        <div className="rounded-2xl border border-border bg-card p-6 text-foreground shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <i className="pi pi-trash text-red-500" />
            </div>

            <div>
              <h3 className="text-base font-semibold">Delete Token</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Are you sure you want to delete this token?
              </p>
            </div>
          </div>

          {selectedToken?.tokenId && (
            <div className="mt-4 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              Token ID:{" "}
              <span className="font-semibold text-primary">
                {selectedToken.tokenId}
              </span>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              label="Cancel"
              type="button"
              disabled={loading}
              onClick={() => setDeleteOpen(false)}
              className="!rounded-lg !border !border-border !bg-background !px-4 !py-2.5 !text-xs !font-semibold !text-foreground hover:!bg-muted"
            />

            <Button
              label={loading ? "Deleting..." : "Delete"}
              type="button"
              loading={loading}
              disabled={loading}
              onClick={confirmDelete}
              className="!rounded-lg !border !border-red-500/30 !bg-red-500/10 !px-4 !py-2.5 !text-xs !font-semibold !text-red-600 dark:!text-red-300 hover:!bg-red-500/20"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
