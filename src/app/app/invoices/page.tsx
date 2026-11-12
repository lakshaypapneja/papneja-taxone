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
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface InvoiceData {
  id: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNo: string;
  invoiceDate: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
  hsnSummary: {
    hsn: string;
    description: string;
    taxRate: number;
    amount: number;
  }[];
  tallyPurchaseLedger: string;
  status: "OCR Verified" | "Ledger Matched" | "Ready to Push";
}

const sampleInvoices: InvoiceData[] = [
  {
    id: "inv-1",
    vendorName: "Bharat Petroleum Corporation Ltd",
    vendorGstin: "07AAACB2902M1ZI",
    invoiceNo: "BPCL/ND/99120",
    invoiceDate: "2026-10-14",
    taxableAmount: 145000,
    cgst: 13050,
    sgst: 13050,
    igst: 0,
    totalTax: 26100,
    grandTotal: 171100,
    hsnSummary: [
      { hsn: "2710", description: "High Speed Diesel / Industrial Lubricants", taxRate: 18, amount: 145000 },
    ],
    tallyPurchaseLedger: "Vehicle Fuel & Transportation - Diesel",
    status: "Ready to Push",
  },
  {
    id: "inv-2",
    vendorName: "Dell India Computer Pvt Ltd",
    vendorGstin: "29AABCD1002P1ZY",
    invoiceNo: "DELL-BLR-0091",
    invoiceDate: "2026-10-25",
    taxableAmount: 210000,
    cgst: 0,
    sgst: 0,
    igst: 37800,
    totalTax: 37800,
    grandTotal: 247800,
    hsnSummary: [
      { hsn: "8471", description: "Dell PowerEdge Server Hardware", taxRate: 18, amount: 210000 },
    ],
    tallyPurchaseLedger: "Computer & Server Equipment (Fixed Asset)",
    status: "OCR Verified",
  },
];

export default function InvoicesOCRPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>(sampleInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData>(sampleInvoices[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNote, setSuccessNote] = useState("");

  const handleSimulateNewUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newInv: InvoiceData = {
        id: `inv-${Date.now()}`,
        vendorName: "Godrej Modern Storage Solutions",
        vendorGstin: "27AAACG0563G1ZK",
        invoiceNo: "GMSS-24-1029",
        invoiceDate: "2026-10-18",
        taxableAmount: 88000,
        cgst: 7920,
        sgst: 7920,
        igst: 0,
        totalTax: 15840,
        grandTotal: 103840,
        hsnSummary: [
          { hsn: "9403", description: "Heavy Duty Warehouse Racks", taxRate: 18, amount: 88000 },
        ],
        tallyPurchaseLedger: "Office & Warehouse Fixtures",
        status: "OCR Verified",
      };
      setInvoices((prev) => [newInv, ...prev]);
      setSelectedInvoice(newInv);
      setSuccessNote("AI multimodal OCR successfully extracted invoice details with 99.4% confidence!");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Purchase &amp; Expense Invoice OCR</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Multimodal Vision Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Extract vendor GSTIN, invoice lines, tax breakdown, and auto-map directly to Tally purchase vouchers.
          </p>
        </div>

        <button
          onClick={handleSimulateNewUpload}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          {isProcessing ? "Processing Invoice OCR..." : "Upload Scanned Invoice / PDF"}
        </button>
      </div>

      {successNote && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{successNote}</span>
          </div>
          <button onClick={() => setSuccessNote("")} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Invoice List & Scanned Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Document Queue ({invoices.length})
            </h3>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedInvoice.id === inv.id
                      ? "bg-brand-50/50 border-brand-500 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{inv.vendorName}</span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {formatINR(inv.grandTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                    <span>{inv.invoiceNo} &bull; {inv.invoiceDate}</span>
                    <span className="text-emerald-700 font-sans font-semibold">{inv.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Invoice Simulation Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Raw Scanned Document Preview
              </span>
              <span className="text-[10px] font-mono">PDF_RENDER_100DPI</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2 leading-relaxed">
              <div className="font-bold text-white uppercase">{selectedInvoice.vendorName}</div>
              <div>GSTIN: {selectedInvoice.vendorGstin}</div>
              <div>TAX INVOICE: #{selectedInvoice.invoiceNo}</div>
              <div>DATE: {selectedInvoice.invoiceDate}</div>
              <div className="border-t border-slate-800 pt-2 text-slate-400">
                Line: {selectedInvoice.hsnSummary[0]?.description}
              </div>
              <div className="flex justify-between font-bold text-white pt-1">
                <span>TOTAL PAYABLE:</span>
                <span className="text-emerald-400">{formatINR(selectedInvoice.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Metadata & Tally Voucher Mapper */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Extracted Tax &amp; Voucher Data</h2>
              <p className="text-xs text-slate-500">Auto-calculated GST split and Tally ledger allocation</p>
            </div>
            <button
              onClick={() => alert(`Purchase Voucher created for Tally Prime: ${selectedInvoice.invoiceNo}`)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              Push Purchase Voucher
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Vendor Name</label>
              <input
                type="text"
                value={selectedInvoice.vendorName}
                readOnly
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Vendor GSTIN</label>
              <input
                type="text"
                value={selectedInvoice.vendorGstin}
                readOnly
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono font-semibold text-brand-700"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Invoice Number</label>
              <input
                type="text"
                value={selectedInvoice.invoiceNo}
                readOnly
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Invoice Date</label>
              <input
                type="text"
                value={selectedInvoice.invoiceDate}
                readOnly
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
          </div>

          {/* Tax Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 border-b border-slate-200 flex justify-between">
              <span>HSN / Taxable Breakdown</span>
              <span>18% GST Applicable</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right">Taxable</th>
                  <th className="p-3 text-right">CGST</th>
                  <th className="p-3 text-right">SGST</th>
                  <th className="p-3 text-right">IGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.hsnSummary.map((h, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono font-semibold text-brand-700">{h.hsn}</td>
                    <td className="p-3 text-slate-700">{h.description}</td>
                    <td className="p-3 text-right font-mono font-medium">{formatINR(selectedInvoice.taxableAmount)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(selectedInvoice.cgst)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(selectedInvoice.sgst)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(selectedInvoice.igst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ledger Mapping Assignment */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Target Tally Purchase / Expense Ledger</h4>
            <div className="flex gap-3">
              <select
                value={selectedInvoice.tallyPurchaseLedger}
                onChange={(e) =>
                  setSelectedInvoice({ ...selectedInvoice, tallyPurchaseLedger: e.target.value })
                }
                className="flex-1 text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
              >
                <option value="Vehicle Fuel & Transportation - Diesel">Vehicle Fuel &amp; Transportation - Diesel</option>
                <option value="Computer & Server Equipment (Fixed Asset)">Computer &amp; Server Equipment (Fixed Asset)</option>
                <option value="Office & Warehouse Fixtures">Office &amp; Warehouse Fixtures</option>
                <option value="General Purchase Account">General Purchase Account</option>
              </select>
              <button className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold">
                + Create New Ledger
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
