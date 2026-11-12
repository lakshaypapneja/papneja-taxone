# Papneja Associates TaxOne (Re-engineered Webapp)

AI-powered accounting automation and practice management platform inspired by **Vyapar TaxOne** (formerly Suvit), re-engineered and branded end-to-end for **Papneja Associates (Chartered Accountants & Tax Consultants)**.

---

## 🌟 Key Modules Replicated

1. **Bank Statement Automation (`/app/banking`)**:
   - Extract multi-page Indian bank statements (PDF / Excel).
   - Auto-classify narrations (UPI, NEFT, RTGS, IMPS, charges, rent, interest) and match with Tally ledgers.
   - Interactive spreadsheet-style grid for inline ledger review and voucher type adjustment.
   - 1-Click **Tally Prime XML Export** and **Direct Port 9000 Push**.

2. **Invoice OCR & Tax Breakdown (`/app/invoices`)**:
   - Scanned invoice and bill extraction using multimodal AI vision.
   - Auto-extracts Vendor GSTIN, Invoice #, Date, Taxable value, CGST/SGST/IGST breakdown, and HSN codes.
   - Matches with Tally purchase & expense ledgers.

3. **GSTR-2B vs. Books Reconciliation (`/app/gst`)**:
   - Compares purchase register entries against GSTR-2B auto-drafted statements.
   - Classifies transactions into *Matched*, *Tax Mismatch*, *Missing in 2B (Books only)*, and *Missing in Books*.
   - Discrepancy analysis to safeguard Input Tax Credit (ITC) with one-click CSV report export.

4. **Tally Prime Direct Bridge (`/app/tally-sync`)**:
   - Simulates desktop agent communication with local Tally Prime running on port `9000` via official XML Envelopes (`<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY>...`).

5. **Client Master & Firm Hub (`/app/clients`)**:
   - Manage client companies, GSTINs, PANs, linked Tally company files, and pending transaction queues.

---

## 🚀 Getting Started

### 1. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Practice Portal**: [http://localhost:3000/app](http://localhost:3000/app)
- **Banking Grid**: [http://localhost:3000/app/banking](http://localhost:3000/app/banking)
- **Invoice OCR**: [http://localhost:3000/app/invoices](http://localhost:3000/app/invoices)
- **GST Reconciliation**: [http://localhost:3000/app/gst](http://localhost:3000/app/gst)
- **Tally Bridge**: [http://localhost:3000/app/tally-sync](http://localhost:3000/app/tally-sync)

### 2. Production Build
```bash
npm run build
npm run start
```
