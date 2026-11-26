"use client";

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, Send, Plus, 
  Clock, CheckCircle2, AlertCircle, Headphones, ShieldCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function SupportPage() {
  const { isAuthenticated, openModal, showNotification } = useStore();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('TECHNICAL');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadTickets = async () => {
    try {
      const res = await api.getTickets();
      setTickets(res.tickets || []);
      if (res.tickets && res.tickets.length > 0 && !selectedTicket) {
        setSelectedTicket(res.tickets[0]);
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) loadTickets();
  }, [isAuthenticated]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createTicket(newSubject, newMessage, newCategory);
      setNewSubject('');
      setNewMessage('');
      setIsCreating(false);
      await loadTickets();
      showNotification('Ticket submitted. Support will reply shortly.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      const res = await api.replyTicket(selectedTicket.id, replyMessage);
      setReplyMessage('');
      await loadTickets();
      showNotification('Reply sent.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to send reply', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4 my-16">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F5B041] mx-auto shadow-lux">
          <Headphones className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-black text-white">VIP Concierge Desk</h2>
        <p className="text-xs text-slate-400">Please sign in to access priority 24/7 ticket resolution and live settlement inquiries.</p>
        <button
          onClick={() => openModal('login')}
          className="px-6 py-3 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen"
        >
          Sign In to Access Concierge
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-2.5 xs:px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto pb-6 w-full max-w-full overflow-x-clip">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="telemetry-badge text-[#47EC84] border-[#47EC84]/30 bg-[#47EC84]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47EC84] animate-ping" />
              LIVE 24/7 DESK
            </span>
            <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/30 bg-[#F5B041]/10">
              <ShieldCheck className="w-3 h-3" />
              PRIORITY SLA &lt; 2 MIN
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            VIP Support & Help Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedicated assistance for UPI dynamic QR deposits, payouts, game rule verifications, and VIP inquiries.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 btn-emerald-3d font-display font-black rounded-xl text-xs transition flex items-center gap-2 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'New Ticket'}</span>
        </button>
      </div>

      {/* Ticket Creation Box */}
      {isCreating && (
        <form onSubmit={handleCreateTicket} className="p-6 rounded-3xl lux-card border-[#47EC84]/40 space-y-4">
          <h3 className="font-display font-black text-base text-white">Open Dedicated Support Inquiry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase text-[11px]">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
              >
                <option value="TECHNICAL">Technical Glitch / Graphics</option>
                <option value="DEPOSIT">Instant UPI QR Assistance</option>
                <option value="WITHDRAWAL">IMPS Withdrawal Inquiry</option>
                <option value="GAME">Game Fair Hash Verification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase text-[11px]">Subject</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase text-[11px]">Detailed Message</label>
            <textarea
              required
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen"
          >
            {submitting ? 'Submitting...' : 'Submit Priority Ticket'}
          </button>
        </form>
      )}

      {/* Ticket Thread & History View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ticket List (1 Col) */}
        <div className="rounded-3xl lux-card p-3.5 sm:p-4 space-y-2.5 max-h-[300px] lg:h-[500px] lg:max-h-none overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">My Open Inquiries</div>
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No active tickets opened yet.</div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`w-full text-left p-3.5 rounded-2xl border transition active:scale-98 ${
                  selectedTicket?.id === t.id
                    ? 'bg-[#47EC84]/10 border-[#47EC84] shadow-glowGreen'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                  <span>{t.ticket_number}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    t.status === 'RESOLVED' ? 'bg-[#47EC84]/20 text-[#47EC84]' : 'bg-[#F5B041]/20 text-[#F5B041]'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{t.subject}</div>
                <div className="text-[10px] text-slate-400 mt-1">{t.category}</div>
              </button>
            ))
          )}
        </div>

        {/* Conversation Thread (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl lux-card p-4 sm:p-6 flex flex-col justify-between min-h-[380px] lg:h-[500px]">
          {selectedTicket ? (
            <>
              {/* Top Meta */}
              <div className="pb-3 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-base text-white">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400">Ticket #{selectedTicket.ticket_number} • {selectedTicket.category}</p>
                </div>
                <span className="telemetry-badge text-[#F5B041] border-[#F5B041]/40 bg-[#F5B041]/10">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
                {selectedTicket.messages?.map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                      m.is_admin_reply
                        ? 'bg-purple-950/40 border border-purple-500/40 text-white ml-auto'
                        : 'bg-white/[0.04] border border-white/10 text-white'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[#F5B041] mb-1 font-mono">
                      {m.is_admin_reply ? '🛡️ Veltrix Concierge Agent' : m.sender_name}
                    </div>
                    <div>{m.message}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-1.5 text-right">
                      {new Date(m.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReply} className="flex gap-2 pt-3 border-t border-white/[0.08]">
                <input
                  type="text"
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message to support..."
                  className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#47EC84]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 btn-emerald-3d font-display font-black text-xs rounded-xl shadow-glowGreen"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-500" />
              <span>Select an inquiry from the left to view the encrypted conversation thread.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
