import { Building2, Mail, Phone, MapPin, Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">PAPNEJA ASSOCIATES</span>
                <p className="text-[10px] text-slate-400">Chartered Accountants &bull; Tax Tech</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering tax practitioners and businesses across India with AI-powered data entry automation, intelligent bank statement conversions, and accurate GSTR-2B reconciliations.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>ICAI Compliant &bull; 256-bit Encrypted</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">Practice Solutions</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/app/banking" className="hover:text-white transition-colors">Bank Statement to Tally</Link></li>
              <li><Link href="/app/invoices" className="hover:text-white transition-colors">Invoice OCR & Tax Extraction</Link></li>
              <li><Link href="/app/gst" className="hover:text-white transition-colors">GSTR-2B vs Books Reconciliation</Link></li>
              <li><Link href="/app/tally-sync" className="hover:text-white transition-colors">Tally Prime Direct Bridge (9000)</Link></li>
              <li><Link href="/app/clients" className="hover:text-white transition-colors">Client Practice Management</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">Supported Integrations</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Tally Prime & Tally.ERP 9</li>
              <li>Vyapar Desktop & Mobile</li>
              <li>Zoho Books & QuickBooks</li>
              <li>Excel / CSV Multi-format Engine</li>
              <li>GSTN Portal Direct 2B Sync</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">Office & Contact</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Head Office: Papneja Complex, Commercial Tower, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 (011) 4982-3000 / +91 98110-00000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>contact@papnejaassociates.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Papneja Associates. All rights reserved. Re-engineered AI Tax Automation Platform.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-300">Security Architecture</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
