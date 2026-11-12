"use client";

import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  Share2,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { mockClients, mockBankTransactions, mockGSTReconciliation } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function DashboardPage() {
  const totalPendingBank = mockBankTransactions.filter((t) => t.status !== "Reviewed").length;
  const totalGstMismatch = mockGSTReconciliation.filter((g) => g.status !== "Matched").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-200 border border-brand-400/30">
            Papneja Associates Practice Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Welcome, CA Lakshay Papneja</h1>
          <p className="text-xs text-slate-300 mt-1">
            Active Client: <strong>Apex Logistics India Pvt Ltd</strong> &bull; Tally Prime connected on localhost:9000
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/app/banking"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-xs font-semibold text-white shadow transition-all"
          >
            <Zap className="w-4 h-4" />
            New Bank Import
          </Link>
          <Link
            href="/app/tally-sync"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-white transition-all"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            Sync to Tally (6)
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Bank Entries</span>
            <FileSpreadsheet className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPendingBank} Vouchers</div>
          <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            Ready for CA review &amp; ledger approval
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>GST 2B Mismatches</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{totalGstMismatch} Invoices</div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            &#8377; 45,396 ITC variance identified
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tally Auto-Matched Rate</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">96.8%</div>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI Rule Engine learning active
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Client Companies</span>
            <Share2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{mockClients.length} Firms</div>
          <p className="text-[11px] text-slate-500">
            All configured with Tally Prime masters
          </p>
        </div>

      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Urgent Actions & Pending Bank Transactions */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Bank Statement Entries (AI Parsed)</h2>
              <p className="text-xs text-slate-500">Verify extracted narrations and auto-assigned Tally ledgers</p>
            </div>
            <Link
              href="/app/banking"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              Open Full Grid <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {mockBankTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">{tx.date}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {tx.chqRefNo}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      tx.withdrawal > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {tx.voucherType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{tx.narration}</p>
                  <p className="text-[11px] text-brand-700 font-medium">
                    Ledger: <span className="font-semibold">{tx.selectedLedger}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs font-bold ${tx.withdrawal > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {tx.withdrawal > 0 ? `-${formatINR(tx.withdrawal)}` : `+${formatINR(tx.deposit)}`}
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                    {tx.confidence}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/app/banking"
              className="w-full py-2.5 rounded-lg border border-brand-200 hover:bg-brand-50 text-brand-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              Review All {mockBankTransactions.length} Transactions &amp; Export XML
            </Link>
          </div>
        </div>

        {/* Right Column: GST Discrepancies & Direct Sync */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* GST Alert Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">GSTR-2B vs. Books Mismatches</h3>
                <p className="text-xs text-slate-500">October 2026 Return Period</p>
              </div>
              <Link href="/app/gst" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {mockGSTReconciliation.slice(1, 3).map((gst) => (
                <div key={gst.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 truncate">{gst.vendorName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      gst.status === "Tax Mismatch"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {gst.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>Inv: {gst.invoiceNo}</span>
                    <span className="font-bold text-rose-600">Diff: {formatINR(gst.difference)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{gst.actionRequired}</p>
                </div>
              ))}
            </div>

            <Link
              href="/app/gst"
              className="block text-center py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Generate 2B Reconciliation Report
            </Link>
          </div>

          {/* Quick Client Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Practice Client Companies</h3>
            <div className="space-y-2">
              {mockClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between text-xs p-2 rounded hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">{client.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{client.gstin}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    client.reconciliationStatus === "Reconciled"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {client.reconciliationStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
