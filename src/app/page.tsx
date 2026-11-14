import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Building,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  Lock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-xs font-semibold text-brand-800">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Next-Gen Practice Management for Indian CAs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-brand-500">Tax &amp; Accounting</span> Automation
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Convert messy bank PDFs into verified Tally vouchers in seconds. Reconcile GSTR-2B with purchase registers flawlessly. Engineered by <strong>Papneja Associates</strong> for high-efficiency Chartered Accountancy practices.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-xl transition-all text-base"
                >
                  Launch App Portal
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/app/banking"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-all text-base"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Try Bank Statement OCR
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-black text-slate-900">95%</div>
                  <div className="text-xs text-slate-500 font-medium">Faster Data Entry</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Tally Prime Compatible</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">Zero</div>
                  <div className="text-xs text-slate-500 font-medium">Manual Typo Errors</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card - Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800 text-white overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">Papneja_TaxOne_Engine v2.4</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Engine
                  </span>
                </div>

                <div className="py-4 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Target Client:</span>
                    <span className="text-brand-300 font-sans font-medium">PrimeX Trading</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Accounting Software:</span>
                    <span className="text-emerald-400 font-medium">Tally Prime v4.1 (Port 9000)</span>
                  </div>
                  
                  {/* Sample parsed transaction item */}
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">02-Nov-2026 | HDFC0000128</span>
                      <span className="text-rose-400 font-semibold">&#8377; 85,000.00 Dr</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      NEFT-AXIS000452-DLF COMMERCIAL-RENT
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-brand-400 font-sans font-semibold">Matched: Rent Expenses - Office</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">98% Confidence</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">04-Nov-2026 | IMPS-INB</span>
                      <span className="text-emerald-400 font-semibold">&#8377; 2,45,000.00 Cr</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      IMPS-FROM-SHARMA ENTERPRISES-INV2601
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-brand-400 font-sans font-semibold">Matched: Sharma Hardware Mart</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">99% Confidence</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/app/banking"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 font-sans text-xs font-semibold text-white transition-colors"
                  >
                    Open Live Banking Grid
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Solutions Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600">Enterprise Grade Features</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Engineered Specifically for Modern CA Practices
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every workflow has been modeled and perfected to eliminate human fatigue and repetitive data entry tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Bank Statement to Tally</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload bank statements in any format (PDF scans, passwords, protected files, Excel). Our AI engine extracts debits, credits, narrations, and auto-assigns the correct Tally Ledgers.
              </p>
              <Link href="/app/banking" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900">
                Explore Bank Automation <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">GSTR-2B Auto-Reconciliation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Match government 2B statements with the client's internal purchase books. Instantly identify missing invoices, tax mismatches, and claim 100% eligible ITC safely.
              </p>
              <Link href="/app/gst" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                Run 2B Reconciliation <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Direct Tally Prime Bridge</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No CSV export hassles. Generate standard Tally XML vouchers or communicate with Tally Prime running on port 9000 to push transactions directly into accounting masters.
              </p>
              <Link href="/app/tally-sync" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900">
                View Tally Connector <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600">Transparent Plans</h2>
            <p className="text-3xl font-extrabold text-slate-900">Customized for CA Firms &amp; Businesses</p>
            <p className="text-sm text-slate-600">Transparent pricing with unlimited client management and dedicated support.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            {/* Standard Practice Plan */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Annual CA Practice Plan</h3>
                <p className="text-xs text-slate-500 mt-1">Best for small &amp; mid-sized accounting firms</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">&#8377; 14,000</span>
                <span className="text-xs text-slate-500 font-medium">/ year + GST</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 50 active clients</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Bank Statement OCR</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct Tally Prime Sync (port 9000)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> GSTR-2B Matching Engine</li>
              </ul>
              <Link href="/app" className="block text-center py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors">
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 text-white shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold">3-Year Growth License</h3>
                <p className="text-xs text-brand-200 mt-1">For expanding firms managing high transaction volumes</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">&#8377; 42,000</span>
                <span className="text-xs text-brand-200 font-medium">/ 3 years + GST</span>
              </div>
              <ul className="space-y-3 text-xs text-brand-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Clients &amp; Companies</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Multimodal Invoice AI OCR</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-user staff roles &amp; audit trails</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated CA Relationship Manager</li>
              </ul>
              <Link href="/app" className="block text-center py-3 rounded-xl bg-white hover:bg-slate-100 text-brand-900 font-bold text-xs transition-colors shadow-lg">
                Activate License
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
