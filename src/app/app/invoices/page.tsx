"use client";

import React, { useState } from "react";
import {
  Upload,
  Receipt,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  FileText,
  Layers,
  ArrowRight,
  Trash2,
  ExternalLink,
  RefreshCw,
  Edit2,
  Check,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  ParsedInvoice,
  buildBatchTallyPurchaseXml,
  determineGstLedgers,
} from "@/lib/tallyInvoiceEngine";

const initialSampleInvoices: ParsedInvoice[] = [
  {
    id: "inv-1",
    fileName: "Bharat_Petroleum_Oct26.pdf",
    vendorName: "Bharat Petroleum Corporation Ltd",
    vendorGstin: "07AAACB2902M1ZI",
    buyerName: "Apex Logistics India Pvt Ltd",
    buyerGstin: "07AABCA1234F1Z8",
    invoiceNo: "BPCL/ND/99120",
    invoiceDate: "2026-10-14",
    taxableValue: 145000,
    taxRate: 18,
    cgst: 13050,
    sgst: 13050,
    igst: 0,
    roundOff: 0,
    totalAmount: 171100,
    isInterstate: false,
    supplierState: "Delhi",
    buyerState: "Delhi",
    ledgers: {
      vendorLedger: "Bharat Petroleum Corporation Ltd",
      purchaseLedger: "Purchase - GST @ 18%",
      cgstLedger: "Input CGST @ 9%",
      sgstLedger: "Input SGST @ 9%",
    },
    status: "Matched",
  },
  {
    id: "inv-2",
    fileName: "Dell_Server_Blade_PO49.pdf",
    vendorName: "Dell India Computer Pvt Ltd",
    vendorGstin: "29AABCD1002P1ZY",
    buyerName: "Apex Logistics India Pvt Ltd",
    buyerGstin: "07AABCA1234F1Z8",
    invoiceNo: "DELL-BLR-0091",
    invoiceDate: "2026-10-25",
    taxableValue: 210000,
    taxRate: 18,
    cgst: 0,
    sgst: 0,
    igst: 37800,
    roundOff: 0,
    totalAmount: 247800,
    isInterstate: true,
    supplierState: "Karnataka",
    buyerState: "Delhi",
    ledgers: {
      vendorLedger: "Dell India Computer Pvt Ltd",
      purchaseLedger: "Purchase - Interstate @ 18%",
      igstLedger: "Input IGST @ 18%",
    },
    status: "Matched",
  },
];

export default function InvoicesOCRPage() {
  const [invoices, setInvoices] = useState<ParsedInvoice[]>(initialSampleInvoices);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPushingToTally, setIsPushingToTally] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ParsedInvoice | null>(null);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [pushErrorDetails, setPushErrorDetails] = useState<string | null>(null);

  // Handle multi-file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setPushStatusMessage(null);
    setPushErrorDetails(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("buyerGstin", "07AABCA1234F1Z8");
    formData.append("buyerName", "Apex Logistics India Pvt Ltd");

    try {
      const res = await fetch("/api/invoices/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.invoices) {
        setInvoices((prev) => [...data.invoices, ...prev]);
        setPushStatusMessage(
          `Successfully parsed ${data.invoices.length} invoices! Extracted vendor GSTINs, tax slabs, and configured Tally Purchase vouchers.`
        );
      }
    } catch (err: any) {
      alert("Error processing invoices: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Push directly to Tally Prime (port 9000)
  const handlePushAllToTally = async () => {
    if (invoices.length === 0) return;

    setIsPushingToTally(true);
    setPushStatusMessage(null);
    setPushErrorDetails(null);

    const xml = buildBatchTallyPurchaseXml("Apex Logistics India Pvt Ltd", invoices);

    try {
      const res = await fetch("/api/tally/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlPayload: xml }),
      });

      const result = await res.json();

      if (result.success) {
        setInvoices((prev) =>
          prev.map((inv) => ({ ...inv, status: "Pushed to Tally" }))
        );
        setPushStatusMessage(
          `SUCCESS: Pushed ${invoices.length} Purchase Vouchers into Tally Prime (Company: Apex Logistics India Pvt Ltd)! Tally Created: ${result.created}, Errors: ${result.errors}`
        );
      } else {
        if (result.isSocketUnavailable) {
          setPushErrorDetails(result.error);
        } else {
          setPushErrorDetails(
            `Tally Error: ${result.lineError || result.error || "Tally rejected the XML payload."}`
          );
        }
      }
    } catch (err: any) {
      setPushErrorDetails("Network error connecting to Tally bridge: " + err.message);
    } finally {
      setIsPushingToTally(false);
    }
  };

  // Download XML file
  const handleDownloadXml = () => {
    const xml = buildBatchTallyPurchaseXml("Apex Logistics India Pvt Ltd", invoices);
    const element = document.createElement("a");
    const file = new Blob([xml], { type: "text/xml" });
    element.href = URL.createObjectURL(file);
    element.download = `Papneja_TaxOne_Tally_Purchase_${invoices.length}_Vouchers.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Remove invoice
  const handleRemoveInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

  // Total metrics
  const totalTaxable = invoices.reduce((acc, i) => acc + i.taxableValue, 0);
  const totalTax = invoices.reduce((acc, i) => acc + i.cgst + i.sgst + i.igst, 0);
  const totalGrand = invoices.reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Batch Invoice OCR &amp; Direct Tally Integration
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Target Company: Apex Logistics (Delhi)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drop 5, 10, or 20 invoices. Our engine automatically parses GSTINs, resolves Intra vs Inter-state tax slabs, and posts accounting vouchers directly into Tally Prime.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? "Extracting..." : "Upload Invoices (Batch)"}</span>
            <input
              type="file"
              multiple
              disabled={isProcessing}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
            />
          </label>

          <button
            onClick={handleDownloadXml}
            disabled={invoices.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Download Tally XML ({invoices.length})
          </button>

          <button
            onClick={handlePushAllToTally}
            disabled={invoices.length === 0 || isPushingToTally}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {isPushingToTally ? "Injecting into Tally..." : `Push ${invoices.length} to Tally Prime`}
          </button>
        </div>
      </div>

      {/* Push Status / Error Alerts */}
      {pushStatusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pushStatusMessage}</span>
          </div>
          <button onClick={() => setPushStatusMessage(null)} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {pushErrorDetails && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Direct Push Notification:</span> {pushErrorDetails}
            </div>
            <button onClick={() => setPushErrorDetails(null)} className="font-bold">
              &times;
            </button>
          </div>
          <div className="p-2.5 rounded bg-white/70 border border-amber-200 text-[11px] text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              💡 How to enable Tally Prime to accept incoming vouchers:
            </p>
            <p>1. Open Tally Prime on your computer.</p>
            <p>2. Press <strong>F1: Help</strong> &gt; <strong>Settings</strong> &gt; <strong>Connectivity</strong>.</p>
            <p>3. Set <strong>TallyPrime acts as</strong> to <strong>Both</strong> and <strong>Port</strong> to <strong>9000</strong>.</p>
            <p>4. Or use the <strong>Download Tally XML</strong> button above to import via <em>Import &gt; Transactions</em>.</p>
          </div>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Invoices In Batch</div>
          <div className="text-2xl font-black text-slate-900">{invoices.length} Files</div>
          <div className="text-[10px] text-slate-400">All mapped to Creditor &amp; Purchase ledgers</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Taxable Value</div>
          <div className="text-2xl font-black text-slate-900">{formatINR(totalTaxable)}</div>
          <div className="text-[10px] text-slate-400">Debited to Purchase Accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Input Tax (ITC)</div>
          <div className="text-2xl font-black text-emerald-600">{formatINR(totalTax)}</div>
          <div className="text-[10px] text-slate-400">CGST + SGST + IGST Breakdown</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Payable Amount</div>
          <div className="text-2xl font-black text-brand-700">{formatINR(totalGrand)}</div>
          <div className="text-[10px] text-slate-400">Credited to Vendor Ledger Accounts</div>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Batch Invoice Queue &bull; Automated Ledger Allocations
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click any invoice row to view or edit voucher details
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Vendor / Creditor</th>
                <th className="py-3 px-4">Invoice # &amp; Date</th>
                <th className="py-3 px-4">GST Nature</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Tax (CGST/SGST/IGST)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4">Target Tally Ledger</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{inv.vendorName}</div>
                    <div className="font-mono text-[11px] text-brand-700">{inv.vendorGstin}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                    <div>#{inv.invoiceNo}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{inv.invoiceDate}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.isInterstate
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {inv.isInterstate
                        ? `Inter-state (${inv.supplierState} → DL)`
                        : `Intra-state (${inv.supplierState})`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                    {formatINR(inv.taxableValue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                    {inv.isInterstate ? (
                      <span className="text-purple-700">IGST: {formatINR(inv.igst)}</span>
                    ) : (
                      <span className="text-blue-700">
                        C+S: {formatINR(inv.cgst + inv.sgst)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatINR(inv.totalAmount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 text-[11px]">
                      {inv.ledgers.purchaseLedger}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {inv.isInterstate ? inv.ledgers.igstLedger : `${inv.ledgers.cgstLedger}`}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === "Pushed to Tally"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRemoveInvoice(inv.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                      title="Remove from batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail & Tally Voucher Inspector Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tally Purchase Voucher Structure
                </h3>
                <p className="text-xs text-slate-500">
                  File: {selectedInvoice.fileName} &bull; Invoice #{selectedInvoice.invoiceNo}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Vendor Name:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.vendorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vendor GSTIN:</span>
                  <span className="font-mono font-bold text-brand-700">{selectedInvoice.vendorGstin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Invoice Number:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedInvoice.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Invoice Date:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.invoiceDate}</span>
                </div>
              </div>

              {/* Exact Double Entry Accounting in Tally */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex justify-between">
                  <span>Double Entry Voucher In Tally Prime</span>
                  <span>VOUCHER TYPE: PURCHASE</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Ledger Name</th>
                      <th className="p-2.5">Tally Classification</th>
                      <th className="p-2.5 text-right">Debit (Dr)</th>
                      <th className="p-2.5 text-right">Credit (Cr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Supplier Credit */}
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">{selectedInvoice.vendorName}</td>
                      <td className="p-2.5 text-slate-500">Sundry Creditors</td>
                      <td className="p-2.5 text-right text-slate-400">-</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        {formatINR(selectedInvoice.totalAmount)}
                      </td>
                    </tr>
                    {/* Purchase Account Debit */}
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {selectedInvoice.ledgers.purchaseLedger}
                      </td>
                      <td className="p-2.5 text-slate-500">Purchase Accounts</td>
                      <td className="p-2.5 text-right font-mono font-semibold text-rose-600">
                        {formatINR(selectedInvoice.taxableValue)}
                      </td>
                      <td className="p-2.5 text-right text-slate-400">-</td>
                    </tr>
                    {/* Tax Debit */}
                    {selectedInvoice.isInterstate ? (
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">
                          {selectedInvoice.ledgers.igstLedger}
                        </td>
                        <td className="p-2.5 text-slate-500">Duties &amp; Taxes</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-rose-600">
                          {formatINR(selectedInvoice.igst)}
                        </td>
                        <td className="p-2.5 text-right text-slate-400">-</td>
                      </tr>
                    ) : (
                      <>
                        <tr>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {selectedInvoice.ledgers.cgstLedger}
                          </td>
                          <td className="p-2.5 text-slate-500">Duties &amp; Taxes</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-rose-600">
                            {formatINR(selectedInvoice.cgst)}
                          </td>
                          <td className="p-2.5 text-right text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {selectedInvoice.ledgers.sgstLedger}
                          </td>
                          <td className="p-2.5 text-slate-500">Duties &amp; Taxes</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-rose-600">
                            {formatINR(selectedInvoice.sgst)}
                          </td>
                          <td className="p-2.5 text-right text-slate-400">-</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-slate-900">Total Voucher Balance</td>
                      <td className="p-2.5 text-right font-mono text-rose-600">
                        {formatINR(selectedInvoice.totalAmount)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">
                        {formatINR(selectedInvoice.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
