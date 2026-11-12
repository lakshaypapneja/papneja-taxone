"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";
import { mockBankTransactions, BankTransaction } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";
import { generateTallyPrimeXML, TallyVoucher } from "@/lib/tallyXmlGenerator";

const commonLedgers = [
  "Rent Expenses - Office",
  "Staff Welfare & Refreshment",
  "Sharma Hardware & Sanitary Mart",
  "Bank & Financial Charges",
  "Vehicle Fuel & Transportation",
  "Bank Interest Income",
  "Electricity Expenses",
  "Professional & Legal Fees",
  "Sundry Creditors Control",
  "Sundry Debtors Control",
  "GST Input Tax Credit",
];

export default function BankingAutomationPage() {
  const [transactions, setTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [selectedIds, setSelectedIds] = useState<string[]>(mockBankTransactions.map((t) => t.id));
  const [activeTab, setActiveTab] = useState<"all" | "unreviewed" | "matched">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [generatedXml, setGeneratedXml] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState("");

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  // Change ledger
  const handleLedgerChange = (id: string, newLedger: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, selectedLedger: newLedger, status: "Reviewed" } : t
      )
    );
  };

  // Change voucher type
  const handleVoucherTypeChange = (
    id: string,
    newType: "Payment" | "Receipt" | "Contra" | "Journal"
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, voucherType: newType } : t))
    );
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.selectedLedger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.chqRefNo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "unreviewed") return t.status !== "Reviewed";
    if (activeTab === "matched") return t.status === "Auto-Matched";
    return true;
  });

  // Generate Tally Prime XML
  const handleExportTallyXml = () => {
    const selectedTransactions = transactions.filter((t) => selectedIds.includes(t.id));
    const vouchers: TallyVoucher[] = selectedTransactions.map((t) => {
      const isPayment = t.withdrawal > 0;
      const amount = isPayment ? t.withdrawal : t.deposit;
      const bankLedger = "HDFC Current Account - 502000192837";

      return {
        id: t.id,
        date: t.date,
        voucherType: t.voucherType,
        voucherNumber: t.chqRefNo || `VCH-${t.id}`,
        narration: t.narration,
        partyLedger: t.selectedLedger,
        entries: [
          {
            ledgerName: t.selectedLedger,
            isDebit: isPayment, // In Payment: Expense/Party is Dr (Debit)
            amount: amount,
          },
          {
            ledgerName: bankLedger,
            isDebit: !isPayment, // In Payment: Bank is Cr (Credit)
            amount: amount,
          },
        ],
      };
    });

    const xml = generateTallyPrimeXML("Apex Logistics India Pvt Ltd", vouchers);
    setGeneratedXml(xml);
    setShowXmlModal(true);
  };

  // Download XML file
  const handleDownloadXmlFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedXml], { type: "text/xml" });
    element.href = URL.createObjectURL(file);
    element.download = `Papneja_TaxOne_Tally_Import_${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Push directly to Tally Prime (localhost:9000)
  const handleDirectPushToTally = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage("");

    // Simulate sending to local Tally bridge agent
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccessMessage(
        `Successfully pushed ${selectedIds.length} vouchers to Tally Prime on localhost:9000! Company: Apex Logistics India Pvt Ltd.`
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Bank Statement Automation</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              HDFC Bank A/C: 502000192837
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review parsed transactions, verify AI-suggested Tally ledgers, and export or sync to Tally Prime.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload New PDF / Excel</span>
            <input type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv" />
          </label>

          <button
            onClick={handleExportTallyXml}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Generate Tally XML ({selectedIds.length})
          </button>

          <button
            onClick={handleDirectPushToTally}
            disabled={selectedIds.length === 0 || isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {isSyncing ? "Connecting to Port 9000..." : `Push to Tally Prime (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Sync Success Notification */}
      {syncSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSyncSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("unreviewed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === "unreviewed" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setActiveTab("matched")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === "matched" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Auto-Matched
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search narration, ref #, ledger..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="py-3 px-4 w-28">Date</th>
                <th className="py-3 px-4 w-32">Chq / Ref No</th>
                <th className="py-3 px-4">Bank Narration</th>
                <th className="py-3 px-4 w-28 text-right">Withdrawal (Dr)</th>
                <th className="py-3 px-4 w-28 text-right">Deposit (Cr)</th>
                <th className="py-3 px-4 w-28">Voucher Type</th>
                <th className="py-3 px-4 w-60">Target Tally Ledger</th>
                <th className="py-3 px-4 w-24 text-center">AI Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? "bg-brand-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {tx.chqRefNo}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={tx.narration}>
                      {tx.narration}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600 whitespace-nowrap">
                      {tx.withdrawal > 0 ? formatINR(tx.withdrawal) : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                      {tx.deposit > 0 ? formatINR(tx.deposit) : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={tx.voucherType}
                        onChange={(e) =>
                          handleVoucherTypeChange(
                            tx.id,
                            e.target.value as "Payment" | "Receipt" | "Contra" | "Journal"
                          )
                        }
                        className="text-xs py-1 px-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-brand-500"
                      >
                        <option value="Payment">Payment</option>
                        <option value="Receipt">Receipt</option>
                        <option value="Contra">Contra</option>
                        <option value="Journal">Journal</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={tx.selectedLedger}
                        onChange={(e) => handleLedgerChange(tx.id, e.target.value)}
                        className="w-full text-xs py-1 px-2 rounded border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-brand-500 truncate"
                      >
                        {commonLedgers.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.confidence >= 95
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tx.confidence >= 80
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {tx.confidence}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <strong>{filteredTransactions.length}</strong> transactions &bull; Selected:{" "}
            <strong>{selectedIds.length}</strong>
          </div>
          <div className="flex gap-4">
            <span>
              Total Withdrawals:{" "}
              <strong className="text-rose-600 font-mono">
                {formatINR(
                  filteredTransactions.reduce((acc, t) => acc + t.withdrawal, 0)
                )}
              </strong>
            </span>
            <span>
              Total Deposits:{" "}
              <strong className="text-emerald-600 font-mono">
                {formatINR(
                  filteredTransactions.reduce((acc, t) => acc + t.deposit, 0)
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tally XML Preview Modal */}
      {showXmlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tally Prime XML Envelope Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Ready for direct import into Tally Prime / ERP 9
                </p>
              </div>
              <button
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-slate-900 text-slate-200 font-mono text-xs">
              <pre className="whitespace-pre-wrap">{generatedXml}</pre>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowXmlModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleDownloadXmlFile}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download .XML File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
