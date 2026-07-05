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
import { Search, Plus, User, Mail, Phone, Calendar as CalendarIcon, Briefcase, Home, Clock, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const ROLE_OPTIONS = [
  { id: 'kupující', label: 'kupující' },
  { id: 'vlastník', label: 'vlastník' },
  { id: 'protistrana', label: 'protistrana' },
  { id: 'doporučitel', label: 'doporučitel' },
] as const;

const SOURCE_OPTIONS = ['Sreality', 'iDNES', 'web', 'doporučení', 'cold call', 'monitoring', 'osobní'] as const;
const STATUS_OPTIONS = ['nový', 'kontaktovaný', 'kvalifikovaný', 'klient', 'ztracený'] as const;
const TEMP_OPTIONS = ['horký', 'vlažný', 'studený'] as const;
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
  onRefresh,
  onNavigateToDeal,
  onNavigateToProperty,
}) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Focus contact if navigated from outside
  useEffect(() => {
    if (initialSelectedContactId) {
      const match = contacts.find((c) => c.id === initialSelectedContactId);
      if (match) {
        setSelectedContact(match);
      }
    } else if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [initialSelectedContactId, contacts, selectedContact]);

  // Create form states
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoles, setNewRoles] = useState<Contact['roles']>([]);
  const [newSource, setNewSource] = useState<Contact['source']>('web');
  const [newStatus, setNewStatus] = useState<Contact['status']>('nový');
  const [newTemperature, setNewTemperature] = useState<string>('');
  const [newNote, setNewNote] = useState('');

  // Edit details form states
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoles, setEditRoles] = useState<Contact['roles']>([]);
  const [editSource, setEditSource] = useState<Contact['source']>('web');
  const [editStatus, setEditStatus] = useState<Contact['status']>('nový');
  const [editTemperature, setEditTemperature] = useState<string>('');
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
      setEditTemperature(selectedContact.temperature || '');
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

  // Search filter
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

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
        temperature: (editTemperature as Contact['temperature']) || null,
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
        temperature: (newTemperature as Contact['temperature']) || null,
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
      setNewTemperature('');
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Column: Search & List */}
      <div className="md:col-span-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat jméno, mobil, e-mail..."
            className="pl-9 border-stone-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground italic text-center bg-white border border-border rounded-md">Nebyly nalezeny žádné kontakty.</div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3.5 cursor-pointer rounded-md border border-transparent transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-secondary border-secondary text-foreground'
                      : 'bg-white border-border hover:bg-stone-50'
                  }`}
                >
                  <div className="font-display font-semibold text-sm text-foreground truncate">
                    {contact.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate flex gap-1 font-mono">
                    {contact.phone && <span className="mr-2">{contact.phone}</span>}
                    {!contact.phone && contact.email && <span>{contact.email}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.roles.map((role) => (
                      <span key={role} className="bg-stone-100 text-stone-600 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full gap-1.5 font-medium h-10"
        >
          <Plus className="h-4.5 w-4.5" />
          Přidat nový kontakt
        </Button>
      </div>

      {/* Right Column: Contact Details */}
      <div className="md:col-span-8">
        {selectedContact ? (
          <form onSubmit={handleSaveContact} className="space-y-6">
            <Card className="border-border shadow-sm bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="border-b border-border pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{editFullName}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Založeno: <span className="font-semibold font-mono">{new Date(selectedContact.created_at).toLocaleDateString('cs-CZ')}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Uložit změny
                    </Button>
                  </div>
                </div>

                {/* Block 1: Základní údaje */}
                <div className="space-y-4">
                  <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">Základní údaje</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label>Role (vyberte aspoň jednu) *</Label>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                        {ROLE_OPTIONS.map((opt) => (
                          <label key={opt.id} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={editRoles.includes(opt.id)}
                              onChange={() => handleRoleToggle(opt.id, true)}
                              className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_phone">Telefon (aspoň e-mail nebo telefon) *</Label>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_temp">Teplota (skóre)</Label>
                      <Select
                        value={editTemperature}
                        onValueChange={setEditTemperature}
                      >
                        <SelectTrigger id="edit_temp">
                          <SelectValue placeholder="Nespecifikováno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nespecifikováno</SelectItem>
                          {TEMP_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_note">Poznámka</Label>
                    <Textarea
                      id="edit_note"
                      rows={3}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Doplňte bližší informace o osobě..."
                    />
                  </div>
                </div>

                {/* Block 2: Co hledá (Buyer demand profile - only for buyer role) */}
                {editRoles.includes('kupující') && (
                  <div className="border-t border-[#EAE9E2] pt-5 space-y-4">
                    <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">
                      Co hledá — poptávkový profil
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="seeking_trans">Hledá: transakce *</Label>
                        <Select
                          value={seekingTransaction}
                          onValueChange={setSeekingTransaction}
                        >
                          <SelectTrigger id="seeking_trans">
                            <SelectValue placeholder="Vyberte transakci" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="koupě">Koupě</SelectItem>
                            <SelectItem value="pronájem">Pronájem</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="purpose">Účel</Label>
                        <Select value={purpose} onValueChange={setPurpose}>
                          <SelectTrigger id="purpose">
                            <SelectValue placeholder="Vyberte účel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none_purpose">Neuvedeno</SelectItem>
                            {PURPOSE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Hledá: druh nemovitosti</Label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {KIND_OPTIONS.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={seekingKind?.includes(opt) || false}
                              onChange={() => handleEditKindToggle(opt)}
                              className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Hledá: dispozice bytu</Label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {LAYOUT_OPTIONS.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={seekingLayout?.includes(opt) || false}
                              onChange={() => handleEditLayoutToggle(opt)}
                              className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="seeking_loc">Hledá: lokalita (oddělte čárkou)</Label>
                        <Input
                          id="seeking_loc"
                          value={seekingLocation}
                          onChange={(e) => setSeekingLocation(e.target.value)}
                          placeholder="Plzeň, Bory, Slovany"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label>Aktivně hledá do</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300 h-10">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="budget_from">Rozpočet od (Kč)</Label>
                        <Input
                          id="budget_from"
                          type="number"
                          value={budgetFrom}
                          onChange={(e) => setBudgetFrom(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="budget_to">Rozpočet do (Kč)</Label>
                        <Input
                          id="budget_to"
                          type="number"
                          value={budgetTo}
                          onChange={(e) => setBudgetTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Block 3: Souhlas (GDPR) */}
                <div className="border-t border-[#EAE9E2] pt-5 space-y-4">
                  <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">Souhlas (GDPR)</h3>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm font-normal cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={gdprConsent}
                        onChange={(e) => setGdprConsent(e.target.checked)}
                        className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-4 w-4"
                      />
                      Souhlas GDPR udělen?
                    </label>
                  </div>

                  {gdprConsent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Datum souhlasu</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300 h-10">
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
                        <Label htmlFor="gdpr_source">Zdroj souhlasu</Label>
                        <Select value={consentSource} onValueChange={setConsentSource}>
                          <SelectTrigger id="gdpr_source">
                            <SelectValue placeholder="Vyberte zdroj" />
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
                  )}
                </div>

                {/* Block 4: Linked Deals and Owned Properties */}
                {(contactDeals.length > 0 || contactProperties.length > 0) && (
                  <div className="border-t border-[#EAE9E2] pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Associated Deals */}
                    {contactDeals.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Přiřazené obchody (Deals)</Label>
                        <div className="space-y-1">
                          {contactDeals.map((deal) => (
                            <button
                              key={deal.id}
                              type="button"
                              onClick={() => onNavigateToDeal(deal.id)}
                              className="w-full text-left p-2 rounded-sm border border-stone-200 hover:border-primary text-xs font-medium bg-stone-50/50 flex justify-between items-center"
                            >
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-stone-500" />
                                {deal.deal_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold bg-[#F3F2EC] px-1 rounded-sm">
                                {deal.stage}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Associated Properties */}
                    {contactProperties.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vlastněné nemovitosti</Label>
                        <div className="space-y-1">
                          {contactProperties.map((prop) => (
                            <button
                              key={prop.id}
                              type="button"
                              onClick={() => onNavigateToProperty(prop.id)}
                              className="w-full text-left p-2 rounded-sm border border-stone-200 hover:border-primary text-xs font-medium bg-stone-50/50 flex justify-between items-center"
                            >
                              <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                                <Home className="h-3.5 w-3.5 text-stone-500" />
                                {prop.address}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold bg-[#F3F2EC] px-1 rounded-sm">
                                {prop.kind}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        ) : (
          <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center">
            <User className="h-10 w-10 text-muted-foreground/60 stroke-[1.25] mb-3" />
            <CardTitle className="text-lg font-display font-normal">Vyberte kontakt</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Vyberte kontakt z levého seznamu nebo založte nový.
            </CardDescription>
          </Card>
        )}

        {/* Selected Contact Timeline History & New Activity Log */}
        {selectedContact && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Log Activity */}
            <Card className="lg:col-span-5 border-border shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-display text-sm font-semibold">Zapsat aktivitu / připomínku</h4>
                
                <form onSubmit={handleAddActivity} className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={actIsReminder}
                        onChange={(e) => setActIsReminder(e.target.checked)}
                        className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      PŘIPOMÍNKA (do budoucna)
                    </label>
                  </div>

                  {!actIsReminder ? (
                    <div className="grid grid-cols-2 gap-2">
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

                      {/* Direction if communication */}
                      {(actType === 'hovor' || actType === 'e-mail' || actType === 'SMS') && (
                        <div className="space-y-1">
                          <Label htmlFor="act_dir" className="text-xs">Směr</Label>
                          <Select value={actDirection} onValueChange={actDirection => setActDirection(actDirection)}>
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

                      {/* Follow up result */}
                      {actType === 'follow-up' && (
                        <div className="space-y-1 col-span-2">
                          <Label htmlFor="act_follow" className="text-xs">Výsledek follow-upu</Label>
                          <Select value={actFollowupResult} onValueChange={setActFollowupResult}>
                            <SelectTrigger id="act_follow" className="h-8 text-xs">
                              <SelectValue placeholder="Vyberte výsledek" />
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
                  <div className="grid grid-cols-2 gap-2">
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
                        className="h-8 text-xs px-2"
                        value={actWhenTime}
                        onChange={(e) => setActWhenTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="act_content" className="text-xs">Obsah / Popis *</Label>
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

                  <Button type="submit" size="sm" className="w-full h-8 text-xs font-semibold">
                    Zapsat
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* History timeline */}
            <Card className="lg:col-span-7 border-border shadow-sm bg-white">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-display text-sm font-semibold">Historie kontaktu</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {contactActivities.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">Žádná historie aktivit.</p>
                  ) : (
                    contactActivities.map((act) => (
                      <div key={act.id} className="border-b border-border/50 pb-2.5 last:border-0">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                          <span className="font-semibold uppercase tracking-wider bg-stone-100 dark:bg-stone-850 px-1 rounded-sm">
                            {act.type}
                          </span>
                          <span>{new Date(act.when).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{act.content}</p>
                        
                        {act.is_reminder && (
                          <span className={`inline-block mt-1 text-[9px] font-medium px-1 rounded-sm ${act.done ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'}`}>
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
        )}
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">Nový kontakt</DialogTitle>
            <DialogDescription>
              Zadejte údaje o osobě. Systém automaticky zkontroluje existenci podle telefonu či e-mailu.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new_fullname">Jméno a příjmení *</Label>
              <Input
                id="new_fullname"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="např. Jan Novák"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Role *</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                {ROLE_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newRoles.includes(opt.id)}
                      onChange={() => handleRoleToggle(opt.id, false)}
                      className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_phone">Telefon</Label>
                <Input
                  id="new_phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+420..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_email">E-mail</Label>
                <Input
                  id="new_email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jmeno@domena.cz"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <div className="space-y-1.5">
                <Label htmlFor="new_temp">Teplota (skóre)</Label>
                <Select value={newTemperature} onValueChange={setNewTemperature}>
                  <SelectTrigger id="new_temp">
                    <SelectValue placeholder="Neuvedeno" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMP_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new_note">Poznámka</Label>
              <Textarea
                id="new_note"
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="První zápis na kartě..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">Uložit / Provést Dedup</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
