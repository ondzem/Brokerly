import React, { useState, useEffect } from 'react';
import { Contact, Deal, Property, Activity } from '@/types';
import { createContact, updateContact, createActivity } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, User, Mail, Phone, Calendar as CalendarIcon, Briefcase, Home, Clock, AlertCircle, SlidersHorizontal, X, Building2, Trees, Store, Warehouse } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const ROLE_OPTIONS = [
  { id: 'kupující', label: 'kupující' },
  { id: 'vlastník', label: 'vlastník' },
  { id: 'doporučitel', label: 'doporučitel' },
] as const;

const SOURCE_OPTIONS = ['Sreality', 'iDNES', 'web', 'doporučení', 'cold call', 'monitoring', 'osobní'] as const;
const STATUS_OPTIONS = ['nový', 'kontaktovaný', 'kvalifikovaný', 'klient', 'ztracený'] as const;
const PURPOSE_OPTIONS = ['vlastní bydlení', 'investice', 'rekreace', 'jiné'] as const;
const GDPR_SOURCE_OPTIONS = ['poptávka z portálu', 'formulář', 'osobně', 'e-mail'] as const;
const KIND_OPTIONS = ['byt', 'dům', 'pozemek', 'komerční'] as const;
const LAYOUT_OPTIONS = ['1+kk', '2+kk', '2+1', '3+kk', '3+1', '4+ a více'] as const;

interface ContactsViewProps {
  contacts: Contact[];
  deals: Deal[];
  properties: Property[];
  activities: Activity[];
  initialSelectedContactId?: string;
  onClearFocusContact?: () => void;
  onRefresh: () => void;
  onNavigateToDeal: (dealId: string) => void;
  onNavigateToProperty: (propertyId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  deals,
  properties,
  activities,
  initialSelectedContactId,
  onClearFocusContact,
  onRefresh,
  onNavigateToDeal,
  onNavigateToProperty,
}) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'buyer' | 'owner'>('buyer');
  const [statusFilter, setStatusFilter] = useState<'vše' | Contact['status']>('vše');
  const [tempFilter, setTempFilter] = useState<'vše' | 'horký' | 'vlažný' | 'studený'>('vše');
  const [kindFilter, setKindFilter] = useState<'vše' | 'byt' | 'dům' | 'pozemek' | 'komerční' | 'garáž/ostatní'>('vše');
  const [transFilter, setTransFilter] = useState<'vše' | 'prodej' | 'pronájem'>('vše');
  const [propertyFilter, setPropertyFilter] = useState<string>('vše');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobileFiltersExpanded, setIsMobileFiltersExpanded] = useState(false);

  // Focus contact if navigated from outside
  useEffect(() => {
    if (initialSelectedContactId) {
      const match = contacts.find((c) => c.id === initialSelectedContactId);
      if (match) {
        setSelectedContact(match);
        setIsDetailOpen(true);
      }
    }
  }, [initialSelectedContactId, contacts]);

  // Create form states
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoles, setNewRoles] = useState<Contact['roles']>([]);
  const [newSource, setNewSource] = useState<Contact['source']>('web');
  const [newStatus, setNewStatus] = useState<Contact['status']>('nový');
  const [newNote, setNewNote] = useState('');

  // Edit details form states
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoles, setEditRoles] = useState<Contact['roles']>([]);
  const [editSource, setEditSource] = useState<Contact['source']>('web');
  const [editStatus, setEditStatus] = useState<Contact['status']>('nový');
  const [editNote, setEditNote] = useState('');

  // Buyer demand states
  const [seekingTransaction, setSeekingTransaction] = useState<string>('');
  const [seekingKind, setSeekingKind] = useState<Contact['seeking_kind']>([]);
  const [seekingLocation, setSeekingLocation] = useState('');
  const [seekingLayout, setSeekingLayout] = useState<Contact['seeking_layout']>([]);
  const [budgetFrom, setBudgetFrom] = useState('');
  const [budgetTo, setBudgetTo] = useState('');
  const [purpose, setPurpose] = useState<string>('');
  const [seekingUntil, setSeekingUntil] = useState<Date | undefined>(undefined);

  // GDPR states
  const [gdprConsent, setGdprConsent] = useState(false);
  const [consentDate, setConsentDate] = useState<Date | undefined>(undefined);
  const [consentSource, setConsentSource] = useState<string>('');

  // Log activity form states
  const [actType, setActType] = useState<Activity['type']>('hovor');
  const [actContent, setActContent] = useState('');
  const [actIsReminder, setActIsReminder] = useState(false);
  const [actWhenDate, setActWhenDate] = useState<Date>(new Date());
  const [actWhenTime, setActWhenTime] = useState('10:00');
  const [actDirection, setActDirection] = useState<string>('odchozí');
  const [actFollowupResult, setActFollowupResult] = useState<string>('');

  // Sync edits when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      setEditFullName(selectedContact.full_name || '');
      setEditPhone(selectedContact.phone || '');
      setEditEmail(selectedContact.email || '');
      setEditRoles(selectedContact.roles || []);
      setEditSource(selectedContact.source || 'web');
      setEditStatus(selectedContact.status || 'nový');
      setEditNote(selectedContact.note || '');

      setSeekingTransaction(selectedContact.seeking_transaction || '');
      setSeekingKind(selectedContact.seeking_kind || []);
      setSeekingLocation(selectedContact.seeking_location ? selectedContact.seeking_location.join(', ') : '');
      setSeekingLayout(selectedContact.seeking_layout || []);
      setBudgetFrom(selectedContact.budget_from ? selectedContact.budget_from.toString() : '');
      setBudgetTo(selectedContact.budget_to ? selectedContact.budget_to.toString() : '');
      setPurpose(selectedContact.purpose || '');
      setSeekingUntil(selectedContact.seeking_until ? new Date(selectedContact.seeking_until) : undefined);

      setGdprConsent(selectedContact.gdpr_consent || false);
      setConsentDate(selectedContact.consent_date ? new Date(selectedContact.consent_date) : undefined);
      setConsentSource(selectedContact.consent_source || '');
      
      // Reset activity logger
      setActContent('');
      setActIsReminder(false);
      setActWhenDate(new Date());
      setActWhenTime(new Date().toTimeString().slice(0, 5));
    }
  }, [selectedContact]);

  // Search, role tab and panel filters
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.full_name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeRoleTab === 'buyer' && !c.roles.includes('kupující')) return false;
    if (activeRoleTab === 'owner' && !c.roles.includes('vlastník')) return false;

    if (statusFilter !== 'vše' && c.status !== statusFilter) return false;
    if (tempFilter !== 'vše' && c.temperature !== tempFilter) return false;

    // Property-derived filters: what the contact seeks, owns, or has a deal on
    if (kindFilter !== 'vše' || transFilter !== 'vše' || propertyFilter !== 'vše') {
      const cDeals = deals.filter((d) => d.buyer_id === c.id);
      const dealProps = cDeals
        .map((d) => (d.property_id ? properties.find((p) => p.id === d.property_id) : undefined))
        .filter((p): p is Property => Boolean(p));
      const ownedProps = properties.filter((p) => p.owner_id === c.id);

      if (kindFilter !== 'vše') {
        const kinds = new Set<string>([
          ...(c.seeking_kind || []),
          ...ownedProps.map((p) => p.kind),
          ...dealProps.map((p) => p.kind),
        ]);
        if (!kinds.has(kindFilter)) return false;
      }

      if (transFilter !== 'vše') {
        const transactions = new Set<string>([
          ...(c.seeking_transaction ? [c.seeking_transaction === 'koupě' ? 'prodej' : 'pronájem'] : []),
          ...ownedProps.map((p) => p.transaction),
          ...dealProps.map((p) => p.transaction),
        ]);
        if (!transactions.has(transFilter)) return false;
      }

      if (propertyFilter !== 'vše') {
        const related =
          ownedProps.some((p) => p.id === propertyFilter) ||
          cDeals.some((d) => d.property_id === propertyFilter);
        if (!related) return false;
      }
    }

    return true;
  });

  const activeFilterCount =
    (kindFilter !== 'vše' ? 1 : 0) +
    (transFilter !== 'vše' ? 1 : 0) +
    (propertyFilter !== 'vše' ? 1 : 0) +
    (statusFilter !== 'vše' ? 1 : 0) +
    (tempFilter !== 'vše' ? 1 : 0);
  const resetFilters = () => {
    setKindFilter('vše');
    setTransFilter('vše');
    setPropertyFilter('vše');
    setStatusFilter('vše');
    setTempFilter('vše');
  };

  const handleRoleToggle = (role: Contact['roles'][number], isEdit = false) => {
    const targetRoles = isEdit ? editRoles : newRoles;
    const setTarget = isEdit ? setEditRoles : setNewRoles;
    
    if (targetRoles.includes(role)) {
      setTarget(targetRoles.filter((r) => r !== role));
    } else {
      setTarget([...targetRoles, role]);
    }
  };

  const handleEditKindToggle = (kind: 'byt' | 'dům' | 'pozemek' | 'komerční') => {
    const target = seekingKind || [];
    if (target.includes(kind)) {
      setSeekingKind(target.filter((k) => k !== kind));
    } else {
      setSeekingKind([...target, kind]);
    }
  };

  const handleEditLayoutToggle = (layout: '1+kk' | '2+kk' | '2+1' | '3+kk' | '3+1' | '4+ a více') => {
    const target = seekingLayout || [];
    if (target.includes(layout)) {
      setSeekingLayout(target.filter((l) => l !== layout));
    } else {
      setSeekingLayout([...target, layout]);
    }
  };

  // Submit Contact edits
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    if (!editFullName || (!editPhone && !editEmail) || editRoles.length === 0) {
      toast.error('Jméno, Role a aspoň jeden kontakt (telefon/e-mail) jsou povinné.');
      return;
    }

    try {
      const locationsArray = seekingLocation
        ? seekingLocation.split(',').map((l) => l.trim()).filter((l) => l !== '')
        : null;

      const updateData: Partial<Contact> = {
        full_name: editFullName,
        phone: editPhone || null,
        email: editEmail || null,
        roles: editRoles,
        source: editSource,
        status: editStatus,
        temperature: null, // Temperature removed
        note: editNote || null,
        seeking_transaction: editRoles.includes('kupující') ? (seekingTransaction as Contact['seeking_transaction'] || 'koupě') : null,
        seeking_kind: editRoles.includes('kupující') ? seekingKind : null,
        seeking_location: editRoles.includes('kupující') ? locationsArray : null,
        seeking_layout: editRoles.includes('kupující') ? seekingLayout : null,
        budget_from: editRoles.includes('kupující') && budgetFrom ? Number(budgetFrom) : null,
        budget_to: editRoles.includes('kupující') && budgetTo ? Number(budgetTo) : null,
        purpose: editRoles.includes('kupující') ? (purpose as Contact['purpose']) || null : null,
        seeking_until: editRoles.includes('kupující') && seekingUntil ? seekingUntil.toISOString().split('T')[0] : null,
        gdpr_consent: gdprConsent,
        consent_date: gdprConsent && consentDate ? consentDate.toISOString().split('T')[0] : null,
        consent_source: gdprConsent ? (consentSource as Contact['consent_source']) || null : null,
      };

      const updated = await updateContact(selectedContact.id, updateData);
      toast.success('Kontakt byl uložen.');
      setSelectedContact(updated);
      onRefresh();
    } catch (error) {
      toast.error('Chyba při ukládání kontaktu. Zkontrolujte, zda telefon či e-mail již nepatří jinému kontaktu.');
    }
  };

  // Create new contact (handling deduplication)
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || (!newPhone && !newEmail) || newRoles.length === 0) {
      toast.error('Jméno, Role a aspoň jeden kontakt (telefon/e-mail) jsou povinné.');
      return;
    }

    try {
      const created = await createContact({
        full_name: newFullName,
        phone: newPhone || null,
        email: newEmail || null,
        roles: newRoles,
        source: newSource,
        status: newStatus,
        temperature: null, // Temperature removed
        note: newNote || null,
        seeking_transaction: null,
        seeking_kind: null,
        seeking_location: null,
        seeking_layout: null,
        budget_from: null,
        budget_to: null,
        purpose: null,
        seeking_until: null,
        gdpr_consent: false,
        consent_date: null,
        consent_source: null,
      });

      // Find out if deduplication triggered (if returned ID matches an existing contact in the contacts array)
      const isDuplicate = contacts.some((c) => c.id === created.id);
      
      if (isDuplicate) {
        toast.info('Kontakt s tímto telefonem/e-mailem již existuje. Byl aktualizován a přidány nové role.');
      } else {
        toast.success('Nový kontakt byl založen.');
      }

      setIsCreateOpen(false);
      setSelectedContact(created);
      onRefresh();

      // Reset fields
      setNewFullName('');
      setNewPhone('');
      setNewEmail('');
      setNewRoles([]);
      setNewSource('web');
      setNewStatus('nový');
      setNewNote('');
    } catch (error) {
      toast.error('Nepodařilo se založit kontakt.');
    }
  };

  // Add activity / reminder to selected contact
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !actContent.trim()) return;

    try {
      const whenDateTime = new Date(actWhenDate);
      const [hours, minutes] = actWhenTime.split(':');
      whenDateTime.setHours(Number(hours), Number(minutes), 0, 0);

      await createActivity({
        type: actIsReminder ? 'PŘIPOMÍNKA' : actType,
        content: actContent,
        contact_id: selectedContact.id,
        deal_id: null,
        when: whenDateTime.toISOString(),
        is_reminder: actIsReminder,
        done: actIsReminder ? false : true,
        direction: (actType === 'hovor' || actType === 'e-mail' || actType === 'SMS') ? (actDirection as Activity['direction']) : null,
        followup_result: actType === 'follow-up' ? (actFollowupResult as Activity['followup_result']) : null,
        who: null,
      });

      toast.success(actIsReminder ? 'Připomínka byla zapsána.' : 'Aktivita byla zapsána.');
      setActContent('');
      onRefresh();
    } catch (error) {
      toast.error('Chyba při ukládání aktivity.');
    }
  };

  // Get linked items
  const contactDeals = selectedContact ? deals.filter((d) => d.buyer_id === selectedContact.id) : [];
  const contactProperties = selectedContact ? properties.filter((p) => p.owner_id === selectedContact.id) : [];
  const contactActivities = selectedContact ? activities.filter((a) => a.contact_id === selectedContact.id) : [];

  const totalCount = contacts.length;
  const buyersCount = contacts.filter((c) => c.roles.includes('kupující')).length;
  const ownersCount = contacts.filter((c) => c.roles.includes('vlastník')).length;

  const statusBadgeClass = (status: Contact['status']) =>
    status === 'nový' ? 'bg-emerald-500/10 text-emerald-600' :
    status === 'kontaktovaný' ? 'bg-amber-500/10 text-amber-600' :
    status === 'kvalifikovaný' ? 'bg-sky-500/10 text-sky-600' :
    status === 'klient' ? 'bg-indigo-500/10 text-indigo-600' :
    'bg-stone-500/10 text-stone-600';

  const tempBadgeClass = (t: NonNullable<Contact['temperature']>) =>
    t === 'horký' ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900' :
    t === 'vlažný' ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900' :
    'bg-stone-50 text-stone-600 border border-stone-200/60 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700';

  const filterChipClass = (active: boolean) =>
    `text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border cursor-pointer ${
      active
        ? 'border-transparent shadow-xs bg-[#00D991] text-[#00221F]'
        : 'bg-white border-stone-250/70 hover:border-stone-300 text-[#0B1F1A] dark:bg-stone-900 dark:border-white/10 dark:text-white'
    }`;

  // Shared filter sections (desktop panel + mobile drawer) — same structure as
  // the properties filter: transakce, property-kind tiles and the concrete
  // property first, then stav in lifecycle order and teplota.
  const kindTiles = [
    { id: 'byt', label: 'Byty', Icon: Building2 },
    { id: 'dům', label: 'Domy', Icon: Home },
    { id: 'pozemek', label: 'Pozemky', Icon: Trees },
    { id: 'komerční', label: 'Komerční', Icon: Store },
    { id: 'garáž/ostatní', label: 'Ostatní', Icon: Warehouse },
  ] as const;

  const renderFilterSections = () => (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
          Transakce
        </div>
        <div className="flex bg-[#ECEBE6] p-[3px] rounded-[10px] dark:bg-stone-850 h-9 items-center w-full sm:w-fit">
          {(['vše', 'prodej', 'pronájem'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTransFilter(t)}
              className={`px-4 h-[30px] flex-1 sm:flex-none flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                transFilter === t
                  ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              {t === 'vše' ? 'Vše' : t === 'prodej' ? 'Prodej' : 'Pronájem'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
          Typ nemovitosti
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {kindTiles.map(({ id, label, Icon }) => {
            const active = kindFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setKindFilter(active ? 'vše' : id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-[10px] border transition-all duration-150 cursor-pointer ${
                  active
                    ? 'border-transparent shadow-xs bg-[#00D991] text-[#00221F]'
                    : 'bg-white border-stone-250/70 hover:border-stone-300 text-[#0B1F1A] dark:bg-stone-900 dark:border-white/10 dark:text-white'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'text-[#00221F]' : 'text-stone-400'}`} />
                <span className="text-[12px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
          Nemovitost
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="h-9 w-full text-[12.5px] rounded-[10px] border-stone-250/70 dark:border-white/10">
            <span className="truncate text-left">
              {(() => {
                if (propertyFilter === 'vše') return 'Všechny nemovitosti';
                const p = properties.find((pp) => pp.id === propertyFilter);
                return p ? `${p.address} · ${p.kind}` : 'Všechny nemovitosti';
              })()}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vše">Všechny nemovitosti</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.address} · {p.kind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
          Stav
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(statusFilter === st ? 'vše' : st)}
              className={filterChipClass(statusFilter === st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
          Teplota
        </div>
        <div className="flex flex-wrap gap-2">
          {(['horký', 'vlažný', 'studený'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTempFilter(tempFilter === t ? 'vše' : t)}
              className={filterChipClass(tempFilter === t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFilterPanelHeader = (onClose: () => void) => (
    <div className="flex items-center justify-between">
      <span className="text-[14px] font-semibold text-[#0B1F1A] dark:text-white">Filtry</span>
      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[12px] font-medium px-2.5 py-1 rounded-[8px] border border-stone-250/70 dark:border-white/10 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer transition-all duration-150"
          >
            Resetovat filtry
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-[8px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200 cursor-pointer transition-all duration-150"
          aria-label="Zavřít filtry"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const roleToggle = (
    <div className="flex bg-[#ECEBE6] p-[3px] rounded-[10px] dark:bg-stone-850 h-9 items-center flex-none">
      {([
        { id: 'buyer', label: 'Zájemci' },
        { id: 'owner', label: 'Vlastníci' },
      ] as const).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveRoleTab(tab.id)}
          className={`px-3.5 h-[30px] flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
            activeRoleTab === tab.id
              ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header section (aligned with PropertiesView) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2.5 sm:mb-0">
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-light text-[26px] leading-tight text-[#0B1F1A] dark:text-white">
            Kontakty
          </h1>
          <span className="text-[13px] text-stone-500 dark:text-stone-400">
            {totalCount} {totalCount === 1 ? 'kontakt' : totalCount >= 2 && totalCount <= 4 ? 'kontakty' : 'kontaktů'} · {buyersCount} zájemců · {ownersCount} vlastníků
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 hover:opacity-90 font-medium text-[14px] px-4 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 w-full sm:w-auto flex-none shadow-xs bg-[#00D991] text-[#00221F]"
        >
          + Nový kontakt
        </button>
      </div>

      {/* Search & Filters bar (Desktop) */}
      <div className="hidden md:flex items-center gap-2 py-1">
        <div className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-[10px] px-3.5 h-9 w-[220px] flex-none shadow-sm dark:bg-stone-900 dark:border-white/10">
          <Search className="h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Hledat jméno, telefon, e-mail…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[12.5px] placeholder-stone-400 focus:ring-0 p-0 h-full text-[#0B1F1A] dark:text-white"
          />
        </div>

        <div className="w-[0.5px] h-5 bg-stone-300 dark:bg-white/15 flex-none" />

        {/* Filters button + dropdown panel */}
        <div className="relative flex-none">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-[10px] border border-stone-250/70 bg-white dark:bg-stone-900 dark:border-white/10 font-medium text-[12.5px] shadow-sm cursor-pointer transition-all duration-150 text-[#0B1F1A] dark:text-white"
          >
            <SlidersHorizontal className={`h-3.5 w-3.5 ${activeFilterCount > 0 || isFiltersOpen ? 'text-[#00D991]' : 'text-stone-400'}`} />
            <span>Filtry</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-semibold flex items-center justify-center bg-[#00D991] text-[#00221F]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {isFiltersOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsFiltersOpen(false)} />
              <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[520px] rounded-xl border border-stone-200/80 dark:border-white/10 p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 bg-white dark:bg-stone-900">
                <div className="mb-5">{renderFilterPanelHeader(() => setIsFiltersOpen(false))}</div>
                {renderFilterSections()}
              </div>
            </>
          )}
        </div>

        <div className="ml-auto">{roleToggle}</div>
      </div>

      {/* Search & Filters bar (Mobile) */}
      <div className="flex md:hidden flex-col gap-3.5 w-full">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => setIsMobileFiltersExpanded(!isMobileFiltersExpanded)}
            className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-[10px] border border-stone-250/70 bg-white dark:bg-stone-900 dark:border-white/10 font-medium text-[12.5px] shadow-sm cursor-pointer select-none text-[#0B1F1A] dark:text-white"
          >
            <SlidersHorizontal className={`h-3.5 w-3.5 ${isMobileFiltersExpanded || activeFilterCount > 0 ? 'text-[#00D991]' : 'text-stone-400'}`} />
            <span>Filtry</span>
            {activeFilterCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#00D991]" />}
          </button>
          {roleToggle}
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-[10px] px-3.5 h-9 w-full shadow-sm dark:bg-stone-900 dark:border-white/10">
          <Search className="h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Hledat jméno, telefon, e-mail…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[12.5px] placeholder-stone-400 focus:ring-0 p-0 h-full text-[#0B1F1A] dark:text-white"
          />
        </div>

        {isMobileFiltersExpanded && (
          <div className="flex flex-col gap-5 p-4 rounded-xl border border-stone-200/80 dark:border-white/10 animate-in slide-in-from-top-2 duration-150 shadow-xs bg-white dark:bg-stone-900">
            {renderFilterPanelHeader(() => setIsMobileFiltersExpanded(false))}
            {renderFilterSections()}
          </div>
        )}
      </div>

      {/* Contacts list — table on desktop, cards on mobile */}
      {filteredContacts.length === 0 ? (
        <div className="border border-dashed border-stone-300/70 dark:border-white/15 rounded-xl py-14 px-10 flex flex-col items-center justify-center gap-2 text-center">
          <div className="text-[15px] font-medium text-[#0B1F1A] dark:text-white">
            Žádný kontakt neodpovídá hledání či filtrům.
          </div>
          {(activeFilterCount > 0 || searchQuery) && (
            <button
              onClick={() => {
                resetFilters();
                setSearchQuery('');
              }}
              className="text-[12.5px] font-medium text-[#0E8A5F] hover:underline cursor-pointer"
            >
              Zrušit hledání a filtry
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200/60 dark:border-stone-800">
                    {['Jméno', 'Telefon', 'E-mail', 'Role', 'Stav', 'Teplota', 'Aktivní obchod'].map((h) => (
                      <th
                        key={h}
                        className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 py-3 px-4 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => {
                    const cDeals = deals.filter((d) => d.buyer_id === contact.id);
                    const activeDeal = cDeals.find((d) => d.result === 'otevřený');
                    const displayRoles = contact.roles.filter((r) => r !== 'protistrana');

                    return (
                      <tr
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsDetailOpen(true);
                        }}
                        className="border-b border-stone-100 dark:border-stone-900 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-900/60 cursor-pointer transition-colors duration-100"
                      >
                        <td className="py-3 px-4 text-[13.5px] font-medium text-[#0B1F1A] dark:text-white whitespace-nowrap">
                          {contact.full_name}
                        </td>
                        <td className="py-3 px-4 text-[12.5px] text-stone-500 dark:text-stone-400 tabular-nums whitespace-nowrap">
                          {contact.phone || '—'}
                        </td>
                        <td className="py-3 px-4 text-[12.5px] text-stone-500 dark:text-stone-400 whitespace-nowrap">
                          {contact.email || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {displayRoles.length === 0 ? (
                              <span className="text-[12px] text-stone-400">—</span>
                            ) : (
                              displayRoles.map((role) => (
                                <span
                                  key={role}
                                  className="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap"
                                >
                                  {role}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap ${statusBadgeClass(contact.status)}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {contact.temperature ? (
                            <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-[4px] uppercase tracking-wider whitespace-nowrap ${tempBadgeClass(contact.temperature)}`}>
                              {contact.temperature}
                            </span>
                          ) : (
                            <span className="text-[12px] text-stone-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {activeDeal ? (
                            <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#00D991]" />
                              {activeDeal.stage}
                            </span>
                          ) : (
                            <span className="text-[12px] text-stone-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredContacts.map((contact) => {
              const cDeals = deals.filter((d) => d.buyer_id === contact.id);
              const activeDeal = cDeals.find((d) => d.result === 'otevřený');
              const displayRoles = contact.roles.filter((r) => r !== 'protistrana');

              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setIsDetailOpen(true);
                  }}
                  className="bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 cursor-pointer hover:border-[#00D991] hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5 text-left"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-display font-semibold text-[14px] text-[#0B1F1A] dark:text-white truncate">
                      {contact.full_name}
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${statusBadgeClass(contact.status)}`}>
                      {contact.status}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-stone-500 dark:text-stone-400 truncate tabular-nums">
                    {contact.phone || contact.email || '—'}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {displayRoles.map((role) => (
                      <span key={role} className="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 text-[8.5px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {role}
                      </span>
                    ))}
                    {contact.temperature && (
                      <span className={`text-[8.5px] font-semibold px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${tempBadgeClass(contact.temperature)}`}>
                        {contact.temperature}
                      </span>
                    )}
                  </div>
                  {activeDeal && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 bg-emerald-500/5 py-1 px-1.5 rounded-md border border-emerald-500/10 w-fit">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D991]" />
                      <span className="truncate">Fáze: {activeDeal.stage}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* DETAIL DIALOG */}
      {selectedContact && (
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) onClearFocusContact?.();
        }}>
          <DialogContent className="max-w-5xl lg:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold border-b border-border pb-3 flex items-center justify-between">
                <span>{editFullName}</span>
                <span className="text-xs font-mono font-normal text-muted-foreground mr-6">
                  Založeno: <span className="font-semibold">{new Date(selectedContact.created_at).toLocaleDateString('cs-CZ')}</span>
                </span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveContact} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Block 1: Základní údaje */}
                  <div className="space-y-4">
                    <h3 className="font-display text-base font-semibold text-foreground text-left">Základní údaje</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_fullname">Jméno a příjmení *</Label>
                        <Input
                          id="edit_fullname"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label>Role *</Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ROLE_OPTIONS.map((opt) => {
                            const active = editRoles.includes(opt.id);
                            return (
                              <button
                                type="button"
                                key={opt.id}
                                onClick={() => handleRoleToggle(opt.id, true)}
                                className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1.5 rounded-full border transition-all ${
                                  active
                                    ? 'bg-[#00221F] border-[#00221F] text-white'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-400'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_phone">Telefon *</Label>
                        <Input
                          id="edit_phone"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+420..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_email">E-mail *</Label>
                        <Input
                          id="edit_email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="jmeno@domena.cz"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_source">Odkud přišel *</Label>
                        <Select
                          value={editSource}
                          onValueChange={(val: Contact['source']) => setEditSource(val)}
                        >
                          <SelectTrigger id="edit_source">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOURCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_status">Stav *</Label>
                        <Select
                          value={editStatus}
                          onValueChange={(val: Contact['status']) => setEditStatus(val)}
                        >
                          <SelectTrigger id="edit_status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="edit_note">Poznámka</Label>
                      <Textarea
                        id="edit_note"
                        rows={3}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Block 2: Co hledá - buyer profile */}
                  {editRoles.includes('kupující') && (
                    <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                      <h3 className="font-display text-base font-semibold text-foreground">Co hledá (poptávkový profil)</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="edit_seeking_transaction">Hledá: transakce *</Label>
                          <Select
                            value={seekingTransaction}
                            onValueChange={setSeekingTransaction}
                          >
                            <SelectTrigger id="edit_seeking_transaction">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="koupě">Koupě</SelectItem>
                              <SelectItem value="pronájem">Pronájem</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Hledá: druh</Label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {KIND_OPTIONS.map((opt) => {
                              const active = seekingKind?.includes(opt) || false;
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => handleEditKindToggle(opt)}
                                  className={`text-[9px] font-semibold px-2.5 py-1.5 rounded-full border transition-all ${
                                    active
                                      ? 'bg-secondary border-secondary text-foreground font-bold'
                                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_seeking_location">Hledá: lokalita</Label>
                        <Input
                          id="edit_seeking_location"
                          value={seekingLocation}
                          onChange={(e) => setSeekingLocation(e.target.value)}
                          placeholder="Např. Vinohrady, Karlín (oddělujte čárkou)"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Hledá: dispozice</Label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {LAYOUT_OPTIONS.map((opt) => {
                              const active = seekingLayout?.includes(opt) || false;
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => handleEditLayoutToggle(opt)}
                                  className={`text-[9px] font-semibold px-2 py-1 rounded-sm border transition-all ${
                                    active
                                      ? 'bg-secondary border-secondary text-foreground font-bold'
                                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Rozpočet</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="Od (Kč)"
                              value={budgetFrom}
                              onChange={(e) => setBudgetFrom(e.target.value)}
                              className="w-full h-9"
                            />
                            <span className="text-muted-foreground text-xs">—</span>
                            <Input
                              type="number"
                              placeholder="Do (Kč)"
                              value={budgetTo}
                              onChange={(e) => setBudgetTo(e.target.value)}
                              className="w-full h-9"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="edit_purpose">Účel</Label>
                          <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger id="edit_purpose">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {PURPOSE_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Aktivně hledá do</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300 h-9">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {seekingUntil ? seekingUntil.toLocaleDateString('cs-CZ') : <span>Vyberte datum</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={seekingUntil} onSelect={setSeekingUntil} />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Block 3: Souhlas (GDPR) */}
                  <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                    <h3 className="font-display text-base font-semibold text-foreground">Souhlas (GDPR)</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="pt-2">
                        <label className="flex items-center gap-2 text-sm font-normal cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={gdprConsent}
                            onChange={(e) => setGdprConsent(e.target.checked)}
                            className="rounded border-stone-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          Souhlas GDPR
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Datum souhlasu</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300 h-9" disabled={!gdprConsent}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {consentDate ? consentDate.toLocaleDateString('cs-CZ') : <span>Vyberte datum</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={consentDate} onSelect={setConsentDate} />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_consent_src">Zdroj souhlasu</Label>
                        <Select value={consentSource} onValueChange={setConsentSource} disabled={!gdprConsent}>
                          <SelectTrigger id="edit_consent_src">
                            <SelectValue placeholder="Vyberte" />
                          </SelectTrigger>
                          <SelectContent>
                            {GDPR_SOURCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Block 4: Linked Deals & Properties list */}
                  <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                    <h3 className="font-display text-base font-semibold text-foreground">Související obchody & nemovitosti</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 bg-stone-50 p-4 rounded-md border border-stone-200 text-left">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Obchody tohoto klienta</h4>
                        {contactDeals.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Žádné spojené obchody.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {contactDeals.map((deal) => (
                              <div
                                key={deal.id}
                                onClick={() => {
                                  setIsDetailOpen(false);
                                  onNavigateToDeal(deal.id);
                                }}
                                className="p-2 border border-stone-200 bg-white rounded-md text-xs cursor-pointer hover:border-[#00D991] flex justify-between items-center transition-colors"
                              >
                                <span className="font-medium truncate max-w-[160px]">{deal.deal_name}</span>
                                <span className="text-[10px] bg-secondary text-stone-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{deal.stage}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 bg-stone-50 p-4 rounded-md border border-stone-200 text-left">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nemovitosti tohoto klienta (vlastník)</h4>
                        {contactProperties.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Nevlastní žádné nemovitosti.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {contactProperties.map((prop) => (
                              <div
                                key={prop.id}
                                onClick={() => {
                                  setIsDetailOpen(false);
                                  onNavigateToProperty(prop.id);
                                }}
                                className="p-2 border border-stone-200 bg-white rounded-md text-xs cursor-pointer hover:border-[#00D991] flex justify-between items-center transition-colors"
                              >
                                <span className="font-medium truncate max-w-[160px]">{prop.address}</span>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{prop.offer_status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Add activity and activity history */}
                <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8 space-y-6">
                  {/* Log Activity */}
                  <Card className="border-stone-200 shadow-xs bg-white">
                    <CardContent className="p-4 space-y-3 text-left">
                      <h4 className="font-display text-sm font-semibold">Zapsat aktivitu / připomínku</h4>
                      
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={actIsReminder}
                            onChange={(e) => setActIsReminder(e.target.checked)}
                            className="rounded border-stone-300 text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          PŘIPOMÍNKA (do budoucna)
                        </label>
                      </div>

                      <div className="space-y-3">
                        {!actIsReminder ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="act_type" className="text-xs">Typ</Label>
                              <Select value={actType} onValueChange={(val: Activity['type']) => setActType(val)}>
                                <SelectTrigger id="act_type" className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hovor">Hovor</SelectItem>
                                  <SelectItem value="e-mail">E-mail</SelectItem>
                                  <SelectItem value="SMS">SMS</SelectItem>
                                  <SelectItem value="schůzka">Schůzka</SelectItem>
                                  <SelectItem value="prohlídka">Prohlídka</SelectItem>
                                  <SelectItem value="poznámka">Poznámka</SelectItem>
                                  <SelectItem value="follow-up">Follow-up</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {(actType === 'hovor' || actType === 'e-mail' || actType === 'SMS') && (
                              <div className="space-y-1">
                                <Label htmlFor="act_dir" className="text-xs">Směr</Label>
                                <Select value={actDirection} onValueChange={setActDirection}>
                                  <SelectTrigger id="act_dir" className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="odchozí">Odchozí</SelectItem>
                                    <SelectItem value="příchozí">Příchozí</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {actType === 'follow-up' && (
                              <div className="space-y-1 col-span-2">
                                <Label htmlFor="act_followup" className="text-xs">Výsledek follow-upu</Label>
                                <Select value={actFollowupResult} onValueChange={setActFollowupResult}>
                                  <SelectTrigger id="act_followup" className="h-8 text-xs">
                                    <SelectValue placeholder="Vyberte" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vážný zájem">Vážný zájem</SelectItem>
                                    <SelectItem value="zvažuje">Zvažuje</SelectItem>
                                    <SelectItem value="nezaujalo">Nezaujalo</SelectItem>
                                    <SelectItem value="nedovolal jsem se">Nedovolal jsem se</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* DateTime selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Datum</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300 h-8 text-xs px-2">
                                  <CalendarIcon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                  {actWhenDate ? actWhenDate.toLocaleDateString('cs-CZ') : <span>Datum</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={actWhenDate} onSelect={(d) => d && setActWhenDate(d)} />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="act_time" className="text-xs">Čas</Label>
                            <Input
                              id="act_time"
                              type="time"
                              value={actWhenTime}
                              onChange={(e) => setActWhenTime(e.target.value)}
                              className="h-8 text-xs px-2"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="act_content" className="text-xs">Text / obsah</Label>
                          <Textarea
                            id="act_content"
                            rows={2}
                            value={actContent}
                            onChange={(e) => setActContent(e.target.value)}
                            placeholder={actIsReminder ? "Co připomenout? (např. Zavolat a zjistit rozpočet)" : "Zapište detaily rozhovoru..."}
                            required
                            className="text-xs"
                          />
                        </div>

                        <Button type="button" onClick={handleAddActivity} size="sm" className="w-full h-8 text-xs font-semibold">
                          Zapsat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* History timeline */}
                  <Card className="border-stone-200 shadow-xs bg-white">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-display text-sm font-semibold text-left">Historie kontaktu</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {contactActivities.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic text-center py-4">Žádná historie aktivit.</p>
                        ) : (
                          contactActivities.map((act) => (
                            <div key={act.id} className="border-b border-stone-100 pb-2.5 last:border-0 text-left">
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                                <span className="font-semibold uppercase tracking-wider bg-stone-100 px-1.5 py-0.5 rounded-md">
                                  {act.type}
                                </span>
                                <span>{new Date(act.when).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs text-foreground leading-relaxed">{act.content}</p>
                              
                              {act.is_reminder && (
                                <span className={`inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${act.done ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {act.done ? 'Splněno' : 'Čeká'}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Zavřít
                </Button>
                <Button type="submit">
                  Uložit změny
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg border-stone-200">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal text-left">Nový kontakt</DialogTitle>
            <DialogDescription className="text-left text-xs">
              Zadejte údaje o osobě. Systém automaticky zkontroluje existenci podle telefonu či e-mailu.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-4 mt-2">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="new_fullname">Jméno a příjmení *</Label>
              <Input
                id="new_fullname"
                placeholder="Např. Jan Novák"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="new_phone">Telefon</Label>
                <Input
                  id="new_phone"
                  placeholder="+420..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_email">E-mail</Label>
                <Input
                  id="new_email"
                  type="email"
                  placeholder="jmeno@domena.cz"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label>Role *</Label>
              <div className="flex gap-2 pt-1">
                {ROLE_OPTIONS.map((opt) => {
                  const active = newRoles.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleRoleToggle(opt.id, false)}
                      className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1.5 rounded-full border transition-all ${
                        active
                          ? 'bg-[#00221F] border-[#00221F] text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="new_source">Odkud přišel *</Label>
                <Select value={newSource} onValueChange={(val: Contact['source']) => setNewSource(val)} required>
                  <SelectTrigger id="new_source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_status">Stav *</Label>
                <Select value={newStatus} onValueChange={(val: Contact['status']) => setNewStatus(val)} required>
                  <SelectTrigger id="new_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="new_note">Poznámka</Label>
              <Textarea
                id="new_note"
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">
                Vytvořit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
