import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { generateInvitationMessage } from '../lib/gemini';
import { X, Copy, RefreshCw, Sparkles, CheckCircle2, Languages, Edit3 } from 'lucide-react';

interface AIMessageModalProps {
  contact: Contact;
  onClose: () => void;
  onAddLog: (contactId: string, text: string) => void;
}

export function AIMessageModal({ contact, onClose, onAddLog }: AIMessageModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Chinese'>('English');

  const generate = async () => {
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const result = await generateInvitationMessage(contact, language);
      setMessage(result);
    } catch (err) {
      setError('Failed to generate message. Please make sure your API key is correctly configured.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, [contact, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogAndClose = () => {
    onAddLog(contact.id, `Sent ${language} AI invite: "${message}"`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#333333]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-indigo-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col w-full max-w-md">
        
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded">
               <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold">Personalized Invite Draft</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-[#888888]">
              Invite for <span className="font-bold text-[#1A1A1A]">{contact.name}</span>:
            </p>
            <div className="flex items-center gap-2">
              <Languages size={14} className="text-[#888888]" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Chinese')}
                disabled={loading}
                className="text-xs border border-[#E8E6E1] bg-[#FAF9F6] focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 outline-none text-[#555555] disabled:opacity-50"
              >
                <option value="English">English</option>
                <option value="Chinese">中文</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg text-sm text-[#333333] italic leading-relaxed mb-4 min-h-[120px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-[#888888] gap-2">
                <RefreshCw className="animate-spin" size={16} />
                <span>Drafting...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center pt-8">{error}</div>
            ) : (
              <p className="whitespace-pre-wrap">"{message}"</p>
            )}
          </div>

          <div className="flex gap-2">
            <button 
                onClick={handleCopy}
                disabled={loading || !message}
                className={`flex-1 py-2 text-xs font-bold rounded-md pointer-events-auto transition flex items-center justify-center gap-1.5 ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700 text-white border border-green-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600'
              } disabled:opacity-50`}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button 
                onClick={generate}
                disabled={loading}
                className="px-4 py-2 border border-[#E8E6E1] text-xs font-bold rounded-md pointer-events-auto hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
                title="Regenerate Draft"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Quick Log Action */}
          <div className="mt-2 pt-2 border-t border-[#E8E6E1]">
             <button 
                onClick={handleLogAndClose}
                disabled={loading || !message}
                className="w-full py-2 bg-gray-50 text-[#555555] hover:bg-gray-100 hover:text-[#1A1A1A] border border-[#E8E6E1] text-xs font-bold rounded-md pointer-events-auto transition flex items-center justify-center gap-1.5 disabled:opacity-50"
             >
                <Edit3 size={14} />
                Log as Sent to Contact History
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
