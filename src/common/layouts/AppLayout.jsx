import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar.jsx";
import Footer from "../footer/Footer.jsx";
import avatarProfile from "../../assets/images/avatar-profile.svg";

const dummyTokens = [
  {
    id: 1,
    tokenId: "TKN-10001",
    tokenType: "Payment Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 4521",
    status: "Active",
  },
  {
    id: 2,
    tokenId: "TKN-10002",
    tokenType: "Payment Token",
    cardType: "Mastercard",
    tokenNumber: "**** **** **** 7812",
    status: "Active",
  },
  {
    id: 3,
    tokenId: "TKN-10003",
    tokenType: "Virtual Token",
    cardType: "PayPak",
    tokenNumber: "**** **** **** 2398",
    status: "Inactive",
  },
  {
    id: 4,
    tokenId: "TKN-10004",
    tokenType: "Digital Token",
    cardType: "Visa",
    tokenNumber: "**** **** **** 6147",
    status: "Active",
  },
];

const dummyTransactions = [
  {
    id: 1,
    transactionId: "TXN-50001",
    tokenId: "TKN-10001",
    transactionType: "Sale",
    cardType: "Visa",
    amount: 15000,
    status: "Completed",
  },
  {
    id: 2,
    transactionId: "TXN-50002",
    tokenId: "TKN-10002",
    transactionType: "Refund",
    cardType: "Mastercard",
    amount: 5000,
    status: "Completed",
  },
  {
    id: 3,
    transactionId: "TXN-50003",
    tokenId: "TKN-10003",
    transactionType: "Sale",
    cardType: "PayPak",
    amount: 25000,
    status: "Pending",
  },
  {
    id: 4,
    transactionId: "TXN-50004",
    tokenId: "TKN-10004",
    transactionType: "Reversal",
    cardType: "Visa",
    amount: 8500,
    status: "Failed",
  },
];

const dummyUsers = [
  {
    id: 1,
    name: "Ali Khan",
    username: "alikhan",
    email: "ali@example.com",
    type: "Admin",
  },
  {
    id: 2,
    name: "Ahmed Raza",
    username: "ahmedraza",
    email: "ahmed@example.com",
    type: "User",
  },
  {
    id: 3,
    name: "Usman Malik",
    username: "usmanmalik",
    email: "usman@example.com",
    type: "User",
  },
];

export default function AppLayout({ sidebarFooterLabel }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    tokens: [],
    transactions: [],
    users: [],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarId = "app-layout-sidebar";
  const searchRootRef = useRef(null);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSidebarNavigate = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const normalizedQuery = useMemo(
    () => String(searchQuery ?? "").trim(),
    [searchQuery],
  );

  const currentUrl = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  const runSearch = useCallback(async (query) => {
    const q = String(query ?? "").trim();

    if (q.length < 2) {
      setSearchResults({
        tokens: [],
        transactions: [],
        users: [],
      });
      return;
    }

    setSearchLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const needle = q.toLowerCase();

      const includes = (value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle);

      const tokenMatches = dummyTokens
        .filter(
          (token) =>
            includes(token.tokenId) ||
            includes(token.tokenType) ||
            includes(token.cardType) ||
            includes(token.tokenNumber) ||
            includes(token.status),
        )
        .slice(0, 6);

      const transactionMatches = dummyTransactions
        .filter(
          (transaction) =>
            includes(transaction.transactionId) ||
            includes(transaction.tokenId) ||
            includes(transaction.transactionType) ||
            includes(transaction.cardType) ||
            includes(transaction.amount) ||
            includes(transaction.status),
        )
        .slice(0, 6);

      const userMatches = dummyUsers
        .filter(
          (user) =>
            includes(user.name) ||
            includes(user.username) ||
            includes(user.email) ||
            includes(user.type),
        )
        .slice(0, 6);

      setSearchResults({
        tokens: tokenMatches,
        transactions: transactionMatches,
        users: userMatches,
      });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchOpen) return undefined;

    const q = normalizedQuery;

    const t = setTimeout(() => {
      runSearch(q);
    }, 250);

    return () => clearTimeout(t);
  }, [normalizedQuery, runSearch, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;

    const onPointerDown = (e) => {
      const root = searchRootRef.current;

      if (!root) return;
      if (root.contains(e.target)) return;

      setSearchOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [searchOpen]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchLoading(false);
  }, []);

  const handleSelectResult = useCallback(
    (type, value) => {
      const raw = value !== undefined ? value : normalizedQuery;
      const q = encodeURIComponent(String(raw ?? "").trim());

      closeSearch();

      try {
        sessionStorage.setItem("app_refresh_return_to", currentUrl);
      } catch {
        // ignore
      }

      if (type === "tokens") {
        navigate(q ? `/tokens?q=${q}` : "/tokens");
      }

      if (type === "transactions") {
        navigate(q ? `/transactions?q=${q}` : "/transactions");
      }

      if (type === "users") {
        navigate(q ? `/users?q=${q}` : "/users");
      }
    },
    [closeSearch, currentUrl, navigate, normalizedQuery],
  );

  const handleRefresh = useCallback(() => {
    closeSearch();

    if (String(location.search ?? "").length) {
      try {
        const returnTo = sessionStorage.getItem("app_refresh_return_to");

        if (returnTo) {
          sessionStorage.removeItem("app_refresh_return_to");
          navigate(returnTo, { replace: true });
          return;
        }
      } catch {
        // ignore
      }

      navigate(location.pathname, { replace: true });
      return;
    }

    navigate(0);
  }, [closeSearch, location.pathname, location.search, navigate]);

  const totalResults =
    searchResults.tokens.length +
    searchResults.transactions.length +
    searchResults.users.length;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div
        className={[
          "sticky top-0 h-screen self-start overflow-hidden transition-all duration-300",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-[1000] max-lg:w-[260px]",
          sidebarOpen
            ? "lg:w-[260px] max-lg:translate-x-0"
            : "lg:w-0 max-lg:-translate-x-full",
        ].join(" ")}
        id={sidebarId}
      >
        <Sidebar
          footerLabel={sidebarFooterLabel}
          onNavigate={handleSidebarNavigate}
          onClose={handleToggleSidebar}
          showClose={sidebarOpen}
        />
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[900] bg-black/60 lg:hidden"
          onClick={handleToggleSidebar}
          aria-label="Close navigation menu"
        />
      ) : null}

      <main className="relative z-0 min-w-0 flex-1 overflow-x-hidden px-6 pb-0 pt-6 lg:px-10 lg:pt-8">
        <button
          type="button"
          className="mb-4 inline-flex flex-col gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-foreground"
          onClick={handleToggleSidebar}
          aria-controls={sidebarId}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <span className="h-0.5 w-6 rounded bg-foreground" />
          <span className="h-0.5 w-6 rounded bg-foreground" />
          <span className="h-0.5 w-6 rounded bg-foreground" />
        </button>

        <div className="relative z-[3000] mb-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div ref={searchRootRef} className="relative flex min-w-0 flex-1">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2">
                <i
                  className="pi pi-search text-muted-foreground"
                  aria-hidden
                />

                <input
                  type="text"
                  placeholder="Search tokens, transactions, users..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchOpen(true);
                      runSearch(e.currentTarget.value);
                    }

                    if (e.key === "Escape") {
                      closeSearch();
                    }
                  }}
                />

                {searchQuery ? (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <i className="pi pi-times" aria-hidden />
                  </button>
                ) : null}
              </div>

              {searchOpen ? (
                <div className="absolute left-0 top-[calc(100%+10px)] z-[5000] w-full overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_20px_40px_rgba(0,0,0,0.55)] backdrop-blur">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        {searchLoading ? "Searching..." : "Search results"}
                      </div>

                      {normalizedQuery.length >= 2 && !searchLoading ? (
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {totalResults}{" "}
                          {totalResults === 1 ? "result" : "results"} found
                        </div>
                      ) : null}
                    </div>

                    {normalizedQuery.length < 2 ? (
                      <span className="text-[10px] text-muted-foreground">
                        Type at least 2 characters
                      </span>
                    ) : null}
                  </div>

                  <div className="max-h-[380px] overflow-auto">
                    {normalizedQuery.length < 2 ? (
                      <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                        Search by Token ID, Transaction ID, card type,
                        username or status.
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        <button
                          type="button"
                          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectResult("tokens")}
                          disabled={searchLoading}
                        >
                          Tokens
                        </button>

                        <div className="mt-2 grid gap-1">
                          {searchResults.tokens.length ? (
                            searchResults.tokens.map((token) => (
                              <button
                                key={token.id}
                                type="button"
                                className="rounded-xl px-3 py-2 text-left hover:bg-background/50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  handleSelectResult(
                                    "tokens",
                                    token.tokenId,
                                  )
                                }
                                disabled={searchLoading}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-semibold text-foreground">
                                    {token.tokenId}
                                  </div>

                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                                      token.status === "Active"
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-red-500/10 text-red-500"
                                    }`}
                                  >
                                    {token.status}
                                  </span>
                                </div>

                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {token.cardType} · {token.tokenType} ·{" "}
                                  {token.tokenNumber}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              No token matches
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectResult("transactions")}
                          disabled={searchLoading}
                        >
                          Transactions
                        </button>

                        <div className="mt-2 grid gap-1">
                          {searchResults.transactions.length ? (
                            searchResults.transactions.map((transaction) => (
                              <button
                                key={transaction.id}
                                type="button"
                                className="rounded-xl px-3 py-2 text-left hover:bg-background/50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  handleSelectResult(
                                    "transactions",
                                    transaction.transactionId,
                                  )
                                }
                                disabled={searchLoading}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-semibold text-foreground">
                                    {transaction.transactionId}
                                  </div>

                                  <div className="text-sm font-semibold text-foreground">
                                    PKR{" "}
                                    {transaction.amount.toLocaleString()}
                                  </div>
                                </div>

                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {transaction.transactionType} ·{" "}
                                  {transaction.tokenId} ·{" "}
                                  {transaction.cardType} ·{" "}
                                  {transaction.status}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              No transaction matches
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectResult("users")}
                          disabled={searchLoading}
                        >
                          Users
                        </button>

                        <div className="mt-2 grid gap-1">
                          {searchResults.users.length ? (
                            searchResults.users.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                className="rounded-xl px-3 py-2 text-left hover:bg-background/50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  handleSelectResult(
                                    "users",
                                    user.username,
                                  )
                                }
                                disabled={searchLoading}
                              >
                                <div className="text-sm font-semibold text-foreground">
                                  {user.name}
                                </div>

                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {user.username} · {user.email} ·{" "}
                                  {user.type}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              No user matches
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {normalizedQuery.length >= 2 &&
                    !searchLoading &&
                    totalResults === 0 ? (
                      <div className="border-t border-border px-4 py-4 text-xs text-muted-foreground">
                        No results found for "{normalizedQuery}".
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/30 px-3 py-2 text-sm text-foreground hover:bg-background/50"
              onClick={handleRefresh}
            >
              <i className="pi pi-refresh" aria-hidden />
              Refresh
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/30 px-4 py-2">
              <img
                src={avatarProfile}
                alt=""
                className="h-9 w-9 rounded-full"
              />

              <span className="text-sm font-semibold text-foreground">
                Profile
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Outlet />
        </div>

        <div className="py-6">
          <Footer>© DigiKhata</Footer>
        </div>
      </main>
    </div>
  );
}

AppLayout.propTypes = {
  sidebarFooterLabel: PropTypes.string,
};

AppLayout.defaultProps = {
  sidebarFooterLabel: "Profile",
};
