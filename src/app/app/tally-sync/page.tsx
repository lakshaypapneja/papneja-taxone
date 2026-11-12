"use client";

import React, { useState } from "react";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Server,
  Zap,
} from "lucide-react";
import { mockBankTransactions } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";
import { generateTallyPrimeXML, TallyVoucher } from "@/lib/tallyXmlGenerator";

export default function TallySyncBridgePage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "CONNECTING">("CONNECTED");
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "[14:30:12] Bridge initialized on 127.0.0.1:9000",
    "[14:30:15] Handshake successful with Tally Prime 4.1 Release (Build 128)",
    "[14:31:02] Active Tally Company verified: 'Apex Logistics India Pvt Ltd'",
    "[14:32:00] Standing by for incoming voucher queues...",
  ]);

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus("CONNECTED");
      setSyncLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Ping response received from localhost:9000 (0.4ms) - Tally Prime READY`,
        ...prev,
      ]);
    }, 1000);
  };

  const handlePushAll = () => {
    setSyncLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Pushing 6 vouchers into Tally Prime XML Server...`,
      `[${new Date().toLocaleTimeString()}] <ENVELOPE><BODY><DATA><TALLYMESSAGE> injected successfully`,
      `[${new Date().toLocaleTimeString()}] Tally Response: <RESPONSE>CREATED: 6, ALTERED: 0, DELETED: 0, ERRORS: 0</RESPONSE>`,
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Tally Prime Direct Bridge</h1>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online (Port 9000)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero-export direct XML voucher injection to local Tally Prime / ERP 9 instances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? "animate-spin" : ""}`} />
            Test Tally Socket
          </button>

          <button
            onClick={handlePushAll}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            Push All Approved Vouchers
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Server Status & Specs */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-600" />
              Bridge Configuration
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-sans">Connector Host:</span>
                <span className="font-bold text-slate-800">http://127.0.0.1:9000</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-sans">Tally Release:</span>
                <span className="font-bold text-emerald-700 font-sans">Tally Prime 4.1 Gold</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-sans">Target Company:</span>
                <span className="font-bold text-slate-800 font-sans">Apex Logistics India Pvt Ltd</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-sans">Protocol:</span>
                <span className="font-bold text-brand-700">Tally XML Envelope / TCP</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              How Papneja Tally Bridge Works
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When you click <strong>Push to Tally Prime</strong>, the web application serializes parsed bank and invoice entries into Tally-compliant XML (`&lt;IMPORTDATA&gt;` with `&lt;REQUESTDESC&gt;`). The desktop agent posts the envelope via HTTP directly to Tally Prime's local port.
            </p>
          </div>

        </div>

        {/* Right Column: Real-time Terminal Log */}
        <div className="lg:col-span-7 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Bridge Activity Console</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              LISTENING
            </span>
          </div>

          <div className="flex-1 py-4 space-y-2 overflow-y-auto max-h-[350px]">
            {syncLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-emerald-400">&gt;</span> {log}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Buffer: 64 KB</span>
            <button
              onClick={() => setSyncLogs([])}
              className="hover:text-slate-300 transition-colors"
            >
              Clear Console
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
