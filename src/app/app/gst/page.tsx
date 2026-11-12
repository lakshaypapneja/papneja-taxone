"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { mockGSTReconciliation, GSTReconciliationItem } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function GSTReconciliationPage() {
  const [items, setItems] = useState<GSTReconciliationItem[]>(mockGSTReconciliation);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MATCHED" | "MISMATCH">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorGstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "MATCHED") return item.status === "Matched";
    if (activeFilter === "MISMATCH") return item.status !== "Matched";
    return true;
  });

  const totalDifference = items.reduce((acc, curr) => acc + curr.difference, 0);

  const handleExportReport = () => {
    const headers = [
      "Vendor Name",
      "Vendor GSTIN",
      "Invoice No",
      "Invoice Date",
      "Books Taxable",
      "Books GST",
      "GSTR-2B Taxable",
      "GSTR-2B GST",
      "Difference",
      "Status",
      "Action Required",
    ];

    const rows = filteredItems.map((i) => [
      `"${i.vendorName}"`,
      `"${i.vendorGstin}"`,
      `"${i.invoiceNo}"`,
      `"${i.invoiceDate}"`,
      i.booksTaxable,
      i.booksGst,
      i.gstr2bTaxable,
      i.gstr2bGst,
      i.difference,
      `"${i.status}"`,
      `"${i.actionRequired}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Papneja_TaxOne_GSTR2B_Reconciliation_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">GSTR-2B vs. Books Reconciliation</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Return Period: October 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare purchase ledger books against the official GST Portal 2B auto-drafted statement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import GSTR-2B JSON / Excel</span>
            <input type="file" className="hidden" accept=".json,.xlsx,.csv" />
          </label>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export Discrepancy Report
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Matched ITC Available
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {formatINR(
              items.filter((i) => i.status === "Matched").reduce((acc, i) => acc + i.booksGst, 0)
            )}
          </div>
          <p className="text-[11px] text-emerald-600">100% eligible to claim in GSTR-3B Table 4(A)</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            ITC at Risk (Discrepancies)
          </div>
          <div className="text-2xl font-black text-rose-800">{formatINR(totalDifference)}</div>
          <p className="text-[11px] text-rose-600">Pending vendor clarification / return filing</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-900 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reconciliation Health
          </div>
          <div className="text-2xl font-black text-slate-800">
            {Math.round((items.filter((i) => i.status === "Matched").length / items.length) * 100)}%
          </div>
          <p className="text-[11px] text-slate-500">
            {items.filter((i) => i.status === "Matched").length} of {items.length} invoices reconciled
          </p>
        </div>
      </div>

      {/* Table Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeFilter === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Invoices ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter("MATCHED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeFilter === "MATCHED" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Matched Only
          </button>
          <button
            onClick={() => setActiveFilter("MISMATCH")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeFilter === "MISMATCH" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Discrepancies Only
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor, GSTIN, invoice #..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Main Reconciliation Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Vendor Details</th>
                <th className="py-3 px-4">Invoice Info</th>
                <th className="py-3 px-4 text-right">Books Taxable</th>
                <th className="py-3 px-4 text-right">Books GST</th>
                <th className="py-3 px-4 text-right">2B Taxable</th>
                <th className="py-3 px-4 text-right">2B GST</th>
                <th className="py-3 px-4 text-right">Tax Variance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Action Recommended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.vendorName}</div>
                    <div className="font-mono text-[11px] text-brand-700">{item.vendorGstin}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                    <div>#{item.invoiceNo}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{item.invoiceDate}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                    {formatINR(item.booksTaxable)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                    {formatINR(item.booksGst)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                    {formatINR(item.gstr2bTaxable)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                    {formatINR(item.gstr2bGst)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                    <span className={item.difference !== 0 ? "text-rose-600" : "text-emerald-600"}>
                      {formatINR(item.difference)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "Matched"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.status === "Tax Mismatch"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate">
                    {item.actionRequired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
