export interface ClientCompany {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  tallyCompany: string;
  financialYear: string;
  pendingTransactions: number;
  reconciliationStatus: "Reconciled" | "Mismatches Found" | "Pending Import";
}

export const mockClients: ClientCompany[] = [
  {
    id: "c1",
    name: "PrimeX Trading",
    gstin: "06GVZPS9712P1Z3",
    pan: "GVZPS9712P",
    tallyCompany: "PRIMEX TRADING",
    financialYear: "2026-2027",
    pendingTransactions: 20,
    reconciliationStatus: "Reconciled",
  },
  {
    id: "c2",
    name: "Sharma Hardware & Sanitary Mart",
    gstin: "07BAFPS5678K1Z3",
    pan: "BAFPS5678K",
    tallyCompany: "Sharma Hardware (2026-27)",
    financialYear: "2026-2027",
    pendingTransactions: 12,
    reconciliationStatus: "Reconciled",
  },
  {
    id: "c3",
    name: "TechSphere Solutions LLP",
    gstin: "27AAICT9012L1Z4",
    pan: "AAICT9012L",
    tallyCompany: "TechSphere Solutions 2026",
    financialYear: "2026-2027",
    pendingTransactions: 48,
    reconciliationStatus: "Pending Import",
  },
];

export interface BankTransaction {
  id: string;
  date: string;
  narration: string;
  chqRefNo: string;
  withdrawal: number;
  deposit: number;
  balance: number;
  suggestedLedger: string;
  selectedLedger: string;
  voucherType: "Payment" | "Receipt" | "Contra" | "Journal";
  status: "Auto-Matched" | "Reviewed" | "Needs Attention";
  confidence: number;
}

export const mockBankTransactions: BankTransaction[] = [
  {
    id: "tx-1",
    date: "2026-11-02",
    narration: "NEFT-AXIS000452-DLF COMMERCIAL PROPERTIES-RENT NOV26",
    chqRefNo: "NEFT2611020089",
    withdrawal: 85000,
    deposit: 0,
    balance: 412500.5,
    suggestedLedger: "Rent Expenses - Office",
    selectedLedger: "Rent Expenses - Office",
    voucherType: "Payment",
    status: "Auto-Matched",
    confidence: 98,
  },
  {
    id: "tx-2",
    date: "2026-11-03",
    narration: "UPI-ZOMATO-ORDER49810-GURGAON",
    chqRefNo: "UPI630981249",
    withdrawal: 1450,
    deposit: 0,
    balance: 411050.5,
    suggestedLedger: "Staff Welfare & Refreshment",
    selectedLedger: "Staff Welfare & Refreshment",
    voucherType: "Payment",
    status: "Auto-Matched",
    confidence: 95,
  },
  {
    id: "tx-3",
    date: "2026-11-04",
    narration: "IMPS-INB-FROM-SHARMA ENTERPRISES-INV2601",
    chqRefNo: "IMPS63091142",
    withdrawal: 0,
    deposit: 245000,
    balance: 656050.5,
    suggestedLedger: "Sharma Hardware & Sanitary Mart",
    selectedLedger: "Sharma Hardware & Sanitary Mart",
    voucherType: "Receipt",
    status: "Auto-Matched",
    confidence: 99,
  },
  {
    id: "tx-4",
    date: "2026-11-05",
    narration: "CHQ CLG-004512-HDFC BANK CHEQUE RETURN CHARGES",
    chqRefNo: "CHQ004512",
    withdrawal: 590,
    deposit: 0,
    balance: 655460.5,
    suggestedLedger: "Bank & Financial Charges",
    selectedLedger: "Bank & Financial Charges",
    voucherType: "Payment",
    status: "Auto-Matched",
    confidence: 96,
  },
  {
    id: "tx-5",
    date: "2026-11-07",
    narration: "RTGS-ICIC000109-METRO DIESEL DISTRIBUTORS-OCT FUEL",
    chqRefNo: "RTGS261107882",
    withdrawal: 165000,
    deposit: 0,
    balance: 490460.5,
    suggestedLedger: "Vehicle Fuel & Transportation",
    selectedLedger: "Vehicle Fuel & Transportation",
    voucherType: "Payment",
    status: "Needs Attention",
    confidence: 72,
  },
  {
    id: "tx-6",
    date: "2026-11-09",
    narration: "CREDIT INTEREST QUARTERLY AUTO CAPITALIZED",
    chqRefNo: "INT261109",
    withdrawal: 0,
    deposit: 12450,
    balance: 502910.5,
    suggestedLedger: "Bank Interest Income",
    selectedLedger: "Bank Interest Income",
    voucherType: "Receipt",
    status: "Auto-Matched",
    confidence: 100,
  },
];

export interface GSTReconciliationItem {
  id: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNo: string;
  invoiceDate: string;
  booksTaxable: number;
  booksGst: number;
  gstr2bTaxable: number;
  gstr2bGst: number;
  difference: number;
  status: "Matched" | "Tax Mismatch" | "Missing in 2B" | "Missing in Books";
  actionRequired: string;
}

export const mockGSTReconciliation: GSTReconciliationItem[] = [
  {
    id: "gst-1",
    vendorName: "Bharat Petroleum Corp Ltd",
    vendorGstin: "07AAACB2902M1ZI",
    invoiceNo: "BPCL/ND/99120",
    invoiceDate: "2026-10-14",
    booksTaxable: 145000,
    booksGst: 26100,
    gstr2bTaxable: 145000,
    gstr2bGst: 26100,
    difference: 0,
    status: "Matched",
    actionRequired: "Eligible for ITC in 3B",
  },
  {
    id: "gst-2",
    vendorName: "Godrej Modern Storage Solutions",
    vendorGstin: "27AAACG0563G1ZK",
    invoiceNo: "GMSS-24-1029",
    invoiceDate: "2026-10-18",
    booksTaxable: 88000,
    booksGst: 15840,
    gstr2bTaxable: 80000,
    gstr2bGst: 14400,
    difference: 1440,
    status: "Tax Mismatch",
    actionRequired: "Vendor filed lower value; notify vendor",
  },
  {
    id: "gst-3",
    vendorName: "Blue Dart Express Logistics",
    vendorGstin: "07AAACB2187K1ZF",
    invoiceNo: "BD-EXP-88912",
    invoiceDate: "2026-10-22",
    booksTaxable: 34200,
    booksGst: 6156,
    gstr2bTaxable: 0,
    gstr2bGst: 0,
    difference: 6156,
    status: "Missing in 2B",
    actionRequired: "Vendor GSTR-1 not filed; hold payment / nudge",
  },
  {
    id: "gst-4",
    vendorName: "Dell India Computer Pvt Ltd",
    vendorGstin: "29AABCD1002P1ZY",
    invoiceNo: "DELL-BLR-0091",
    invoiceDate: "2026-10-25",
    booksTaxable: 0,
    booksGst: 0,
    gstr2bTaxable: 210000,
    gstr2bGst: 37800,
    difference: -37800,
    status: "Missing in Books",
    actionRequired: "Invoice available on GST portal; book entry",
  },
];