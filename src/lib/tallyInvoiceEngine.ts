export type InvoiceType = "Purchase" | "Sales";

export interface ParsedInvoice {
  id: string;
  fileName: string;
  type?: InvoiceType; // "Purchase" or "Sales"
  vendorName: string; // Supplier (for Purchase) or Customer (for Sales)
  vendorGstin: string;
  buyerName: string;
  buyerGstin: string;
  invoiceNo: string;
  invoiceDate: string; // YYYY-MM-DD
  taxableValue: number;
  taxRate: number; // e.g. 5, 12, 18, 28
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  totalAmount: number;
  isInterstate: boolean;
  supplierState: string;
  buyerState: string;
  ledgers: {
    vendorLedger: string; // Party ledger (Sundry Creditor or Sundry Debtor)
    purchaseLedger: string; // Target Purchase A/c or Sales A/c
    cgstLedger?: string; // Input CGST or Output CGST
    sgstLedger?: string; // Input SGST or Output SGST
    igstLedger?: string; // Input IGST or Output IGST
    roundOffLedger?: string;
  };
  status: "Uploaded" | "OCR Parsing" | "Matched" | "Pushed to Tally" | "Failed";
  tallyResponse?: string;
}

export const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

/**
 * Determine GST ledgers and tax breakdown based on buyer and seller GSTINs
 * Supports both Purchase and Sales transactions
 */
export function determineGstLedgers(
  vendorGstin: string,
  buyerGstin: string,
  taxableValue: number,
  taxRate: number,
  invoiceType: InvoiceType = "Purchase"
) {
  const vendorStateCode = vendorGstin.slice(0, 2);
  const buyerStateCode = buyerGstin.slice(0, 2);

  const supplierState = GST_STATE_CODES[vendorStateCode] || "Other State";
  const buyerState = GST_STATE_CODES[buyerStateCode] || "Delhi";

  // Inter-state vs Intra-state
  const isInterstate = vendorStateCode !== buyerStateCode;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterstate) {
    igst = Number(((taxableValue * taxRate) / 100).toFixed(2));
  } else {
    const halfRate = taxRate / 2;
    cgst = Number(((taxableValue * halfRate) / 100).toFixed(2));
    sgst = Number(((taxableValue * halfRate) / 100).toFixed(2));
  }

  const exactTotal = taxableValue + cgst + sgst + igst;
  const roundedTotal = Math.round(exactTotal);
  const roundOff = Number((roundedTotal - exactTotal).toFixed(2));

  // Ledger naming based on Purchase vs Sales
  let mainAccountLedger: string;
  let cgstLedgerName: string | undefined;
  let sgstLedgerName: string | undefined;
  let igstLedgerName: string | undefined;

  if (invoiceType === "Sales") {
    mainAccountLedger = isInterstate
      ? `Sales - Interstate @ ${taxRate}%`
      : `Sales - GST @ ${taxRate}%`;
    cgstLedgerName = isInterstate ? undefined : `Output CGST @ ${taxRate / 2}%`;
    sgstLedgerName = isInterstate ? undefined : `Output SGST @ ${taxRate / 2}%`;
    igstLedgerName = isInterstate ? `Output IGST @ ${taxRate}%` : undefined;
  } else {
    mainAccountLedger = isInterstate
      ? `Purchase - Interstate @ ${taxRate}%`
      : `Purchase - GST @ ${taxRate}%`;
    cgstLedgerName = isInterstate ? undefined : `Input CGST @ ${taxRate / 2}%`;
    sgstLedgerName = isInterstate ? undefined : `Input SGST @ ${taxRate / 2}%`;
    igstLedgerName = isInterstate ? `Input IGST @ ${taxRate}%` : undefined;
  }

  return {
    isInterstate,
    supplierState,
    buyerState,
    cgst,
    sgst,
    igst,
    roundOff,
    totalAmount: roundedTotal,
    purchaseLedger: mainAccountLedger,
    cgstLedger: cgstLedgerName,
    sgstLedger: sgstLedgerName,
    igstLedger: igstLedgerName,
    roundOffLedger: roundOff !== 0 ? "Round Off (+/-)" : undefined,
  };
}

/**
 * Generates XML definition for unique Ledgers (Sundry Creditors / Debtors, Purchase / Sales A/c, Tax A/c)
 * This allows Tally Prime to automatically create missing ledgers on the fly during import!
 */
export function generateLedgerMastersXml(
  invoices: ParsedInvoice[],
  defaultType: InvoiceType = "Purchase"
): string {
  const ledgerMessages: string[] = [];
  const seenLedgers = new Set<string>();

  invoices.forEach((inv) => {
    const type = inv.type || defaultType;
    const isSales = type === "Sales";

    // 1. Party Ledger -> Sundry Creditors (for Purchase) OR Sundry Debtors (for Sales)
    const partyName = inv.vendorName?.trim() || (isSales ? "Customer A/c" : "Commercial Vendor");
    const partyGroup = isSales ? "Sundry Debtors" : "Sundry Creditors";
    const partyState = isSales ? inv.buyerState : inv.supplierState;
    const partyGstin = isSales ? inv.buyerGstin : inv.vendorGstin;

    if (!seenLedgers.has(partyName)) {
      seenLedgers.add(partyName);
      ledgerMessages.push(`
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(partyName)}" ACTION="Create">
            <NAME>${escapeXml(partyName)}</NAME>
            <PARENT>${partyGroup}</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <AFFECTSSTOCK>No</AFFECTSSTOCK>
            <COUNTRYNAME>India</COUNTRYNAME>
            <LEDSTATENAME>${escapeXml(partyState)}</LEDSTATENAME>
            <PARTYGSTIN>${escapeXml(partyGstin)}</PARTYGSTIN>
            <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
          </LEDGER>
        </TALLYMESSAGE>`);
    }

    // 2. Main Account Ledger -> Purchase Accounts OR Sales Accounts
    const mainLedger = inv.ledgers.purchaseLedger;
    const mainGroup = isSales ? "Sales Accounts" : "Purchase Accounts";
    if (mainLedger && !seenLedgers.has(mainLedger)) {
      seenLedgers.add(mainLedger);
      ledgerMessages.push(`
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(mainLedger)}" ACTION="Create">
            <NAME>${escapeXml(mainLedger)}</NAME>
            <PARENT>${mainGroup}</PARENT>
            <ISCOSTCENTRESON>No</ISCOSTCENTRESON>
            <AFFECTSSTOCK>No</AFFECTSSTOCK>
            <ISGSTAPPLICABLE>Applicable</ISGSTAPPLICABLE>
          </LEDGER>
        </TALLYMESSAGE>`);
    }

    // 3. Tax Ledgers -> Duties & Taxes
    if (inv.isInterstate && inv.ledgers.igstLedger && !seenLedgers.has(inv.ledgers.igstLedger)) {
      seenLedgers.add(inv.ledgers.igstLedger);
      ledgerMessages.push(`
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(inv.ledgers.igstLedger)}" ACTION="Create">
            <NAME>${escapeXml(inv.ledgers.igstLedger)}</NAME>
            <PARENT>Duties &amp; Taxes</PARENT>
            <TAXTYPE>GST</TAXTYPE>
            <GSTDUTYHEAD>Integrated Tax</GSTDUTYHEAD>
            <RATEOFTAXCALCULATION>${inv.taxRate}</RATEOFTAXCALCULATION>
          </LEDGER>
        </TALLYMESSAGE>`);
    } else {
      if (inv.ledgers.cgstLedger && !seenLedgers.has(inv.ledgers.cgstLedger)) {
        seenLedgers.add(inv.ledgers.cgstLedger);
        ledgerMessages.push(`
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(inv.ledgers.cgstLedger)}" ACTION="Create">
            <NAME>${escapeXml(inv.ledgers.cgstLedger)}</NAME>
            <PARENT>Duties &amp; Taxes</PARENT>
            <TAXTYPE>GST</TAXTYPE>
            <GSTDUTYHEAD>Central Tax</GSTDUTYHEAD>
            <RATEOFTAXCALCULATION>${inv.taxRate / 2}</RATEOFTAXCALCULATION>
          </LEDGER>
        </TALLYMESSAGE>`);
      }
      if (inv.ledgers.sgstLedger && !seenLedgers.has(inv.ledgers.sgstLedger)) {
        seenLedgers.add(inv.ledgers.sgstLedger);
        ledgerMessages.push(`
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${escapeXml(inv.ledgers.sgstLedger)}" ACTION="Create">
            <NAME>${escapeXml(inv.ledgers.sgstLedger)}</NAME>
            <PARENT>Duties &amp; Taxes</PARENT>
            <TAXTYPE>GST</TAXTYPE>
            <GSTDUTYHEAD>State Tax</GSTDUTYHEAD>
            <RATEOFTAXCALCULATION>${inv.taxRate / 2}</RATEOFTAXCALCULATION>
          </LEDGER>
        </TALLYMESSAGE>`);
      }
    }

    // 4. Round Off Ledger
    if (inv.roundOff !== 0 && !seenLedgers.has("Round Off (+/-)")) {
      seenLedgers.add("Round Off (+/-)");
      ledgerMessages.push(`
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="Round Off (+/-)" ACTION="Create">
            <NAME>Round Off (+/-)</NAME>
            <PARENT>Indirect Expenses</PARENT>
            <ISCOSTCENTRESON>No</ISCOSTCENTRESON>
          </LEDGER>
        </TALLYMESSAGE>`);
    }
  });

  return ledgerMessages.join("\n");
}

/**
 * Generates an official, Tally Prime-compliant XML import envelope for multiple purchase or sales vouchers.
 * By default includes auto-creation of missing ledgers so Tally will create them automatically!
 */
export function buildBatchTallyPurchaseXml(
  companyName: string,
  invoices: ParsedInvoice[],
  autoCreateLedgers: boolean = true,
  invoiceType: InvoiceType = "Purchase"
): string {
  // 1. Generate auto-create Ledgers if enabled
  const ledgersXml = autoCreateLedgers ? generateLedgerMastersXml(invoices, invoiceType) : "";

  // 2. Generate Vouchers (Purchase or Sales)
  const voucherMessages = invoices
    .map((inv) => {
      const type = inv.type || invoiceType;
      const isSales = type === "Sales";
      const voucherTypeName = isSales ? "Sales" : "Purchase";

      const tallyDate = (inv.invoiceDate || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
      const cleanInvNo = escapeXml(inv.invoiceNo || (isSales ? "SALES-001" : "INV-001"));
      const cleanParty = escapeXml(inv.vendorName || (isSales ? "Sundry Debtor" : "Sundry Creditor"));
      const cleanNarration = escapeXml(
        `${voucherTypeName} Invoice #${inv.invoiceNo} dt. ${inv.invoiceDate} ${isSales ? "to" : "from"} ${inv.vendorName} (GSTIN: ${inv.vendorGstin})`
      );

      let ledgerEntriesXml = "";

      if (isSales) {
        // SALES ACCOUNTING ENTRIES:
        // 1. Customer (Debtor): Debited (ISDEEMEDPOSITIVE = Yes, Amount = negative Total)
        // 2. Sales Account: Credited (ISDEEMEDPOSITIVE = No, Amount = positive Taxable)
        // 3. Tax Ledgers: Credited (ISDEEMEDPOSITIVE = No, Amount = positive Tax)
        // 4. Round Off: Credited/Debited as required
        ledgerEntriesXml = `
          <!-- Customer / Debtor (Debit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${cleanParty}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${Math.abs(inv.totalAmount).toFixed(2)}</AMOUNT>
            <BILLALLOCATIONS.LIST>
              <NAME>${cleanInvNo}</NAME>
              <BILLTYPE>New Ref</BILLTYPE>
              <AMOUNT>-${Math.abs(inv.totalAmount).toFixed(2)}</AMOUNT>
            </BILLALLOCATIONS.LIST>
          </ALLLEDGERENTRIES.LIST>

          <!-- Sales Account (Credit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.purchaseLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${Math.abs(inv.taxableValue).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;

        if (inv.isInterstate && inv.igst > 0 && inv.ledgers.igstLedger) {
          ledgerEntriesXml += `
          <!-- Output IGST (Credit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.igstLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${Math.abs(inv.igst).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
        } else {
          if (inv.cgst > 0 && inv.ledgers.cgstLedger) {
            ledgerEntriesXml += `
          <!-- Output CGST (Credit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.cgstLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${Math.abs(inv.cgst).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
          }
          if (inv.sgst > 0 && inv.ledgers.sgstLedger) {
            ledgerEntriesXml += `
          <!-- Output SGST (Credit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.sgstLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${Math.abs(inv.sgst).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
          }
        }

        if (inv.roundOff !== 0) {
          // For sales: if roundOff > 0 (e.g. 100.40 -> 101.00), customer owes more, so credit round off income
          const isDebit = inv.roundOff < 0;
          ledgerEntriesXml += `
          <!-- Round Off -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Round Off (+/-)</LEDGERNAME>
            <ISDEEMEDPOSITIVE>${isDebit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
            <AMOUNT>${isDebit ? -Math.abs(inv.roundOff).toFixed(2) : Math.abs(inv.roundOff).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
        }
      } else {
        // PURCHASE ACCOUNTING ENTRIES:
        // 1. Supplier / Party: Credited (ISDEEMEDPOSITIVE = No, Amount = positive Total)
        // 2. Purchase Account: Debited (ISDEEMEDPOSITIVE = Yes, Amount = negative Taxable)
        // 3. Tax Ledgers: Debited (ISDEEMEDPOSITIVE = Yes, Amount = negative Tax)
        // 4. Round Off: Debited/Credited as required
        ledgerEntriesXml = `
          <!-- Supplier (Credit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${cleanParty}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${Math.abs(inv.totalAmount).toFixed(2)}</AMOUNT>
            <BILLALLOCATIONS.LIST>
              <NAME>${cleanInvNo}</NAME>
              <BILLTYPE>New Ref</BILLTYPE>
              <AMOUNT>${Math.abs(inv.totalAmount).toFixed(2)}</AMOUNT>
            </BILLALLOCATIONS.LIST>
          </ALLLEDGERENTRIES.LIST>

          <!-- Purchase Account (Debit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.purchaseLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${Math.abs(inv.taxableValue).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;

        if (inv.isInterstate && inv.igst > 0 && inv.ledgers.igstLedger) {
          ledgerEntriesXml += `
          <!-- Input IGST (Debit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.igstLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${Math.abs(inv.igst).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
        } else {
          if (inv.cgst > 0 && inv.ledgers.cgstLedger) {
            ledgerEntriesXml += `
          <!-- Input CGST (Debit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.cgstLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${Math.abs(inv.cgst).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
          }
          if (inv.sgst > 0 && inv.ledgers.sgstLedger) {
            ledgerEntriesXml += `
          <!-- Input SGST (Debit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(inv.ledgers.sgstLedger)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${Math.abs(inv.sgst).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
          }
        }

        if (inv.roundOff !== 0) {
          const isDebit = inv.roundOff < 0;
          ledgerEntriesXml += `
          <!-- Round Off -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Round Off (+/-)</LEDGERNAME>
            <ISDEEMEDPOSITIVE>${isDebit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
            <AMOUNT>${isDebit ? -Math.abs(inv.roundOff).toFixed(2) : Math.abs(inv.roundOff).toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
        }
      }

      return `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${voucherTypeName}" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>${voucherTypeName}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${cleanInvNo}</VOUCHERNUMBER>
            <REFERENCE>${cleanInvNo}</REFERENCE>
            <REFERENCEDATE>${tallyDate}</REFERENCEDATE>
            <PARTYLEDGERNAME>${cleanParty}</PARTYLEDGERNAME>
            <NARRATION>${cleanNarration}</NARRATION>
            ${ledgerEntriesXml}
          </VOUCHER>
        </TALLYMESSAGE>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${ledgersXml}
        ${voucherMessages}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

/**
 * Generates pure Master XML specifically for Tally Prime "Import > Masters" menu.
 */
export function buildBatchTallyLedgerMasterXml(
  companyName: string,
  invoices: ParsedInvoice[],
  invoiceType: InvoiceType = "Purchase"
): string {
  const ledgersXml = generateLedgerMastersXml(invoices, invoiceType);
  return `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${ledgersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

function escapeXml(unsafe: string): string {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
