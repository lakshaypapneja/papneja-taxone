"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  Users2,
  Share2,
  Settings,
  ChevronDown,
  CircleDot,
  ArrowUpRight,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { mockClients } from "@/lib/mockData";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedClient, setSelectedClient] = useState(mockClients[0]);
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/app", icon: LayoutDashboard },
    { name: "Bank Automation", href: "/app/banking", icon: FileSpreadsheet, badge: "AI" },
    { name: "Invoice OCR", href: "/app/invoices", icon: Receipt },
    { name: "GST 2B Matcher", href: "/app/gst", icon: FileCheck2 },
    { name: "Client Master", href: "/app/clients", icon: Users2 },
    { name: "Tally Prime Bridge", href: "/app/tally-sync", icon: Share2, status: "Active" },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800 text-white">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800 bg-slate-950">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow font-bold text-xs tracking-wider">
            PX
          </div>
          <div className="overflow-hidden">
            <span className="font-extrabold text-sm tracking-tight text-white block truncate">
              PAPNEJA × PRIMEX
            </span>
            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
              Enterprise Tax &amp; Tally Suite
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Accounting Automation
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
                {item.status && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Tally Desktop Bridge Status Widget */}
        <div className="p-3 m-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Tally Prime v4.1
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Port 9000</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Desktop connector linked to local machine. Ready for direct XML voucher injection.
          </p>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center font-bold text-xs text-white">
              LP
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Lakshay Papneja</p>
              <p className="text-[10px] text-slate-400 truncate">Partner CA (ICAI #50192)</p>
            </div>
          </div>
          <Link href="/" title="Exit to Landing" className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Bar with Client Switcher */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
          
          {/* Client Company Selector */}
          <div className="relative">
            <button
              onClick={() => setIsClientMenuOpen(!isClientMenuOpen)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-brand-500 bg-slate-50 transition-colors text-left"
            >
              <Building2 className="w-4 h-4 text-brand-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  {selectedClient.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  GSTIN: {selectedClient.gstin} &bull; FY: {selectedClient.financialYear}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isClientMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active Client Company
                </div>
                {mockClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsClientMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      client.id === selectedClient.id ? "bg-brand-50 font-bold text-brand-700" : "text-slate-700"
                    }`}
                  >
                    <div>
                      <div>{client.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{client.tallyCompany}</div>
                    </div>
                    {client.id === selectedClient.id && (
                      <CircleDot className="w-3.5 h-3.5 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ledger, invoice, GSTIN..."
                className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 w-64 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

    </div>
  );
}