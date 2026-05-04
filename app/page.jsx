"use client";

/**
 * RefundScan.ai — app/page.jsx
 * Full dashboard: file upload → scan → results table → LemonSqueezy paywall
 * Stack: Next.js 14 App Router + Tailwind CSS
 *
 * HOW TO CONNECT LEMONSQUEEZY:
 *   1. Create a product at app.lemonsqueezy.com
 *   2. Copy the checkout URL (looks like: https://your-store.lemonsqueezy.com/checkout/buy/xxx)
 *   3. Replace LEMON_CHECKOUT_URL below with your real link
 */

import { useState, useCallback, useRef } from "react";

const LEMON_CHECKOUT_URL = "https://your-store.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID";

// ─── Icons (inline SVG, no dep needed) ───────────────────────────
const Icon = {
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
    </svg>
  ),
};

// ─── Drop Zone Component ──────────────────────────────────────────
function DropZone({ label, hint, fileKey, file, onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) onFile(fileKey, f);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer
        transition-all duration-200 select-none
        ${file
          ? "border-emerald-500 bg-emerald-50"
          : dragging
            ? "border-emerald-400 bg-emerald-50 scale-[1.01]"
            : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files[0]; if (f) onFile(fileKey, f); }}
      />
      <div className={`transition-colors ${file ? "text-emerald-600" : "text-slate-400"}`}>
        <Icon.Upload />
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${file ? "text-emerald-700" : "text-slate-700"}`}>
          {file ? file.name : label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {file ? "✓ Ready" : hint}
        </p>
      </div>
    </div>
  );
}

// ─── Hero Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight
      ? "border-emerald-200 bg-emerald-50"
      : "border-slate-100 bg-white"}`}>
      <p className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${highlight ? "text-emerald-700" : "text-slate-800"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ─── Paywall Modal ────────────────────────────────────────────────
function PaywallModal({ open, onClose, amount }) {
  if (!open) return null;
  const formatted = amount != null ? `$${Number(amount).toFixed(2)}` : "$0.00";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <Icon.X />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4 mx-auto">
          <Icon.Lock />
        </div>

        <h2 className="text-center text-2xl font-bold text-slate-900 leading-snug mb-1">
          Claim your{" "}
          <span className="text-emerald-600">{formatted}</span>
        </h2>
        <p className="text-center text-sm text-slate-500 mb-6 leading-relaxed">
          Subscribe to download your full <strong>Claimable_Orders.csv</strong> and
          submit directly to Amazon Seller Central.
        </p>

        <ul className="space-y-2.5 mb-6">
          {[
            "Full CSV export — ready for Seller Central",
            "Unlimited scans per month",
            "45 & 90-day claim window detection",
            "Priority email support",
          ].map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Icon.Check />
              </span>
              {feat}
            </li>
          ))}
        </ul>

        <p className="text-center text-xs text-slate-400 mb-4">
          <span className="text-2xl font-bold text-slate-900">$29</span> / month · cancel anytime
        </p>

        <a
          href={LEMON_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition mb-2"
        >
          Subscribe & Unlock Report →
        </a>
        <button
          onClick={onClose}
          className="block w-full text-center text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Home() {
  const [files, setFiles]       = useState({ refund: null, ledger: null });
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults]   = useState(null);
  const [error, setError]       = useState(null);
  const [modalOpen, setModal]   = useState(false);

  const setFile = (key, file) => setFiles((prev) => ({ ...prev, [key]: file }));
  const canScan = files.refund && files.ledger && !scanning;

  const runScan = useCallback(async () => {
    if (!canScan) return;
    setScanning(true);
    setError(null);
    setResults(null);
    setProgress(0);

    // Animate progress bar while waiting
    let p = 0;
    const ticker = setInterval(() => {
      p = Math.min(p + Math.random() * 15, 88);
      setProgress(Math.round(p));
    }, 200);

    try {
      const form = new FormData();
      form.append("refund_report",    files.refund);
      form.append("inventory_ledger", files.ledger);

      const res  = await fetch("/api/scan", { method: "POST", body: form });
      const data = await res.json();

      clearInterval(ticker);
      setProgress(100);

      if (!data.success) throw new Error(data.error || "Scan failed");
      setTimeout(() => { setResults(data); setScanning(false); setProgress(0); }, 500);
    } catch (err) {
      clearInterval(ticker);
      setError(err.message);
      setScanning(false);
      setProgress(0);
    }
  }, [files, canScan]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900 tracking-tight">RefundScan</span>
          <span className="text-[10px] font-semibold bg-emerald-600 text-white px-1.5 py-0.5 rounded">AI</span>
        </div>
        <button
          onClick={() => setModal(true)}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          Upgrade · $29/mo
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* ── Hero Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total Recoverable"
            value={results ? `$${Number(results.total_recoverable).toFixed(2)}` : "—"}
            highlight={!!results}
          />
          <StatCard
            label="Orders Flagged"
            value={results?.order_count ?? "—"}
          />
          <StatCard
            label="Avg Loss / Order"
            value={
              results?.order_count
                ? `$${(results.total_recoverable / results.order_count).toFixed(2)}`
                : "—"
            }
          />
        </div>

        {/* ── Upload Section ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Upload Your Reports
            <span className="ml-2 text-xs font-normal text-slate-400">CSV files only</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <DropZone
              label="Refund Report"
              hint="Drop Refund_Report.csv here"
              fileKey="refund"
              file={files.refund}
              onFile={setFile}
            />
            <DropZone
              label="Inventory Ledger"
              hint="Drop Inventory_Ledger.csv here"
              fileKey="ledger"
              file={files.ledger}
              onFile={setFile}
            />
          </div>

          {/* Progress bar */}
          {scanning && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Scanning your data…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <button
            onClick={runScan}
            disabled={!canScan}
            className={`
              w-full py-2.5 rounded-xl font-semibold text-sm transition
              ${canScan
                ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}
            `}
          >
            {scanning ? "Processing…" : "Run Scan"}
          </button>
        </div>

        {/* ── Results Table ── */}
        {results && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">
                Claimable Orders
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {results.order_count} found
                </span>
              </h2>
              <button
                onClick={() => setModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
              >
                <Icon.Download />
                Download Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="text-left px-3 py-2 rounded-l-lg">Order ID</th>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-left px-3 py-2">ASIN</th>
                    <th className="text-center px-3 py-2">Days</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-right px-3 py-2 rounded-r-lg">Claimable</th>
                  </tr>
                </thead>
                <tbody>
                  {results.orders.map((row, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60 transition">
                      <td className="px-3 py-2.5 font-mono text-slate-500">{row.Order_ID}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[160px] truncate">
                        {row.Product_Name}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-400">{row.ASIN}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-md">
                          {row.Days_Since_Refund}d
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-md">
                          {row.Item_Status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold font-mono text-emerald-700">
                        ${Number(row.Total_Loss_USD).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-100">
                    <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold text-slate-500">
                      Total Recoverable
                    </td>
                    <td className="px-3 py-2.5 text-right text-base font-bold text-emerald-700">
                      ${Number(results.total_recoverable).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!results && !scanning && (
          <div className="text-center py-12 text-slate-300">
            <div className="text-5xl mb-3">⬆</div>
            <p className="text-sm">Upload both CSV files and click Run Scan</p>
          </div>
        )}
      </main>

      <PaywallModal
        open={modalOpen}
        onClose={() => setModal(false)}
        amount={results?.total_recoverable}
      />
    </div>
  );
}
