"use client";

import React, { useState } from "react";
import {
  Users2,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { mockClients, ClientCompany } from "@/lib/mockData";

export default function ClientsMasterPage() {
  const [clients, setClients] = useState<ClientCompany[]>(mockClients);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newGstin, setNewGstin] = useState("");
  const [newTallyCompany, setNewTallyCompany] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newGstin) return;

    const created: ClientCompany = {
      id: `c-${Date.now()}`,
      name: newClientName,
      gstin: newGstin,
      pan: newGstin.slice(2, 12),
      tallyCompany: newTallyCompany || `${newClientName} (2026-27)`,
      financialYear: "2026-2027",
      pendingTransactions: 0,
      reconciliationStatus: "Pending Import",
    };

    setClients([...clients, created]);
    setShowAddModal(false);
    setNewClientName("");
    setNewGstin("");
    setNewTallyCompany("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Client Companies &amp; Practice Master</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              {clients.length} Active Clients
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your accounting firm's client roster, GSTIN profiles, and linked Tally Prime company files.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Client Company
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-brand-400 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700">
                <Building2 className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  client.reconciliationStatus === "Reconciled"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : client.reconciliationStatus === "Mismatches Found"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {client.reconciliationStatus}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{client.name}</h3>
              <p className="text-xs font-mono text-brand-700 mt-1">GSTIN: {client.gstin}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">PAN: {client.pan}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Linked Tally File:</span>
                <span className="font-semibold text-slate-800 font-mono text-[11px] truncate max-w-[150px]">
                  {client.tallyCompany}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending Vouchers:</span>
                <span className="font-bold text-rose-600">{client.pendingTransactions}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert(`Switched active client context to ${client.name}`)}
                className="w-full py-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Switch Active Client
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Add New Client Firm</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Royal Infotech Pvt Ltd"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value.toUpperCase())}
                  placeholder="07AAAAA0000A1Z5"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tally Company Name</label>
                <input
                  type="text"
                  value={newTallyCompany}
                  onChange={(e) => setNewTallyCompany(e.target.value)}
                  placeholder="e.g. Royal Infotech (2026-27)"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
