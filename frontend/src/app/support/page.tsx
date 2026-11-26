"use client";

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, Send, Plus, 
  Clock, CheckCircle2, AlertCircle 
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
      setTickets(res.tickets);
      if (res.tickets.length > 0 && !selectedTicket) {
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
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <HelpCircle className="w-12 h-12 text-aurora-gold mx-auto" />
        <h2 className="text-xl font-bold text-aurora-text">Sign In Required</h2>
        <p className="text-xs text-aurora-muted">Please log in to your Veltrix account to access dedicated 24/7 support tickets.</p>
        <button
          onClick={() => openModal('login')}
          className="px-6 py-2.5 bg-gradient-to-r from-aurora-gold to-amber-500 text-slate-950 font-bold text-xs rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-aurora-text flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-aurora-cyan" />
            <span>Support & Help Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-aurora-muted mt-1">
            24/7 dedicated support for deposit inquiries, game rules, and technical assistance.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 bg-aurora-elevated hover:bg-aurora-surface text-aurora-cyan border border-aurora-cyan/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'New Ticket'}</span>
        </button>
      </div>

      {/* Ticket Creation Box */}
      {isCreating && (
        <form onSubmit={handleCreateTicket} className="p-6 rounded-3xl bg-aurora-surface border border-aurora-border space-y-4 animate-scale-up">
          <h3 className="font-bold text-sm text-aurora-text">Submit Support Inquiry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-aurora-muted mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
              >
                <option value="TECHNICAL">Technical Glitch / Canvas</option>
                <option value="DEPOSIT">QR Deposit Assistance</option>
                <option value="WITHDRAWAL">Withdrawal Status</option>
                <option value="GAME">Game Outcome Verification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-aurora-muted mb-1">Subject</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-aurora-muted mb-1">Detailed Message</label>
            <textarea
              required
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-aurora-cyan to-aurora-purple text-slate-950 font-bold text-xs rounded-xl"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      )}

      {/* Ticket Thread & History View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List (1 Col) */}
        <div className="rounded-3xl bg-aurora-surface border border-aurora-border p-4 space-y-2 h-[480px] overflow-y-auto">
          <div className="text-xs font-bold text-aurora-muted uppercase px-2 mb-2">My Inquiries</div>
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-aurora-muted">No tickets opened yet.</div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`w-full text-left p-3 rounded-2xl border transition ${
                  selectedTicket?.id === t.id
                    ? 'bg-aurora-elevated border-aurora-cyan/40 shadow-sm'
                    : 'bg-aurora-surface border-aurora-border/60 hover:border-aurora-muted'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-aurora-muted font-mono mb-1">
                  <span>{t.ticket_number}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    t.status === 'RESOLVED' ? 'bg-aurora-success/20 text-aurora-success' : 'bg-aurora-gold/20 text-aurora-gold'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-aurora-text truncate">{t.subject}</div>
                <div className="text-[10px] text-aurora-muted mt-1">{t.category}</div>
              </button>
            ))
          )}
        </div>

        {/* Conversation Thread (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-aurora-surface border border-aurora-border p-6 flex flex-col justify-between h-[480px]">
          {selectedTicket ? (
            <>
              {/* Top Meta */}
              <div className="pb-3 border-b border-aurora-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-aurora-text">{selectedTicket.subject}</h3>
                  <p className="text-[11px] text-aurora-muted">Ticket #{selectedTicket.ticket_number} • {selectedTicket.category}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-aurora-elevated border border-aurora-border text-aurora-gold">
                  {selectedTicket.status}
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {selectedTicket.messages?.map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                      m.is_admin_reply
                        ? 'bg-aurora-purple/20 border border-aurora-purple/30 text-aurora-text ml-auto'
                        : 'bg-aurora-elevated border border-aurora-border text-aurora-text'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-aurora-gold mb-1">
                      {m.is_admin_reply ? '🛡️ Veltrix Support Agent' : m.sender_name}
                    </div>
                    <div>{m.message}</div>
                    <div className="text-[9px] text-aurora-muted font-mono mt-1 text-right">
                      {new Date(m.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReply} className="flex gap-2 pt-3 border-t border-aurora-border">
                <input
                  type="text"
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-aurora-elevated border border-aurora-border text-xs text-aurora-text focus:outline-none focus:border-aurora-cyan"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-aurora-cyan to-aurora-purple text-slate-950 font-bold text-xs rounded-xl shadow-glow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto text-center text-xs text-aurora-muted">
              Select a ticket on the left to view the thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
