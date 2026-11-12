export interface ParsedInvoice {
  id: string;
  fileName: string;
  vendorName: string;
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
    vendorLedger: string;
    purchaseLedger: string;
    cgstLedger?: string;
    sgstLedger?: string;
    igstLedger?: string;
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
 */
export function determineGstLedgers(
  vendorGstin: string,
  buyerGstin: string,
  taxableValue: number,
  taxRate: number
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

  const purchaseLedger = isInterstate
    ? `Purchase - Interstate @ ${taxRate}%`
    : `Purchase - GST @ ${taxRate}%`;

  return {
    isInterstate,
    supplierState,
    buyerState,
    cgst,
    sgst,
    igst,
    roundOff,
    totalAmount: roundedTotal,
    purchaseLedger,
    cgstLedger: isInterstate ? undefined : `Input CGST @ ${taxRate / 2}%`,
    sgstLedger: isInterstate ? undefined : `Input SGST @ ${taxRate / 2}%`,
    igstLedger: isInterstate ? `Input IGST @ ${taxRate}%` : undefined,
    roundOffLedger: roundOff !== 0 ? "Round Off (+/-)" : undefined,
  };
}

/**
 * Generates an official, Tally Prime-compliant XML import envelope for multiple purchase vouchers
 */
export function buildBatchTallyPurchaseXml(
  companyName: string,
  invoices: ParsedInvoice[]
): string {
  const voucherMessages = invoices
    .map((inv) => {
      // Tally date format: YYYYMMDD
      const tallyDate = (inv.invoiceDate || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
      const cleanInvNo = escapeXml(inv.invoiceNo || "INV-001");
      const cleanVendor = escapeXml(inv.vendorName || "Sundry Creditor");
      const cleanNarration = escapeXml(
        `Purchase Invoice #${inv.invoiceNo} dt. ${inv.invoiceDate} from ${inv.vendorName} (GSTIN: ${inv.vendorGstin})`
      );

      // Build Ledger Entries:
      // In Tally Accounting Voucher for Purchase:
      // 1. Supplier / Party: Credited (ISDEEMEDPOSITIVE = No, Amount = positive Total)
      // 2. Purchase Account: Debited (ISDEEMEDPOSITIVE = Yes, Amount = negative Taxable)
      // 3. Tax Ledgers: Debited (ISDEEMEDPOSITIVE = Yes, Amount = negative Tax)
      // 4. Round Off: Debited/Credited as required
      let ledgerEntriesXml = `
          <!-- Supplier (Credit) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${cleanVendor}</LEDGERNAME>
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

      return `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${cleanInvNo}</VOUCHERNUMBER>
            <REFERENCE>${cleanInvNo}</REFERENCE>
            <REFERENCEDATE>${tallyDate}</REFERENCEDATE>
            <PARTYLEDGERNAME>${cleanVendor}</PARTYLEDGERNAME>
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
        ${voucherMessages}
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
