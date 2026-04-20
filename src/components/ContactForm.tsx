import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus, STATUSES, EVENTS } from '../types';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { parseContactNotes } from '../lib/gemini';

interface ContactFormProps {
  contact?: Contact | null;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function ContactForm({ contact, onSave, onClose }: ContactFormProps) {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [metAt, setMetAt] = useState('');
  const [metDate, setMetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [status, setStatus] = useState<ContactStatus>('New');

  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setContactInfo(contact.contactInfo);
      setMetAt(contact.metAt);
      setMetDate(contact.metDate || '');
      setNotes(contact.notes);
      setEvents(contact.events || []);
      setStatus(contact.status);
    }
  }, [contact]);

  const handleMagicFill = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const currentData: Partial<Contact> = {};
      if (name) currentData.name = name;
      if (contactInfo) currentData.contactInfo = contactInfo;
      if (metAt) currentData.metAt = metAt;
      if (metDate) currentData.metDate = metDate;
      if (notes) currentData.notes = notes;
      if (status) currentData.status = status;
      if (events.length > 0) currentData.events = events;

      const parsed = await parseContactNotes(rawText, currentData);
      if (parsed.name) setName(parsed.name);
      if (parsed.contactInfo) setContactInfo(parsed.contactInfo);
      if (parsed.metAt) setMetAt(parsed.metAt);
      if (parsed.metDate) setMetDate(parsed.metDate);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.status) setStatus(parsed.status as ContactStatus);
      if (parsed.events) {
        // Only keep events that exist in our valid EVENTS list
        const validEvents = parsed.events.filter(e => EVENTS.includes(e));
        setEvents(validEvents.length > 0 ? validEvents : parsed.events);
      }
      setRawText('');
    } catch (error) {
      console.error("Magic fill failed", error);
      alert("Failed to parse notes. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const toggleEvent = (event: string) => {
    setEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      contactInfo,
      metAt,
      metDate,
      notes,
      events,
      status
    });
  };

  return (
    <div className="fixed inset-0 bg-[#333333]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-[#E8E6E1]">
          <h2 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">{contact ? 'Edit Contact' : 'New Outreach'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded bg-[#FAF9F6] border border-[#E8E6E1] hover:bg-gray-50 transition">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-indigo-800 flex items-center gap-1.5 mb-1"><Sparkles size={14} className="text-indigo-600"/> Magic Paste & Auto-fill</label>
          <div className="flex gap-2 items-start">
             <textarea 
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste raw notes here (e.g., 'Jeremy刚搬来...')"
                className="flex-1 px-3 py-2 text-sm bg-white border border-indigo-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-16"
              />
             <button 
                onClick={handleMagicFill}
                disabled={isParsing || !rawText.trim()}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1"
             >
                {isParsing ? <RefreshCw size={14} className="animate-spin" /> : "Auto-Fill"}
             </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#555555]">Contact Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Sarah Jenkins"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555555]">Phone / Email</label>
              <input 
                type="text" 
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="000-000-0000"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555555]">Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as ContactStatus)}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555555]">When did you meet?</label>
              <input 
                type="text" 
                value={metDate}
                onChange={e => setMetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 4/18/26"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555555]">Where did you meet?</label>
              <input 
                type="text" 
                value={metAt}
                onChange={e => setMetAt(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Local park"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#555555]">Personal Notes</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="Curious about faith..."
            />
          </div>

          <div className="space-y-2">
             <label className="text-xs font-medium text-[#555555]">Event Interest</label>
            <div className="flex flex-wrap gap-2">
              {EVENTS.map(event => (
                <button
                  key={event}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    events.includes(event)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium border'
                      : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#555555] border hover:bg-gray-50'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>

        </form>
        
        <div className="p-5 border-t border-[#E8E6E1] bg-white flex justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-[#E8E6E1] text-xs font-bold rounded-md pointer-events-auto hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 transition"
          >
            Add to Outreach List
          </button>
        </div>
      </div>
    </div>
  );
}
