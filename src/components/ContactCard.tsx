import React, { useState } from 'react';
import { Contact, STATUSES } from '../types';
import { MapPin, MessageSquare, Phone, Edit3, Archive, ArchiveRestore } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onAI: (contact: Contact) => void;
  onToggleArchive: (contact: Contact) => void;
  onAddLog: (contactId: string, text: string) => void;
}

export function ContactCard({ contact, onEdit, onAI, onToggleArchive, onAddLog }: ContactCardProps) {
  const [quickLog, setQuickLog] = useState('');

  const statusColors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700',
    'Invited': 'bg-amber-100 text-amber-700',
    'Attending': 'bg-green-100 text-green-700',
    'Follow Up': 'bg-rose-100 text-rose-700',
  };

  const handleQuickLogAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickLog.trim()) {
      onAddLog(contact.id, quickLog.trim());
      setQuickLog('');
    }
  };

  return (
    <div className={`p-4 md:p-6 hover:bg-[#FAF9F6]/50 transition-colors flex flex-col gap-4 ${contact.isArchived ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      
      {/* Top Row: Name, Status, Phone, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-bold text-[#1A1A1A] text-base">{contact.name}</h3>
          
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${statusColors[contact.status]}`}>
            {contact.status}
          </span>
          
          {contact.isArchived && <span className="text-xs font-normal text-gray-400">(Archived)</span>}
          
          <div className="hidden md:flex items-center gap-1.5 ml-2 border-l border-[#E8E6E1] pl-3 text-[#888888] text-xs">
            <Phone size={12} />
            <span>{contact.contactInfo || "No phone/email"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex md:hidden items-center gap-1.5 text-[#888888] text-xs">
             <Phone size={12} />
             <span>{contact.contactInfo || "No info"}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onEdit(contact)}
              className="p-1.5 text-[#888888] hover:text-[#1A1A1A] hover:bg-gray-100 rounded transition" title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => onToggleArchive(contact)}
              className="p-1.5 text-[#888888] hover:text-[#1A1A1A] hover:bg-gray-100 rounded transition" title={contact.isArchived ? "Unarchive" : "Archive"}
            >
              {contact.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            </button>
            {!contact.isArchived && (
              <button 
                onClick={() => onAI(contact)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition ml-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded"
              >
                <MessageSquare size={13} />
                <span className="hidden lg:inline">Draft Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details & Logs Row */}
      <div className="flex flex-col lg:flex-row justify-between gap-5">
        
        <div className="flex flex-col gap-2.5 flex-1 max-w-3xl">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-[#888888] mt-0.5 shrink-0" />
            <span className="text-xs text-[#888888]">
              {contact.metDate && `${contact.metDate}`}
              {contact.metDate && contact.metAt && ` • `}
              {contact.metAt || (contact.metDate ? "" : "Location not specified")}
            </span>
          </div>
          
          {contact.notes && (
            <div className="text-sm text-[#555555] leading-relaxed line-clamp-3">
              {contact.notes}
            </div>
          )}

          {contact.events.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {contact.events.map(event => (
                <span key={event} className="px-2 py-0.5 bg-gray-50 border border-[#E8E6E1] text-[#888888] font-medium text-[10px] rounded">
                  {event}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Logs Area */}
        <div className="flex flex-col justify-end gap-2.5 w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-[#E8E6E1] pt-4 lg:pt-0 lg:pl-6">
          {contact.logs && contact.logs.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-[104px] overflow-y-auto pr-1">
              {contact.logs.slice().reverse().map(log => (
                <div key={log.id} className="text-[11px] bg-gray-50 p-2 rounded text-[#555555] border border-[#E8E6E1] flex items-start">
                  <span className="font-semibold text-[#888888] mr-1.5 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString([], {month: 'numeric', day: 'numeric'})}:
                  </span>
                  <span className="line-clamp-2">{log.text}</span>
                </div>
              ))}
            </div>
          )}

          {!contact.isArchived && (
            <input 
              type="text" 
              placeholder="Quick log & press Enter..." 
              value={quickLog}
              onChange={e => setQuickLog(e.target.value)}
              onKeyDown={handleQuickLogAdd}
              className="w-full text-xs px-3 py-2 bg-white border border-[#E8E6E1] rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          )}
        </div>

      </div>

    </div>
  );
}
