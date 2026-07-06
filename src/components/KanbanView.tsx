import React, { useState } from 'react';
import { Deal, Contact, Property, Activity } from '@/types';
import { updateDeal, createDeal, createActivity } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Clock, User, Briefcase, Trash2, CheckCircle2, ChevronRight, XCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const STAGES = [
  { id: 'lead', label: 'Lead' },
  { id: 'kontaktován', label: 'Kontaktován' },
  { id: 'kvalifikován', label: 'Kvalifikován' },
  { id: 'prohlídka', label: 'Prohlídka' },
  { id: 'nabídka', label: 'Nabídka' },
  { id: 'rezervace', label: 'Rezervace' },
  { id: 'podpis', label: 'Podpis' },
  { id: 'prohráno', label: 'Prohráno' },
] as const;

interface KanbanViewProps {
  deals: Deal[];
  contacts: Contact[];
  properties: Property[];
  activities: Activity[];
  onRefresh: () => void;
  onNavigateToContact: (contactId: string) => void;
  onNavigateToProperty: (propertyId: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  deals,
  contacts,
  properties,
  activities,
  onRefresh,
  onNavigateToContact,
  onNavigateToProperty,
}) => {
  // Modal states
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Deal form states
  const [newBuyerId, setNewBuyerId] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newStage, setNewStage] = useState<Deal['stage']>('lead');
  const [newFinancing, setNewFinancing] = useState<string>('');
  const [newValue, setNewValue] = useState('');
  const [newNextStep, setNewNextStep] = useState('');
  const [newNextStepDate, setNewNextStepDate] = useState<Date | undefined>(undefined);

  // Edit Deal detail states
  const [editStage, setEditStage] = useState<Deal['stage']>('lead');
  const [editResult, setEditResult] = useState<Deal['result']>('otevřený');
  const [editFinancing, setEditFinancing] = useState<string>('');
  const [editMustSellFirst, setEditMustSellFirst] = useState(false);
  const [editMovingTerm, setEditMovingTerm] = useState<string>('');
  const [editValue, setEditValue] = useState('');
  const [editNextStep, setEditNextStep] = useState('');
  const [editNextStepDate, setEditNextStepDate] = useState<Date | undefined>(undefined);
  const [editLossReason, setEditLossReason] = useState<string>('');
  const [editExpectedClose, setEditExpectedClose] = useState<Date | undefined>(undefined);

  // Log activity form states in Deal modal
  const [actType, setActType] = useState<Activity['type']>('hovor');
  const [actContent, setActContent] = useState('');
  const [actIsReminder, setActIsReminder] = useState(false);
  const [actWhenDate, setActWhenDate] = useState<Date>(new Date());
  const [actWhenTime, setActWhenTime] = useState('10:00');
  const [actDirection, setActDirection] = useState<string>('odchozí');
  const [actFollowupResult, setActFollowupResult] = useState<string>('');

  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOverCol = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDraggedOverCol(colId);
  };

  const handleDragLeaveCol = () => {
    setDraggedOverCol(null);
  };

  const handleDropCol = async (e: React.DragEvent, targetStage: Deal['stage']) => {
    setDraggedOverCol(null);
    await handleDrop(e, targetStage);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Deal['stage']) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    try {
      const existingDeal = deals.find((d) => d.id === dealId);
      if (!existingDeal) return;

      const updateData: Partial<Deal> = { stage: targetStage };
      
      // Auto-set result when moving to terminal stages
      if (targetStage === 'podpis') {
        updateData.result = 'vyhraný';
        updateData.closed_date = new Date().toISOString().split('T')[0];
      } else if (targetStage === 'prohráno') {
        updateData.result = 'prohraný';
        updateData.closed_date = new Date().toISOString().split('T')[0];
        // If loss reason is empty, we'll need to prompt for it in details, default to 'jiné' here
        if (!existingDeal.loss_reason) {
          updateData.loss_reason = 'jiné';
        }
      } else {
        updateData.result = 'otevřený';
        updateData.closed_date = null;
      }

      await updateDeal(dealId, updateData);
      
      // Log an activity for stage change
      await createActivity({
        type: 'poznámka',
        content: `Změna fáze obchodu na: ${targetStage === 'podpis' ? 'Podpis (Vyhraný)' : targetStage === 'prohráno' ? 'Prohráno' : STAGES.find(s => s.id === targetStage)?.label || targetStage}`,
        contact_id: existingDeal.buyer_id,
        deal_id: dealId,
        when: new Date().toISOString(),
        is_reminder: false,
        done: true,
        direction: null,
        followup_result: null,
        who: null
      });

      toast.success('Fáze obchodu byla změněna.');
      onRefresh();
    } catch (error) {
      toast.error('Chyba při změně fáze obchodu.');
    }
  };

  // Open deal detail modal
  const openDealDetails = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditStage(deal.stage);
    setEditResult(deal.result);
    setEditFinancing(deal.financing || '');
    setEditMustSellFirst(deal.must_sell_first || false);
    setEditMovingTerm(deal.moving_term || '');
    setEditValue(deal.value ? deal.value.toString() : '');
    setEditNextStep(deal.next_step || '');
    setEditNextStepDate(deal.next_step_date ? new Date(deal.next_step_date) : undefined);
    setEditLossReason(deal.loss_reason || '');
    setEditExpectedClose(deal.expected_close ? new Date(deal.expected_close) : undefined);
    
    // Reset activity logger
    setActContent('');
    setActIsReminder(false);
    setActWhenDate(new Date());
    setActWhenTime(new Date().toTimeString().slice(0, 5));
    
    setIsDetailOpen(true);
  };

  // Save deal edits
  const handleSaveDealDetails = async () => {
    if (!selectedDeal) return;
    
    try {
      const updateData: Partial<Deal> = {
        stage: editStage,
        result: editResult,
        temperature: null,
        financing: (editFinancing as Deal['financing']) || null,
        must_sell_first: editMustSellFirst,
        moving_term: (editMovingTerm as Deal['moving_term']) || null,
        value: editValue ? Number(editValue) : null,
        next_step: editNextStep || null,
        next_step_date: editNextStepDate ? editNextStepDate.toISOString().split('T')[0] : null,
        loss_reason: (editResult === 'prohraný' || editStage === 'prohráno') ? (editLossReason as Deal['loss_reason'] || 'jiné') : null,
        expected_close: editExpectedClose ? editExpectedClose.toISOString().split('T')[0] : null,
      };

      if (editResult === 'vyhraný' || editStage === 'podpis') {
        updateData.result = 'vyhraný';
        updateData.stage = 'podpis';
        if (!selectedDeal.closed_date) updateData.closed_date = new Date().toISOString().split('T')[0];
      } else if (editResult === 'prohraný' || editStage === 'prohráno') {
        updateData.result = 'prohraný';
        updateData.stage = 'prohráno';
        if (!selectedDeal.closed_date) updateData.closed_date = new Date().toISOString().split('T')[0];
      } else {
        updateData.result = 'otevřený';
        updateData.stage = editStage;
        updateData.closed_date = null;
      }

      await updateDeal(selectedDeal.id, updateData);
      toast.success('Obchod byl aktualizován.');
      setIsDetailOpen(false);
      onRefresh();
    } catch (error) {
      toast.error('Nepodařilo se uložit změny obchodu.');
    }
  };

  // Log activity from deal detail
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal || !actContent.trim()) return;

    try {
      const whenDateTime = new Date(actWhenDate);
      const [hours, minutes] = actWhenTime.split(':');
      whenDateTime.setHours(Number(hours), Number(minutes), 0, 0);

      await createActivity({
        type: actIsReminder ? 'PŘIPOMÍNKA' : actType,
        content: actContent,
        contact_id: selectedDeal.buyer_id,
        deal_id: selectedDeal.id,
        when: whenDateTime.toISOString(),
        is_reminder: actIsReminder,
        done: actIsReminder ? false : true,
        direction: (actType === 'hovor' || actType === 'e-mail' || actType === 'SMS') ? (actDirection as Activity['direction']) : null,
        followup_result: actType === 'follow-up' ? (actFollowupResult as Activity['followup_result']) : null,
        who: null,
      });

      // If logging a next step reminder, automatically sync to the deal fields too!
      if (actIsReminder) {
        await updateDeal(selectedDeal.id, {
          next_step: actContent,
          next_step_date: whenDateTime.toISOString().split('T')[0],
        });
      }

      toast.success(actIsReminder ? 'Připomínka byla uložena.' : 'Aktivita byla zaznamenána.');
      setActContent('');
      onRefresh();
      
      // For simplicity, just close details and refresh
      setIsDetailOpen(false);
    } catch (error) {
      toast.error('Nepodařilo se uložit aktivita/připomínku.');
    }
  };

  // Create new deal
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerId) {
      toast.error('Musíte vybrat kupujícího/zájemce.');
      return;
    }

    try {
      const created = await createDeal({
        buyer_id: newBuyerId,
        property_id: newPropertyId || null,
        stage: newStage,
        result: 'otevřený',
        temperature: null,
        financing: (newFinancing as Deal['financing']) || null,
        must_sell_first: false,
        moving_term: null,
        value: newValue ? Number(newValue) : null,
        next_step: newNextStep || null,
        next_step_date: newNextStepDate ? newNextStepDate.toISOString().split('T')[0] : null,
        expected_close: null,
        closed_date: null,
        loss_reason: null,
        assigned_agent: null,
      });

      // Log creation activity
      await createActivity({
        type: 'poznámka',
        content: `Vytvořen nový obchod.`,
        contact_id: newBuyerId,
        deal_id: created.id,
        when: new Date().toISOString(),
        is_reminder: false,
        done: true,
        direction: null,
        followup_result: null,
        who: null,
      });

      toast.success('Obchod byl založen.');
      setIsCreateOpen(false);
      
      // Reset form
      setNewBuyerId('');
      setNewPropertyId('');
      setNewStage('lead');
      setNewFinancing('');
      setNewValue('');
      setNewNextStep('');
      setNewNextStepDate(undefined);
      
      onRefresh();
    } catch (error) {
      toast.error('Nepodařilo se vytvořit obchod.');
    }
  };



  const formatCurrency = (val: number | null) => {
    if (val === null) return '';
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);
  };

  // Filter activities for selected deal
  const selectedDealActivities = selectedDeal
    ? activities.filter((a) => a.deal_id === selectedDeal.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-normal tracking-tight">Nástěnka obchodů</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Řiďte své deals od leadu až po podpis smlouvy. Přetažením měňte fázi.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 h-10 font-medium"
        >
          <Plus className="h-4.5 w-4.5" />
          Nový obchod
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 items-start overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colDeals = deals.filter((d) => d.stage === col.id);

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOverCol(e, col.id)}
              onDragLeave={handleDragLeaveCol}
              onDrop={(e) => handleDropCol(e, col.id)}
              className={`rounded-lg border-2 p-3.5 min-h-[520px] flex flex-col gap-3 transition-all duration-200 ${
                draggedOverCol === col.id
                  ? 'bg-[#00D991]/5 border-dashed border-[#00D991]'
                  : 'bg-stone-50/50 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-display text-[13px] text-[#141414] font-semibold">
                  {col.label}
                </span>
                <span className="bg-secondary text-stone-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {colDeals.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5">
                {colDeals.map((deal) => {
                  const isNextStepOverdue = deal.next_step_date && new Date(deal.next_step_date) < new Date() && deal.stage !== 'podpis' && deal.stage !== 'prohráno';

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => openDealDetails(deal)}
                      className="bg-white rounded-md border border-border/85 p-3.5 hover:border-[#00D991] hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="font-display text-[13px] leading-snug font-semibold text-foreground truncate">
                          {deal.deal_name}
                        </div>
                        {deal.value && (
                          <div className="text-[11.5px] text-muted-foreground font-mono">
                            {formatCurrency(deal.value)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {deal.financing && (
                          <span className="bg-stone-100 text-stone-600 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {deal.financing}
                          </span>
                        )}
                      </div>

                      {deal.next_step && (
                        <div className="border-t border-border/50 dark:border-stone-800/50 pt-2 space-y-1">
                          <div className="text-[11px] text-[#706F69] dark:text-stone-400 leading-snug truncate">
                            <strong>Krok:</strong> {deal.next_step}
                          </div>
                          {deal.next_step_date && (
                            <div className={`text-[10px] flex items-center gap-1 ${isNextStepOverdue ? 'text-rose-600 font-semibold' : 'text-muted-foreground'}`}>
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(deal.next_step_date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE DEAL DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">Nový obchod (Deal)</DialogTitle>
            <DialogDescription>Založte nový obchod spojením kupujícího s nemovitostí.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="buyer_select">Kupující / zájemce *</Label>
              <Select value={newBuyerId} onValueChange={setNewBuyerId} required>
                <SelectTrigger id="buyer_select">
                  <SelectValue placeholder="Vyberte kupujícího" />
                </SelectTrigger>
                <SelectContent>
                  {contacts
                    .filter((c) => c.roles.includes('kupující'))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name} ({c.phone || c.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property_select">Přiřazená nemovitost</Label>
              <Select value={newPropertyId} onValueChange={setNewPropertyId}>
                <SelectTrigger id="property_select">
                  <SelectValue placeholder="Žádná / Poptávka naslepo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none_property">-- Žádná nemovitost --</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.address} ({p.kind === 'byt' ? p.flat_layout : p.kind})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stage_select">Fáze *</Label>
                <Select value={newStage} onValueChange={(val: Deal['stage']) => setNewStage(val)} required>
                  <SelectTrigger id="stage_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fin_select">Financování</Label>
                <Select value={newFinancing} onValueChange={setNewFinancing}>
                  <SelectTrigger id="fin_select">
                    <SelectValue placeholder="Vyberte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotovost">Hotovost</SelectItem>
                    <SelectItem value="hypotéka schválená">Hypotéka schválená</SelectItem>
                    <SelectItem value="hypotéka v řešení">Hypotéka v řešení</SelectItem>
                    <SelectItem value="neřešeno">Neřešeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="value_input">Předpokládaná hodnota (Kč)</Label>
                <Input
                  id="value_input"
                  type="number"
                  placeholder="Hodnota obchodu"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="next_step_input">Příští krok</Label>
                <Input
                  id="next_step_input"
                  placeholder="např. Zavolat a domluvit termín prohlídky"
                  value={newNextStep}
                  onChange={(e) => setNewNextStep(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Termín příštího kroku</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newNextStepDate ? newNextStepDate.toLocaleDateString('cs-CZ') : <span>Vyberte datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={newNextStepDate} onSelect={setNewNextStepDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">Vytvořit obchod</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL AND LOGGING DIALOG */}
      {selectedDeal && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-5xl lg:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-normal border-b border-border pb-3 flex items-center justify-between">
                <span>{selectedDeal.deal_name}</span>
                <span className="text-xs font-mono font-normal text-muted-foreground mr-6">
                  ID: {selectedDeal.id.slice(0, 8)}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
              {/* Left Column: Edit Deal Form */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="font-display text-lg font-normal">Detaily obchodu</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Kupující</Label>
                    <div className="text-sm font-medium p-2 bg-secondary/40 rounded-sm flex items-center justify-between">
                      <span>{selectedDeal.buyer?.full_name}</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setIsDetailOpen(false);
                          onNavigateToContact(selectedDeal.buyer_id);
                        }}
                        className="h-auto p-0 text-xs text-primary underline"
                      >
                        Přejít na kartu
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Nemovitost</Label>
                    <div className="text-sm font-medium p-2 bg-secondary/40 rounded-sm flex items-center justify-between">
                      <span className="truncate max-w-[150px]">
                        {selectedDeal.property ? selectedDeal.property.address : 'Žádná'}
                      </span>
                      {selectedDeal.property && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setIsDetailOpen(false);
                            onNavigateToProperty(selectedDeal.property_id!);
                          }}
                          className="h-auto p-0 text-xs text-primary underline"
                        >
                          Přejít na kartu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_stage">Fáze obchodu</Label>
                    <Select value={editStage} onValueChange={(val: Deal['stage']) => setEditStage(val)}>
                      <SelectTrigger id="edit_stage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_result">Výsledek</Label>
                    <Select value={editResult} onValueChange={(val: Deal['result']) => setEditResult(val)}>
                      <SelectTrigger id="edit_result">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="otevřený">Otevřený</SelectItem>
                        <SelectItem value="vyhraný">Vyhraný</SelectItem>
                        <SelectItem value="prohraný">Prohraný</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Show Loss Reason if prohraný */}
                {(editResult === 'prohraný' || editStage === 'prohráno') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_loss_reason">Důvod prohry</Label>
                    <Select value={editLossReason} onValueChange={setEditLossReason}>
                      <SelectTrigger id="edit_loss_reason">
                        <SelectValue placeholder="Vyberte důvod" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cena">Cena</SelectItem>
                        <SelectItem value="financování">Financování</SelectItem>
                        <SelectItem value="koupil jinde">Koupil jinde</SelectItem>
                        <SelectItem value="rozmyslel si">Rozmyslel si</SelectItem>
                        <SelectItem value="nedostupné">Nedostupné</SelectItem>
                        <SelectItem value="jiné">Jiné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_fin">Financování</Label>
                    <Select value={editFinancing} onValueChange={setEditFinancing}>
                      <SelectTrigger id="edit_fin">
                        <SelectValue placeholder="Vyberte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotovost">Hotovost</SelectItem>
                        <SelectItem value="hypotéka schválená">Hypotéka schválená</SelectItem>
                        <SelectItem value="hypotéka v řešení">Hypotéka v řešení</SelectItem>
                        <SelectItem value="neřešeno">Neřešeno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_value">Hodnota obchodu (Kč)</Label>
                    <Input
                      id="edit_value"
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_moving">Termín stěhování</Label>
                    <Select value={editMovingTerm} onValueChange={setEditMovingTerm}>
                      <SelectTrigger id="edit_moving">
                        <SelectValue placeholder="Vyberte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="do 1 měsíce">Do 1 měsíce</SelectItem>
                        <SelectItem value="do 3 měsíců">Do 3 měsíců</SelectItem>
                        <SelectItem value="do 6 měsíců">Do 6 měsíců</SelectItem>
                        <SelectItem value="nespěchá">Nespěchá</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm font-normal cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editMustSellFirst}
                      onChange={(e) => setEditMustSellFirst(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    Musí nejdřív prodat jinou nemovitost?
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_next_step">Další krok</Label>
                    <Input
                      id="edit_next_step"
                      value={editNextStep}
                      onChange={(e) => setEditNextStep(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Termín dalšího kroku</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editNextStepDate ? editNextStepDate.toLocaleDateString('cs-CZ') : <span>Vyberte datum</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={editNextStepDate} onSelect={setEditNextStepDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Očekávané uzavření</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal border-stone-300">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editExpectedClose ? editExpectedClose.toLocaleDateString('cs-CZ') : <span>Vyberte datum</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={editExpectedClose} onSelect={setEditExpectedClose} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Zavřít
                  </Button>
                  <Button type="button" onClick={handleSaveDealDetails}>
                    Uložit změny
                  </Button>
                </div>
              </div>

              {/* Right Column: Log Activity and History */}
              <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8 space-y-6">
                {/* 1. Log Activity Form */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-normal">Zaznamenat aktivitu / připomínku</h3>
                  <form onSubmit={handleAddActivity} className="space-y-3 bg-stone-50 dark:bg-stone-900/40 p-4 rounded-md border border-border/60">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={actIsReminder}
                          onChange={(e) => setActIsReminder(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        PŘIPOMÍNKA (do budoucna)
                      </label>
                    </div>

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

                        {/* Direction if communication */}
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

                    {/* DateTime selector for activity or reminder */}
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
                        placeholder={actIsReminder ? "Co připomenout? (např. Zavolat kvůli nabídce)" : "Zapište, co se stalo..."}
                        required
                        className="text-xs"
                      />
                    </div>

                    <Button type="submit" size="sm" className="w-full h-8 text-xs font-semibold">
                      Zapsat {actIsReminder ? 'připomínku' : 'aktivitu'}
                    </Button>
                  </form>
                </div>

                {/* 2. Timeline history */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-normal">Historie obchodu</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedDealActivities.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Žádné zaznamenané aktivity.</p>
                    ) : (
                      selectedDealActivities.map((act) => (
                        <div key={act.id} className="border-b border-border/60 pb-2.5 last:border-0">
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                            <span className="font-semibold uppercase tracking-wider bg-stone-100 dark:bg-stone-850 px-1 rounded-sm">
                              {act.type}
                            </span>
                            <span>{new Date(act.when).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{act.content}</p>
                          
                          {/* Done badge if reminder */}
                          {act.is_reminder && (
                            <span className={`inline-block mt-1 text-[9px] font-medium px-1 rounded-sm ${act.done ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'}`}>
                              {act.done ? 'Splněno' : 'Čeká'}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};


