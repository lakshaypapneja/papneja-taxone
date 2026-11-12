export interface TallyVoucherEntry {
  ledgerName: string;
  isDeemedPositive: boolean; // Yes = Debit, No = Credit
  amount: number; // Tally convention: positive for Dr, negative for Cr or vice versa depending on positive deemed
}

export interface TallyVoucher {
  id: string;
  date: string; // YYYYMMDD
  voucherType: "Payment" | "Receipt" | "Contra" | "Journal" | "Purchase" | "Sales";
  voucherNumber: string;
  narration: string;
  partyLedger: string;
  entries: {
    ledgerName: string;
    isDebit: boolean;
    amount: number;
  }[];
}

export function generateTallyPrimeXML(companyName: string, vouchers: TallyVoucher[]): string {
  const voucherXmlList = vouchers
    .map((v) => {
      const tallyDate = v.date.replace(/-/g, ""); // e.g. 20261101
      const entriesXml = v.entries
        .map(
          (e) => `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${escapeXml(e.ledgerName)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${e.isDebit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
          <AMOUNT>${e.isDebit ? -Math.abs(e.amount) : Math.abs(e.amount)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`
        )
        .join("");

      return `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="${v.voucherType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
          <DATE>${tallyDate}</DATE>
          <VOUCHERTYPENAME>${v.voucherType}</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${escapeXml(v.voucherNumber)}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${escapeXml(v.partyLedger)}</PARTYLEDGERNAME>
          <NARRATION>${escapeXml(v.narration)}</NARRATION>
          ${entriesXml}
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
        ${voucherXmlList}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
