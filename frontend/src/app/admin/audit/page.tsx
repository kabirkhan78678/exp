"use client";

import React, { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Clock } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then((res) => setLogs(res.audit_logs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Administrative Audit Trails</h1>
        <p className="text-xs text-zinc-400">
          Immutable records of privileged actions including account freezes, limit revisions, and withdrawal decisions.
        </p>
      </div>

      <div className="rounded-2xl bg-[#0D1214] border border-[#1E262A] overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141A1E] text-zinc-400 uppercase font-mono text-[10px] border-b border-[#1E262A]">
              <tr>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Resource Target</th>
                <th className="p-3.5">Payload Details</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E262A]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">Loading audit entries...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">No audit logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141A1E]/40 transition">
                    <td className="p-3.5 font-bold text-[#47EC84] font-mono">{log.actor}</td>
                    <td className="p-3.5 font-bold uppercase text-white">{log.action}</td>
                    <td className="p-3.5 font-mono text-[11px] text-[#F5B041]">
                      {log.resource_type}:{log.resource_id}
                    </td>
                    <td className="p-3.5 text-zinc-400 font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.payload)}
                    </td>
                    <td className="p-3.5 font-mono text-zinc-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
