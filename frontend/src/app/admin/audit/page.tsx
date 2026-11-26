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
        <h1 className="text-xl font-bold text-aurora-text">Administrative Audit Trails</h1>
        <p className="text-xs text-aurora-muted">
          Immutable records of privileged actions including account freezes, limit revisions, and withdrawal decisions.
        </p>
      </div>

      <div className="rounded-2xl bg-aurora-surface border border-aurora-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-aurora-elevated/70 text-aurora-muted uppercase font-mono text-[10px] border-b border-aurora-border">
              <tr>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Resource Target</th>
                <th className="p-3.5">Payload Details</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-border/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-aurora-muted">Loading audit entries...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-aurora-muted">No audit logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-aurora-elevated/20 transition">
                    <td className="p-3.5 font-bold text-aurora-purple font-mono">{log.actor}</td>
                    <td className="p-3.5 font-bold uppercase text-aurora-text">{log.action}</td>
                    <td className="p-3.5 font-mono text-[11px] text-aurora-gold">
                      {log.resource_type}:{log.resource_id}
                    </td>
                    <td className="p-3.5 text-aurora-muted font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.payload)}
                    </td>
                    <td className="p-3.5 font-mono text-aurora-muted text-[11px]">
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
