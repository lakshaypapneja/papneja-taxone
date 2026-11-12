import Link from "next/link";
import { Building2, ShieldCheck, ArrowRight, Zap, FileSpreadsheet } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-900 to-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/10 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-brand-900">
                PAPNEJA
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                TAXONE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Associates &bull; Chartered Accountants
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#features" className="hover:text-brand-600 transition-colors">
            Features
          </Link>
          <Link href="/#banking" className="hover:text-brand-600 transition-colors">
            Bank Automation
          </Link>
          <Link href="/#gst" className="hover:text-brand-600 transition-colors">
            GST 2B Matcher
          </Link>
          <Link href="/#tally" className="hover:text-brand-600 transition-colors">
            Tally Prime Sync
          </Link>
          <Link href="/#pricing" className="hover:text-brand-600 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900 px-4 py-2"
          >
            Client Portal
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all group"
          >
            Launch TaxOne
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
