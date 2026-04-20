import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus, STATUSES } from './types';
import { ContactCard } from './components/ContactCard';
import { ContactForm } from './components/ContactForm';
import { AIMessageModal } from './components/AIMessageModal';
import { Plus, Search, BookOpen } from 'lucide-react';

const SEED_CONTACTS: Contact[] = [
  {
    id: crypto.randomUUID(),
    name: "立香",
    contactInfo: "SVA大学生",
    metAt: "未指定",
    metDate: "3.28.26",
    notes: "说是挺感兴趣，复活节来看看 (3.29 update)",
    events: ["Sunday Service"],
    status: "Follow Up",
    createdAt: Date.now() - 10000
  },
  {
    id: crypto.randomUUID(),
    name: "Song",
    contactInfo: "可能法学博士 (NYU)",
    metAt: "未指定",
    metDate: "3.28.26",
    notes: "好像是纽大的法学博士。打招呼有回复，周二问问周三能不能来 (3.29 update)",
    events: ["Bible Study"],
    status: "Follow Up",
    createdAt: Date.now() - 9000
  },
  {
    id: crypto.randomUUID(),
    name: "Joanne",
    contactInfo: "",
    metAt: "未指定",
    metDate: "3.28.26",
    notes: "不太记得她背景了。打招呼有回复，周二问问周三能不能来 (3.29 update)",
    events: [],
    status: "Follow Up",
    createdAt: Date.now() - 8000
  },
  {
    id: crypto.randomUUID(),
    name: "Jeremy",
    contactInfo: "微信已加",
    metAt: "刚从加州搬来纽约",
    metDate: "3.28.26",
    notes: "是已经受洗基督徒，说也会尝试在这边找教会。昨天发消息没有回复，后面这两天继续跟进一下，希望可以来聚会👍",
    events: ["Sunday Service"],
    status: "Invited",
    createdAt: Date.now() - 7000
  },
  {
    id: crypto.randomUUID(),
    name: "Jingzhe",
    contactInfo: "",
    metAt: "grove st",
    metDate: "4/18/26",
    notes: "之前去过教会",
    events: [],
    status: "New",
    createdAt: Date.now() - 6000
  },
  {
    id: crypto.randomUUID(),
    name: "Xinyu",
    contactInfo: "",
    metAt: "跑步时",
    metDate: "4/18/26",
    notes: "跑步的女生",
    events: [],
    status: "New",
    createdAt: Date.now() - 5000
  }
];

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'All' | 'Archived'>('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [aiContact, setAiContact] = useState<Contact | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('churchContacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setContacts(parsed);
        } else {
          setContacts(SEED_CONTACTS);
        }
      } catch (e) {
        setContacts(SEED_CONTACTS);
      }
    } else {
      setContacts(SEED_CONTACTS);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('churchContacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    if (editingContact) {
      setContacts(prev => prev.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...contactData } 
          : c
      ));
    } else {
      const newContact: Contact = {
        ...contactData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        isArchived: false
      };
      setContacts(prev => [newContact, ...prev]);
    }
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleToggleArchive = (contact: Contact) => {
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, isArchived: !c.isArchived } : c
    ));
  };

  const handleAddLog = (contactId: string, text: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        const newLog = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text
        };
        return { ...c, logs: [...(c.logs || []), newLog] };
      }
      return c;
    }));
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contactInfo.toLowerCase().includes(searchQuery.toLowerCase());
                          
    if (statusFilter === 'Archived') {
      return matchesSearch && c.isArchived;
    }
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus && !c.isArchived;
  });

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] text-[#333333] font-sans antialiased overflow-hidden">
      {/* Sidebar for small screens / Empty div to maintain split (The design had a sidebar, but the instruction said "don't restructure", we will keep the top-nav style but updated with design aesthetics) */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto w-full">
        {/* Header */}
        <header className="h-20 border-b border-[#E8E6E1] bg-white px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">Gather</h1>
          </div>
          <button 
            onClick={() => { setEditingContact(null); setIsFormOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Outreach Contact</span>
          </button>
        </header>

        <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search outreach contacts..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF9F6] border border-[#E8E6E1] rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
               <span className="text-xs text-[#888888] font-medium mr-2 whitespace-nowrap">Filter by Status:</span>
               <div className="flex gap-1.5 flex-nowrap shrink-0">
                  <button 
                    onClick={() => setStatusFilter("All")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${statusFilter === "All" ? "bg-white border-[#E8E6E1] text-[#333333]" : "bg-transparent border-transparent text-[#888888] hover:bg-gray-50"}`}
                  >All</button>
                  <button 
                    onClick={() => setStatusFilter("New")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === "New" ? "bg-blue-100 text-blue-700" : "text-[#555555] hover:bg-blue-50"}`}
                  >New</button>
                  <button 
                    onClick={() => setStatusFilter("Invited")}
                     className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === "Invited" ? "bg-amber-100 text-amber-700" : "text-[#555555] hover:bg-amber-50"}`}
                  >Invited</button>
                  <button 
                    onClick={() => setStatusFilter("Attending")}
                     className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === "Attending" ? "bg-green-100 text-green-700" : "text-[#555555] hover:bg-green-50"}`}
                  >Attending</button>
                  <button 
                    onClick={() => setStatusFilter("Follow Up")}
                     className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === "Follow Up" ? "bg-rose-100 text-rose-700" : "text-[#555555] hover:bg-rose-50"}`}
                  >Follow Up</button>
                  <button 
                    onClick={() => setStatusFilter("Archived")}
                     className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === "Archived" ? "bg-gray-200 text-gray-700 font-bold" : "text-[#555555] hover:bg-gray-100"}`}
                  >Archived</button>
               </div>
            </div>
          </div>

          {/* Content */}
          {contacts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-[#E8E6E1] border-dashed">
              <div className="bg-[#FAF9F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8E6E1]">
                <BookOpen size={24} className="text-[#888888]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">No outreach contacts yet</h3>
              <p className="text-sm text-[#555555] mb-6 max-w-sm mx-auto">
                Start building your connections. Add your first outreach contact to keep track of their journey.
              </p>
              <button 
                onClick={() => { setEditingContact(null); setIsFormOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-medium shadow-sm transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add First Contact
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-16 text-[#888888] text-sm font-medium">
              {statusFilter === 'Archived' ? "No archived contacts yet." : "No contacts found matching your search criteria."}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E6E1] rounded-2xl shadow-sm divide-y divide-[#E8E6E1] mb-12">
              {filteredContacts.map(contact => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact} 
                  onEdit={handleEdit}
                  onAI={setAiContact}
                  onToggleArchive={handleToggleArchive}
                  onAddLog={handleAddLog}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {isFormOpen && (
        <ContactForm 
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={() => {
            setIsFormOpen(false);
            setEditingContact(null);
          }}
        />
      )}

      {aiContact && (
        <AIMessageModal 
          contact={aiContact}
          onClose={() => setAiContact(null)}
          onAddLog={handleAddLog}
        />
      )}
    </div>
  );
}


