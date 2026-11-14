"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  Download,
  Eye,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  FileSpreadsheet,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Archive,
  FolderArchive,
  Edit3,
  Check
} from "lucide-react";
import {
  ParsedInvoice,
  InvoiceType,
  buildBatchTallyPurchaseXml,
  buildBatchTallyLedgerMasterXml,
  determineGstLedgers
} from "@/lib/tallyInvoiceEngine";

export default function InvoicesOCRPage() {
  // Toggle between Purchase and Sales
  const [activeTab, setActiveTab] = useState<InvoiceType>("Purchase");

  // Client Company Details (e.g. PrimeX Trading Firm)
  const [companyName, setCompanyName] = useState<string>("PrimeX Trading Firm");
  const [companyGstin, setCompanyGstin] = useState<string>("07AABCP1234F1Z5");
  const [isEditingCompany, setIsEditingCompany] = useState<boolean>(false);
  const [tempCompanyName, setTempCompanyName] = useState<string>("PrimeX Trading Firm");
  const [tempCompanyGstin, setTempCompanyGstin] = useState<string>("07AABCP1234F1Z5");

  // Empty initial queues
  const [invoices, setInvoices] = useState<ParsedInvoice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPushingToTally, setIsPushingToTally] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ParsedInvoice | null>(null);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [pushErrorDetails, setPushErrorDetails] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch tab handler
  const handleTabChange = (tab: InvoiceType) => {
    setActiveTab(tab);
    setPushStatusMessage(null);
    setPushErrorDetails(null);
  };

  // Filter invoices for currently active tab
  const currentInvoices = invoices.filter(
    (inv) => (inv.type || "Purchase") === activeTab
  );

  // Save company details
  const handleSaveCompany = () => {
    setCompanyName(tempCompanyName.trim() || "PrimeX Trading Firm");
    setCompanyGstin(tempCompanyGstin.trim().toUpperCase() || "07AABCP1234F1Z5");
    setIsEditingCompany(false);
  };

  // Process selected file list
  const processFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    setPushStatusMessage(null);
    setPushErrorDetails(null);

    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
    }
    formData.append("invoiceType", activeTab);
    formData.append("buyerGstin", companyGstin);
    formData.append("buyerName", companyName);

    try {
      const res = await fetch("/api/invoices/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.invoices) {
        setInvoices((prev) => [...data.invoices, ...prev]);
        setPushStatusMessage(
          `Successfully processed ${data.invoices.length} ${activeTab} invoice(s)! Extracted distinct ${
            activeTab === "Sales" ? "Customer" : "Vendor"
          } details and prepared Tally vouchers.`
        );
      } else {
        alert("Extraction failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error uploading invoices: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update field in an invoice (allows CA to correct any vendor name or amount)
  const handleUpdateInvoiceField = (
    id: string,
    field: "vendorName" | "vendorGstin" | "invoiceNo" | "invoiceDate" | "taxableValue" | "taxRate",
    value: any
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;

        const updated = { ...inv, [field]: value };
        // If tax or amount changed, recalculate GST split
        const taxable = field === "taxableValue" ? Number(value) || 0 : inv.taxableValue;
        const rate = field === "taxRate" ? Number(value) || 18 : inv.taxRate;
        const gstin = field === "vendorGstin" ? String(value) : inv.vendorGstin;

        const gstDetails = determineGstLedgers(
          gstin,
          companyGstin,
          taxable,
          rate,
          inv.type || activeTab
        );

        updated.taxableValue = taxable;
        updated.taxRate = rate;
        updated.vendorGstin = gstin;
        updated.cgst = gstDetails.cgst;
        updated.sgst = gstDetails.sgst;
        updated.igst = gstDetails.igst;
        updated.roundOff = gstDetails.roundOff;
        updated.totalAmount = gstDetails.totalAmount;
        updated.isInterstate = gstDetails.isInterstate;
        updated.supplierState = gstDetails.supplierState;
        updated.buyerState = gstDetails.buyerState;
        updated.ledgers = {
          vendorLedger: field === "vendorName" ? String(value) : inv.ledgers.vendorLedger,
          purchaseLedger: gstDetails.purchaseLedger,
          cgstLedger: gstDetails.cgstLedger,
          sgstLedger: gstDetails.sgstLedger,
          igstLedger: gstDetails.igstLedger,
          roundOffLedger: gstDetails.roundOffLedger,
        };

        if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice(updated);
        }

        return updated;
      })
    );
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Push directly to Tally Prime (port 9000)
  const handlePushAllToTally = async () => {
    if (currentInvoices.length === 0) return;

    setIsPushingToTally(true);
    setPushStatusMessage(null);
    setPushErrorDetails(null);

    try {
      const xmlPayload = buildBatchTallyPurchaseXml(
        companyName,
        currentInvoices,
        true,
        activeTab
      );

      const res = await fetch("/api/tally/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xml: xmlPayload }),
      });

      const result = await res.json();
      if (result.success) {
        setPushStatusMessage(
          `✓ Successfully pushed ${currentInvoices.length} ${activeTab} vouchers into Tally Prime (Port 9000)! Entries are now in your Day Book.`
        );
        setInvoices((prev) =>
          prev.map((inv) =>
            (inv.type || "Purchase") === activeTab
              ? { ...inv, status: "Pushed to Tally" }
              : inv
          )
        );
      } else {
        setPushErrorDetails(
          result.error ||
            "Unable to reach Tally Prime on port 9000. Ensure Tally Prime XML server is enabled (F1 > Settings > Connectivity > Port 9000) or run python3 tally-bridge.py."
        );
      }
    } catch (err: any) {
      setPushErrorDetails(
        "Direct connection to Tally Prime failed: " +
          err.message +
          ". You can still click 'Download Tally XML' below to import instantly via Tally Import menu."
      );
    } finally {
      setIsPushingToTally(false);
    }
  };

  // Helper to generate a unique, non-colliding file name on every download
  const generateUniqueFileName = (type: string, isMasters: boolean = false) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");
    const randomTag = Math.random().toString(36).substring(2, 6).toUpperCase();
    const masterLabel = isMasters ? "Masters_" : "";
    return `Papneja_Tally_${type}_${masterLabel}${currentInvoices.length}Bills_${dateStr}_${timeStr}_${randomTag}.xml`;
  };

  // Download Tally XML file (Unified Vouchers + Auto-Created Ledgers)
  const handleDownloadXml = () => {
    if (currentInvoices.length === 0) return;
    const xmlPayload = buildBatchTallyPurchaseXml(
      companyName,
      currentInvoices,
      true,
      activeTab
    );
    const blob = new Blob([xmlPayload], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateUniqueFileName(activeTab, false);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Ledgers Master XML file (for Import > Masters)
  const handleDownloadMastersXml = () => {
    if (currentInvoices.length === 0) return;
    const xmlPayload = buildBatchTallyLedgerMasterXml(
      companyName,
      currentInvoices,
      activeTab
    );
    const blob = new Blob([xmlPayload], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateUniqueFileName(activeTab, true);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete invoice from queue
  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(null);
    }
  };

  // Clear current tab queue
  const handleClearAll = () => {
    setInvoices((prev) =>
      prev.filter((inv) => (inv.type || "Purchase") !== activeTab)
    );
    setPushStatusMessage(null);
    setPushErrorDetails(null);
  };

  // Total metrics
  const totalTaxable = currentInvoices.reduce((sum, inv) => sum + inv.taxableValue, 0);
  const totalTax = currentInvoices.reduce(
    (sum, inv) => sum + inv.cgst + inv.sgst + inv.igst,
    0
  );
  const totalGrand = currentInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === "Purchase" ? "Purchase Invoice" : "Sales Invoice"} Automation • Tally Integration
            </h1>

            {/* Editable Company Badge */}
            {isEditingCompany ? (
              <div className="flex items-center gap-2 bg-blue-50 p-1.5 rounded-xl border border-blue-300">
                <input
                  type="text"
                  value={tempCompanyName}
                  onChange={(e) => setTempCompanyName(e.target.value)}
                  placeholder="Company Name (in Tally)"
                  className="px-2 py-1 text-xs font-bold border border-blue-200 rounded-lg text-slate-900 bg-white"
                />
                <input
                  type="text"
                  value={tempCompanyGstin}
                  onChange={(e) => setTempCompanyGstin(e.target.value)}
                  placeholder="15-digit GSTIN"
                  className="px-2 py-1 text-xs font-mono border border-blue-200 rounded-lg text-slate-900 bg-white w-32"
                />
                <button
                  onClick={handleSaveCompany}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempCompanyName(companyName);
                  setTempCompanyGstin(companyGstin);
                  setIsEditingCompany(true);
                }}
                title="Click to edit your company name as named in Tally Prime"
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>My Firm: <strong>{companyName}</strong> ({companyGstin})</span>
                <Edit3 className="w-3 h-3 text-blue-400 group-hover:text-blue-700" />
              </button>
            )}

            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Auto-Creates Missing Ledgers in Tally
            </span>
          </div>

          <p className="text-sm text-slate-500">
            {activeTab === "Purchase"
              ? `Extracts third-party vendors selling to "${companyName}", calculates GST splits, and records purchase vouchers.`
              : `Extracts customers buying from "${companyName}", calculates output GST, and records sales vouchers.`}
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          {currentInvoices.length > 0 && (
            <>
              <button
                onClick={handleClearAll}
                className="px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
              >
                Clear Queue
              </button>
              <button
                onClick={handleDownloadMastersXml}
                title="Download Ledger Masters XML to import via Tally Prime > Import > Masters"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Masters XML</span>
              </button>
              <button
                onClick={handleDownloadXml}
                title="Consolidates all uploaded PDFs & JPEGs into 1 single XML file for 1-click import into Tally Prime"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Single Combined XML ({currentInvoices.length} Bills)</span>
              </button>
              <button
                onClick={handlePushAllToTally}
                disabled={isPushingToTally}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                {isPushingToTally ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Pushing to Port 9000...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Push {currentInvoices.length} to Tally Prime</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* PURCHASE vs SALES TAB SELECTOR */}
      <div className="flex border-b border-slate-200 bg-white px-6 pt-3 rounded-2xl shadow-sm gap-4">
        <button
          onClick={() => handleTabChange("Purchase")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-bold transition-all ${
            activeTab === "Purchase"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Bills (Vendors)</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {invoices.filter((i) => (i.type || "Purchase") === "Purchase").length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("Sales")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-bold transition-all ${
            activeTab === "Sales"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales Invoices (Customers)</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {invoices.filter((i) => i.type === "Sales").length}
          </span>
        </button>
      </div>

      {/* DRAG & DROP UPLOAD ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-white ${
          isDragging
            ? "border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/20"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.zip"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${
              isDragging
                ? "bg-blue-600 text-white scale-110 shadow-lg"
                : activeTab === "Sales"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : activeTab === "Sales" ? (
              <TrendingUp className="w-8 h-8" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {isProcessing
                ? `Unpacking & Extracting ${activeTab} Invoices with AI...`
                : `Drop your real ${activeTab} invoices or a ZIP archive here`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports real <strong>PDF, JPG, PNG, WEBP</strong>, and <strong>.ZIP archives</strong> (auto-extracts and converts 20, 50, or 100+ bills into one XML).
            </p>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className={`px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2 ${
              activeTab === "Sales"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Unpacking & reading invoices...</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>Choose Invoices or ZIP File from Computer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {pushStatusMessage && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{pushStatusMessage}</div>
          <button
            onClick={() => setPushStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {pushErrorDetails && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{pushErrorDetails}</p>
            <p className="text-xs text-amber-700 mt-1">
              Tip: You can always click <strong>"Download Single Combined XML"</strong> to import the vouchers directly via Tally Prime &gt; Import &gt; Transactions without any network configuration!
            </p>
          </div>
          <button
            onClick={() => setPushErrorDetails(null)}
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary KPI Cards (Only when invoices exist) */}
      {currentInvoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {activeTab} Vouchers Ready
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {currentInvoices.length} Vouchers
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              {activeTab === "Sales"
                ? "Mapped to Customer (Debtor) & Sales A/c"
                : "Mapped to Vendor (Creditor) & Purchase A/c"}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Taxable Value
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              ₹{totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {activeTab === "Sales" ? "Credit to Sales Ledgers" : "Debit to Purchase Ledgers"}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {activeTab === "Sales" ? "Output GST Liability" : "Input Tax Credit (ITC)"}
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1">
              CGST + SGST + IGST Split
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Invoice Amount
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              ₹{totalGrand.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {activeTab === "Sales" ? "Debit to Customer Accounts" : "Credit to Vendor Accounts"}
            </div>
          </div>
        </div>
      )}

      {/* BATCH INVOICE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {activeTab} Batch Queue ({currentInvoices.length}) • Double Entry Mappings
            </h2>
          </div>
          {currentInvoices.length > 0 && (
            <span className="text-xs text-slate-400">
              Click any row to inspect &amp; edit vendor details or debit/credit structure
            </span>
          )}
        </div>

        {currentInvoices.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No {activeTab} invoices in queue</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Drop your real {activeTab} invoice PDFs, images, or a ZIP archive above. The AI will extract distinct {activeTab === "Sales" ? "customer" : "vendor"} details, calculate GST, and prepare the Tally XML automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">
                    {activeTab === "Sales" ? "Customer / Debtor" : "Vendor / Creditor"}
                  </th>
                  <th className="py-3 px-4">Invoice # &amp; Date</th>
                  <th className="py-3 px-4">GST Nature</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Tax (C+S / IGST)</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4">
                    {activeTab === "Sales" ? "Target Sales Ledger" : "Target Purchase Ledger"}
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.vendorName}</div>
                      <div className="text-[11px] text-blue-600 font-mono">
                        {inv.vendorGstin}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{inv.invoiceNo}</div>
                      <div className="text-[11px] text-slate-400">{inv.invoiceDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      {inv.isInterstate ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Inter-state ({inv.supplierState} → {inv.buyerState})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Intra-state ({inv.supplierState})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{inv.taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {inv.isInterstate ? (
                        <span className="text-purple-700 font-bold">
                          IGST: ₹{inv.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-blue-700 font-bold">
                          C+S: ₹{(inv.cgst + inv.sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{inv.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{inv.ledgers.purchaseLedger}</div>
                      <div className="text-[10px] text-slate-400">
                        {inv.isInterstate ? inv.ledgers.igstLedger : `${inv.ledgers.cgstLedger} & ${inv.ledgers.sgstLedger}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInvoice(inv.id);
                        }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TALLY VOUCHER INSPECTION & EDIT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  Edit &amp; Inspect {selectedInvoice.type || activeTab} Voucher
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Editable Fields */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Invoice Details (Editable)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <label className="font-semibold text-slate-600">
                      {(selectedInvoice.type || activeTab) === "Sales" ? "Customer Name" : "Vendor / Supplier Name"}
                    </label>
                    <input
                      type="text"
                      value={selectedInvoice.vendorName}
                      onChange={(e) =>
                        handleUpdateInvoiceField(selectedInvoice.id, "vendorName", e.target.value)
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">
                      {(selectedInvoice.type || activeTab) === "Sales" ? "Customer GSTIN" : "Vendor GSTIN"}
                    </label>
                    <input
                      type="text"
                      value={selectedInvoice.vendorGstin}
                      onChange={(e) =>
                        handleUpdateInvoiceField(selectedInvoice.id, "vendorGstin", e.target.value)
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono bg-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">Invoice Number</label>
                    <input
                      type="text"
                      value={selectedInvoice.invoiceNo}
                      onChange={(e) =>
                        handleUpdateInvoiceField(selectedInvoice.id, "invoiceNo", e.target.value)
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">Invoice Date</label>
                    <input
                      type="date"
                      value={selectedInvoice.invoiceDate}
                      onChange={(e) =>
                        handleUpdateInvoiceField(selectedInvoice.id, "invoiceDate", e.target.value)
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">Taxable Amount (₹)</label>
                    <input
                      type="number"
                      value={selectedInvoice.taxableValue}
                      onChange={(e) =>
                        handleUpdateInvoiceField(selectedInvoice.id, "taxableValue", e.target.value)
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">GST Rate (%)</label>
                    <select
                      value={selectedInvoice.taxRate}
                      onChange={(e) =>
                        handleUpdateInvoiceField(selectedInvoice.id, "taxRate", Number(e.target.value))
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Accounting Entries */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tally Accounting Ledger Entries (Dr / Cr)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Ledger Name</th>
                        <th className="py-2 px-3 text-right">Debit (Dr)</th>
                        <th className="py-2 px-3 text-right">Credit (Cr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {(selectedInvoice.type || activeTab) === "Sales" ? (
                        <>
                          <tr className="bg-blue-50/30">
                            <td className="py-2 px-3 text-blue-700 font-bold">DR</td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-800">
                              {selectedInvoice.ledgers.vendorLedger} (Customer / Debtor)
                            </td>
                            <td className="py-2 px-3 text-right text-blue-700 font-bold">
                              ₹{selectedInvoice.totalAmount.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">-</td>
                          </tr>

                          <tr className="bg-emerald-50/30">
                            <td className="py-2 px-3 text-emerald-700 font-bold">CR</td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-800">
                              {selectedInvoice.ledgers.purchaseLedger} (Sales A/c)
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">-</td>
                            <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                              ₹{selectedInvoice.taxableValue.toFixed(2)}
                            </td>
                          </tr>

                          {selectedInvoice.isInterstate ? (
                            <tr className="bg-emerald-50/30">
                              <td className="py-2 px-3 text-emerald-700 font-bold">CR</td>
                              <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                {selectedInvoice.ledgers.igstLedger}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                                ₹{selectedInvoice.igst.toFixed(2)}
                              </td>
                            </tr>
                          ) : (
                            <>
                              <tr className="bg-emerald-50/30">
                                <td className="py-2 px-3 text-emerald-700 font-bold">CR</td>
                                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                  {selectedInvoice.ledgers.cgstLedger}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-400">-</td>
                                <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                                  ₹{selectedInvoice.cgst.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="bg-emerald-50/30">
                                <td className="py-2 px-3 text-emerald-700 font-bold">CR</td>
                                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                  {selectedInvoice.ledgers.sgstLedger}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-400">-</td>
                                <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                                  ₹{selectedInvoice.sgst.toFixed(2)}
                                </td>
                              </tr>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <tr className="bg-emerald-50/30">
                            <td className="py-2 px-3 text-emerald-700 font-bold">DR</td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-800">
                              {selectedInvoice.ledgers.purchaseLedger}
                            </td>
                            <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                              ₹{selectedInvoice.taxableValue.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">-</td>
                          </tr>

                          {selectedInvoice.isInterstate ? (
                            <tr className="bg-emerald-50/30">
                              <td className="py-2 px-3 text-emerald-700 font-bold">DR</td>
                              <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                {selectedInvoice.ledgers.igstLedger}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                                ₹{selectedInvoice.igst.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          ) : (
                            <>
                              <tr className="bg-emerald-50/30">
                                <td className="py-2 px-3 text-emerald-700 font-bold">DR</td>
                                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                  {selectedInvoice.ledgers.cgstLedger}
                                </td>
                                <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                                  ₹{selectedInvoice.cgst.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-400">-</td>
                              </tr>
                              <tr className="bg-emerald-50/30">
                                <td className="py-2 px-3 text-emerald-700 font-bold">DR</td>
                                <td className="py-2 px-3 font-sans font-medium text-slate-800">
                                  {selectedInvoice.ledgers.sgstLedger}
                                </td>
                                <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                                  ₹{selectedInvoice.sgst.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-400">-</td>
                              </tr>
                            </>
                          )}

                          <tr className="bg-blue-50/30">
                            <td className="py-2 px-3 text-blue-700 font-bold">CR</td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-800">
                              {selectedInvoice.ledgers.vendorLedger} (Party / Creditor)
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">-</td>
                            <td className="py-2 px-3 text-right text-blue-700 font-bold">
                              ₹{selectedInvoice.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Balanced Total */}
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2 px-3" colSpan={2}>
                          Total (Voucher Balanced)
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700">
                          ₹{selectedInvoice.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700">
                          ₹{selectedInvoice.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
