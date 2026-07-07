import React from "react";
import { Terminal, Shield, HelpCircle } from "lucide-react";
import { AuditLog } from "../types";

interface AuditLogsPanelProps {
  logs: AuditLog[];
}

export default function AuditLogsPanel({ logs }: AuditLogsPanelProps) {
  const getCategoryColor = (category: AuditLog["category"]) => {
    switch (category) {
      case "SYSTEM":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "TRADE_DETECTOR":
        return "text-brand-accent bg-brand-accent/10 border-brand-accent/20";
      case "CLUSTER":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "AI_ENGINE":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-brand-text-secondary bg-brand-hover/50 border border-brand-border";
    }
  };

  return (
    <div className="bg-brand-container border border-brand-border rounded p-5 h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-text-secondary" />
          <h2 className="font-display font-black text-sm text-white uppercase tracking-wide">
            TERMINAL AUDIT & INGESTION LOGS
          </h2>
        </div>
        <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest bg-brand-accent/10 border border-brand-accent/30 rounded px-2 py-0.5">
          STABILITY STATE: NOMINAL
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 font-mono text-[10px]">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-brand-text-secondary">
            No system log records found. Active listeners streaming...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2 bg-brand-hover/20 border border-brand-border rounded-sm hover:border-brand-border-secondary transition"
            >
              <span className="text-brand-text-secondary flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>

              <span
                className={`px-1.5 py-0.5 rounded-sm border text-[8px] font-bold tracking-wider flex-shrink-0 ${getCategoryColor(
                  log.category
                )}`}
              >
                {log.category}
              </span>

              <div className="min-w-0 flex-1">
                <span className="text-white font-bold block">{log.action}</span>
                <span className="text-brand-text-secondary text-[9px] block mt-0.5 leading-normal">
                  {log.details}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 text-[9px] font-mono text-brand-text-secondary text-center flex items-center justify-center gap-1">
        <Shield className="w-3 h-3 text-brand-text-secondary" /> Secure institutional activity auditing protocol
      </div>
    </div>
  );
}
