import React, { useState, useEffect } from 'react';
import { Property, Contact, Deal } from '@/types';
import { createProperty, updateProperty, createContact } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, Home, User, Briefcase, DollarSign, MapPin, LayoutGrid, List } from 'lucide-react';

const KIND_OPTIONS = [
  { id: 'byt', label: 'byt' },
  { id: 'dům', label: 'dům' },
  { id: 'pozemek', label: 'pozemek' },
  { id: 'komerční', label: 'komerční' },
  { id: 'garáž/ostatní', label: 'garáž/ostatní' },
] as const;

const TRANSACTION_OPTIONS = ['prodej', 'pronájem'] as const;

const OFFER_STATUS_OPTIONS = [
  'akvizice',
  'prodá později',
  'příprava',
  'v nabídce',
  'rezervováno',
  'uzavřeno',
  'staženo',
] as const;

const FLAT_LAYOUT_OPTIONS = ['1+kk', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5 a více'] as const;
const OWNERSHIP_OPTIONS = ['osobní', 'družstevní', 'SVJ'] as const;
const CONSTRUCTION_OPTIONS = ['cihla', 'panel', 'jiné'] as const;
const FLAT_CONDITION_OPTIONS = ['novostavba', 'po rekonstrukci', 'dobrý', 'před rekonstrukcí'] as const;
const FLAT_FEATURE_OPTIONS = ['výtah', 'balkon/lodžie', 'terasa', 'sklep'] as const;
const PENB_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const HOUSE_LAYOUT_OPTIONS = ['2+kk', '3+kk', '4+kk', '5+kk', '6 a více'] as const;
const HOUSE_TYPE_OPTIONS = ['samostatný', 'řadový', 'dvojdomek'] as const;
const HOUSE_FEATURE_OPTIONS = ['garáž', 'zahrada', 'bazén'] as const;

interface PropertiesViewProps {
  properties: Property[];
  contacts: Contact[];
  deals: Deal[];
  initialSelectedPropertyId?: string;
  onRefresh: () => void;
  onNavigateToContact: (contactId: string) => void;
  onNavigateToDeal: (dealId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  contacts,
  deals,
  initialSelectedPropertyId,
  onRefresh,
  onNavigateToContact,
  onNavigateToDeal,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Focus property if navigated from outside
  useEffect(() => {
    if (initialSelectedPropertyId) {
      const match = properties.find((p) => p.id === initialSelectedPropertyId);
      if (match) {
        setSelectedProperty(match);
        setIsDetailOpen(true);
      }
    }
  }, [initialSelectedPropertyId, properties]);

  // Create form states
  const [ownerMode, setOwnerMode] = useState<'select' | 'new'>('select');
  const [newOwnerFullName, setNewOwnerFullName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerSource, setNewOwnerSource] = useState<Contact['source']>('doporučení');
  const [newOwnerStatus, setNewOwnerStatus] = useState<Contact['status']>('nový');
  const [newOwnerNote, setNewOwnerNote] = useState('');

  const [newOwnerId, setNewOwnerId] = useState('');
  const [newKind, setNewKind] = useState<Property['kind']>('byt');
  const [newTransaction, setNewTransaction] = useState<Property['transaction']>('prodej');
  const [newAddress, setNewAddress] = useState('');
  const [newOfferStatus, setNewOfferStatus] = useState<Property['offer_status']>('v nabídce');
  const [newPrice, setNewPrice] = useState('');
  const [newFacts, setNewFacts] = useState('');
  const [newHandover, setNewHandover] = useState('');
  const [newListingId, setNewListingId] = useState('');

  // Edit details common states
  const [editOwnerId, setEditOwnerId] = useState('');
  const [editKind, setEditKind] = useState<Property['kind']>('byt');
  const [editTransaction, setEditTransaction] = useState<Property['transaction']>('prodej');
  const [editAddress, setEditAddress] = useState('');
  const [editOfferStatus, setEditOfferStatus] = useState<Property['offer_status']>('v nabídce');
  const [editPrice, setEditPrice] = useState('');
  const [editFacts, setEditFacts] = useState('');
  const [editHandover, setEditHandover] = useState('');
  const [editListingId, setEditListingId] = useState('');

  // Byt specific states
  const [flatLayout, setFlatLayout] = useState<string>('');
  const [flatArea, setFlatArea] = useState('');
  const [flatFloor, setFlatFloor] = useState('');
  const [flatOwnership, setFlatOwnership] = useState<string>('');
  const [flatConstruction, setFlatConstruction] = useState<string>('');
  const [flatCondition, setFlatCondition] = useState<string>('');
  const [flatFeatures, setFlatFeatures] = useState<Property['flat_features']>([]);
  const [flatPenb, setFlatPenb] = useState<string>('');

  // Dům specific states
  const [houseLayout, setHouseLayout] = useState<string>('');
  const [houseArea, setHouseArea] = useState('');
  const [landArea, setLandArea] = useState('');
  const [houseType, setHouseType] = useState<string>('');
  const [houseFloors, setHouseFloors] = useState('');
  const [houseFeatures, setHouseFeatures] = useState<Property['house_features']>([]);
  const [houseCondition, setHouseCondition] = useState<string>('');
  const [housePenb, setHousePenb] = useState<string>('');

  // Sync edits when selectedProperty changes
  useEffect(() => {
    if (selectedProperty) {
      setEditOwnerId(selectedProperty.owner_id);
      setEditKind(selectedProperty.kind);
      setEditTransaction(selectedProperty.transaction);
      setEditAddress(selectedProperty.address);
      setEditOfferStatus(selectedProperty.offer_status);
      setEditPrice(selectedProperty.price.toString());
      setEditFacts(selectedProperty.facts_for_answers || '');
      setEditHandover(selectedProperty.handover_term || '');
      setEditListingId(selectedProperty.listing_id || '');

      // Byt specific
      setFlatLayout(selectedProperty.flat_layout || '');
      setFlatArea(selectedProperty.flat_area ? selectedProperty.flat_area.toString() : '');
      setFlatFloor(selectedProperty.floor || '');
      setFlatOwnership(selectedProperty.ownership || '');
      setFlatConstruction(selectedProperty.construction || '');
      setFlatCondition(selectedProperty.flat_condition || '');
      setFlatFeatures(selectedProperty.flat_features || []);
      setFlatPenb(selectedProperty.flat_penb || '');

      // Dům specific
      setHouseLayout(selectedProperty.house_layout || '');
      setHouseArea(selectedProperty.house_area ? selectedProperty.house_area.toString() : '');
      setLandArea(selectedProperty.land_area ? selectedProperty.land_area.toString() : '');
      setHouseType(selectedProperty.house_type || '');
      setHouseFloors(selectedProperty.floors_count ? selectedProperty.floors_count.toString() : '');
      setHouseFeatures(selectedProperty.house_features || []);
      setHouseCondition(selectedProperty.house_condition || '');
      setHousePenb(selectedProperty.house_penb || '');
    }
  }, [selectedProperty]);

  // Search filter
  const filteredProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.address.toLowerCase().includes(q) ||
      p.kind.toLowerCase().includes(q) ||
      p.transaction.toLowerCase().includes(q)
    );
  });

  const handleFlatFeatureToggle = (feat: 'výtah' | 'balkon/lodžie' | 'terasa' | 'sklep') => {
    const target = flatFeatures || [];
    if (target.includes(feat)) {
      setFlatFeatures(target.filter((f) => f !== feat));
    } else {
      setFlatFeatures([...target, feat]);
    }
  };

  const handleHouseFeatureToggle = (feat: 'garáž' | 'zahrada' | 'bazén') => {
    const target = houseFeatures || [];
    if (target.includes(feat)) {
      setHouseFeatures(target.filter((f) => f !== feat));
    } else {
      setHouseFeatures([...target, feat]);
    }
  };

  // Submit Property edits
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    if (!editOwnerId || !editAddress || !editPrice) {
      toast.error('Vlastník, Adresa a Cena jsou povinné údaje.');
      return;
    }

    // Kind specific validations
    if (editKind === 'byt' && (!flatLayout || !flatArea)) {
      toast.error('Pro druh "byt" jsou Dispozice a Užitná plocha povinné.');
      return;
    }
    if (editKind === 'dům' && (!houseLayout || !houseArea || !landArea)) {
      toast.error('Pro druh "dům" jsou Dispozice, Užitná plocha a Plocha pozemku povinné.');
      return;
    }

    try {
      const updateData: Partial<Property> = {
        owner_id: editOwnerId,
        kind: editKind,
        transaction: editTransaction,
        address: editAddress,
        offer_status: editOfferStatus,
        price: Number(editPrice),
        facts_for_answers: editFacts || null,
        handover_term: editHandover || null,
        listing_id: editListingId || null,
        
        // Byt details
        flat_layout: editKind === 'byt' ? (flatLayout as Property['flat_layout']) : null,
        flat_area: editKind === 'byt' && flatArea ? Number(flatArea) : null,
        floor: editKind === 'byt' ? flatFloor || null : null,
        ownership: editKind === 'byt' ? (flatOwnership as Property['ownership']) || null : null,
        construction: editKind === 'byt' ? (flatConstruction as Property['construction']) || null : null,
        flat_condition: editKind === 'byt' ? (flatCondition as Property['flat_condition']) || null : null,
        flat_features: editKind === 'byt' ? flatFeatures : null,
        flat_penb: editKind === 'byt' ? (flatPenb as Property['flat_penb']) || null : null,

        // Dům details
        house_layout: editKind === 'dům' ? (houseLayout as Property['house_layout']) : null,
        house_area: editKind === 'dům' && houseArea ? Number(houseArea) : null,
        land_area: editKind === 'dům' && landArea ? Number(landArea) : null,
        house_type: editKind === 'dům' ? (houseType as Property['house_type']) || null : null,
        floors_count: editKind === 'dům' && houseFloors ? Number(houseFloors) : null,
        house_features: editKind === 'dům' ? houseFeatures : null,
        house_condition: editKind === 'dům' ? (houseCondition as Property['house_condition']) || null : null,
        house_penb: editKind === 'dům' ? (housePenb as Property['house_penb']) || null : null,
      };

      const updated = await updateProperty(selectedProperty.id, updateData);
      toast.success('Nemovitost byla úspěšně uložena.');
      setSelectedProperty(updated);
      onRefresh();
    } catch (error) {
      toast.error('Chyba při ukládání nemovitosti.');
    }
  };

  // Create new property
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress || !newPrice) {
      toast.error('Adresa a Cena jsou povinné údaje.');
      return;
    }

    if (ownerMode === 'select' && !newOwnerId) {
      toast.error('Musíte vybrat existujícího vlastníka.');
      return;
    }

    if (ownerMode === 'new' && (!newOwnerFullName || (!newOwnerPhone && !newOwnerEmail))) {
      toast.error('U nového vlastníka musíte zadat Jméno a příjmení a alespoň jeden kontakt (Telefon nebo E-mail).');
      return;
    }

    try {
      let finalOwnerId = newOwnerId;

      if (ownerMode === 'new') {
        const createdContact = await createContact({
          full_name: newOwnerFullName,
          phone: newOwnerPhone || null,
          email: newOwnerEmail || null,
          roles: ['vlastník'],
          source: newOwnerSource,
          status: newOwnerStatus,
          temperature: null,
          note: newOwnerNote ? `Vytvořeno spolu s nemovitostí na adrese ${newAddress}. Poznámka: ${newOwnerNote}` : `Vytvořeno spolu s nemovitostí na adrese ${newAddress}.`,
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
          consent_source: null
        });
        finalOwnerId = createdContact.id;
      }

      const created = await createProperty({
        owner_id: finalOwnerId,
        kind: newKind,
        transaction: newTransaction,
        address: newAddress,
        offer_status: newOfferStatus,
        price: Number(newPrice),
        facts_for_answers: newFacts || null,
        handover_term: newHandover || null,
        listing_id: newListingId || null,
        attachments: null,
        
        // Nuance fields default to null on creation, agent completes them on card
        flat_layout: null,
        flat_area: null,
        floor: null,
        ownership: null,
        construction: null,
        flat_condition: null,
        flat_features: null,
        flat_penb: null,
        house_layout: null,
        house_area: null,
        land_area: null,
        house_type: null,
        floors_count: null,
        house_features: null,
        house_condition: null,
        house_penb: null,
        land_size: null,
        land_type: null,
        land_utilities: null,
        zoning_plan: null,
        land_access: null,
        land_dimensions: null,
        comm_subtype: null,
        comm_floor_area: null,
        comm_condition_equipment: null,
        comm_parking_entrance: null,
        comm_penb: null,
        rent_deposit: null,
        rent_fees_utilities: null,
        rent_duration: null,
        rent_available_from: null,
        rent_equipment: null,
      });

      toast.success('Nemovitost a vlastník byli úspěšně uloženi.');
      setIsCreateOpen(false);
      setSelectedProperty(created);
      onRefresh();

      // Reset fields
      setNewOwnerId('');
      setNewOwnerFullName('');
      setNewOwnerPhone('');
      setNewOwnerEmail('');
      setNewOwnerSource('doporučení');
      setNewOwnerStatus('nový');
      setNewOwnerNote('');
      setOwnerMode('select');
      setNewKind('byt');
      setNewTransaction('prodej');
      setNewAddress('');
      setNewOfferStatus('v nabídce');
      setNewPrice('');
      setNewFacts('');
      setNewHandover('');
      setNewListingId('');
    } catch (error) {
      toast.error('Chyba při zakládání nemovitosti.');
    }
  };

  const formatCompactPrice = (val: number | null) => {
    if (val === null) return '';
    if (val >= 1000000) {
      return (val / 1000000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 }) + ' mil. Kč';
    }
    return val.toLocaleString('cs-CZ') + ' Kč';
  };

  const formatCurrency = (val: number | null) => {
    if (val === null) return '';
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);
  };

  // Find interested deals
  const interestedDeals = selectedProperty
    ? deals.filter((d) => d.property_id === selectedProperty.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-normal tracking-tight text-[#141414]">Nemovitosti</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Přehled portfolia nemovitostí k prodeji a pronájmu.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 h-10 font-medium"
        >
          <Plus className="h-4.5 w-4.5" />
          Nová nemovitost
        </Button>
      </div>

      {/* Search & View Mode Toggles bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-stone-200 p-3.5 rounded-lg shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat adresu, druh nemovitosti..."
            className="pl-9 border-stone-200 focus-visible:ring-1 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Mode controls / toggles */}
        <div className="flex bg-stone-100 p-0.5 rounded-md w-full sm:w-auto self-stretch sm:self-auto border border-stone-200">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-white text-[#141414] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Karty
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-[#141414] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Seznam
          </button>
        </div>
      </div>

      {/* RENDER LIST OR CARDS */}
      {filteredProperties.length === 0 ? (
        <div className="p-12 text-sm text-muted-foreground italic text-center bg-white border border-stone-200 rounded-lg shadow-xs">
          Nebyly nalezeny žádné nemovitosti.
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {filteredProperties.map((prop) => {
            let displayTitle = '';
            if (prop.kind === 'byt' && prop.flat_layout) {
              displayTitle = `Byt ${prop.flat_layout}`;
            } else if (prop.kind === 'dům' && prop.house_layout) {
              displayTitle = `Dům ${prop.house_layout}`;
            } else {
              displayTitle = prop.kind.toUpperCase();
            }

            return (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setIsDetailOpen(true);
                }}
                className="bg-white border border-stone-200 rounded-lg p-4 cursor-pointer hover:border-[#00D991] hover:shadow-xs transition-all duration-150 flex flex-col justify-between h-[165px] text-left"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-stone-150 px-2 py-0.5 rounded-sm">
                      {prop.transaction}
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      prop.offer_status === 'v nabídce' ? 'bg-emerald-500/10 text-emerald-600' :
                      prop.offer_status === 'rezervováno' ? 'bg-amber-500/10 text-amber-600' :
                      prop.offer_status === 'uzavřeno' ? 'bg-indigo-500/10 text-indigo-600' :
                      'bg-stone-500/10 text-stone-600'
                    }`}>
                      {prop.offer_status}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-[14px] text-foreground pt-1 truncate">
                    {displayTitle}
                  </h3>
                  <p className="text-[11.5px] text-muted-foreground truncate flex items-center gap-1 pt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{prop.address}</span>
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-foreground">
                    {formatCompactPrice(prop.price)}
                  </span>
                  {prop.kind === 'byt' && prop.flat_area && (
                    <span className="text-[10px] text-muted-foreground font-mono">{prop.flat_area} m²</span>
                  )}
                  {prop.kind === 'dům' && prop.house_area && (
                    <span className="text-[10px] text-muted-foreground font-mono">{prop.house_area} m²</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="overflow-x-auto bg-white border border-stone-200 rounded-lg shadow-xs mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-250 bg-stone-50 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Adresa</th>
                <th className="py-3 px-4">Druh</th>
                <th className="py-3 px-4">Transakce</th>
                <th className="py-3 px-4 text-right">Cena</th>
                <th className="py-3 px-4 text-center">Stav</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-xs">
              {filteredProperties.map((prop) => (
                <tr
                  key={prop.id}
                  onClick={() => {
                    setSelectedProperty(prop);
                    setIsDetailOpen(true);
                  }}
                  className="hover:bg-stone-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-foreground truncate max-w-[240px]">
                    {prop.address}
                  </td>
                  <td className="py-3.5 px-4 font-mono capitalize">
                    {prop.kind} {prop.flat_layout || prop.house_layout || ''}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="uppercase text-[9px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm">
                      {prop.transaction}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {formatCompactPrice(prop.price)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      prop.offer_status === 'v nabídce' ? 'bg-emerald-500/10 text-emerald-600' :
                      prop.offer_status === 'rezervováno' ? 'bg-amber-500/10 text-amber-600' :
                      prop.offer_status === 'uzavřeno' ? 'bg-indigo-500/10 text-indigo-600' :
                      'bg-stone-500/10 text-stone-600'
                    }`}>
                      {prop.offer_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] text-primary hover:underline font-bold">Detail</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL DIALOG */}
      {selectedProperty && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-5xl lg:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold border-b border-border pb-3 flex items-center justify-between">
                <span>{editAddress}</span>
                <span className="text-xs font-mono font-normal text-muted-foreground mr-6">
                  Druh: <span className="font-semibold uppercase">{editKind}</span>
                </span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveProperty} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Block 1: Společná pole */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-display text-base font-semibold text-foreground">Obecné parametry</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_owner">Vlastník *</Label>
                        <Select value={editOwnerId} onValueChange={setEditOwnerId} required>
                          <SelectTrigger id="edit_owner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.full_name} ({c.roles.join(', ')})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_address">Adresa nemovitosti *</Label>
                        <Input
                          id="edit_address"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_kind">Druh *</Label>
                        <Select value={editKind} onValueChange={(val: Property['kind']) => setEditKind(val)} required>
                          <SelectTrigger id="edit_kind">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KIND_OPTIONS.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_trans">Transakce *</Label>
                        <Select value={editTransaction} onValueChange={(val: Property['transaction']) => setEditTransaction(val)} required>
                          <SelectTrigger id="edit_trans">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTION_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_status">Stav nabídky *</Label>
                        <Select value={editOfferStatus} onValueChange={(val: Property['offer_status']) => setEditOfferStatus(val)} required>
                          <SelectTrigger id="edit_status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OFFER_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_price">Cena / nájem (Kč) *</Label>
                        <Input
                          id="edit_price"
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_handover">Termín předání</Label>
                        <Input
                          id="edit_handover"
                          value={editHandover}
                          onChange={(e) => setEditHandover(e.target.value)}
                          placeholder="Např. dohodou"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_listing">ID inzerátu</Label>
                        <Input
                          id="edit_listing"
                          value={editListingId}
                          onChange={(e) => setEditListingId(e.target.value)}
                          placeholder="Kód"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_facts">Co je v ceně / fakta pro odpovědi</Label>
                      <Textarea
                        id="edit_facts"
                        rows={3}
                        value={editFacts}
                        onChange={(e) => setEditFacts(e.target.value)}
                        placeholder="Zde uveďte podrobnosti o cenách služeb, energiích a další fakta, která může AI číst..."
                      />
                    </div>
                  </div>

                  {/* Block 2: Byt details */}
                  {editKind === 'byt' && (
                    <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                      <h3 className="font-display text-base font-semibold text-foreground">Specifické parametry pro BYT</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="flat_layout">Dispozice *</Label>
                          <Select value={flatLayout} onValueChange={setFlatLayout}>
                            <SelectTrigger id="flat_layout">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {FLAT_LAYOUT_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="flat_area">Užitná plocha (m²) *</Label>
                          <Input
                            id="flat_area"
                            type="number"
                            value={flatArea}
                            onChange={(e) => setFlatArea(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="flat_floor">Patro / z pater</Label>
                          <Input
                            id="flat_floor"
                            value={flatFloor}
                            onChange={(e) => setFlatFloor(e.target.value)}
                            placeholder="Např. 3. ze 5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="flat_ownership">Vlastnictví</Label>
                          <Select value={flatOwnership} onValueChange={setFlatOwnership}>
                            <SelectTrigger id="flat_ownership">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {OWNERSHIP_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="flat_const">Konstrukce</Label>
                          <Select value={flatConstruction} onValueChange={setFlatConstruction}>
                            <SelectTrigger id="flat_const">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONSTRUCTION_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="flat_cond">Stav bytu</Label>
                          <Select value={flatCondition} onValueChange={setFlatCondition}>
                            <SelectTrigger id="flat_cond">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {FLAT_CONDITION_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="flat_penb">PENB</Label>
                          <Select value={flatPenb} onValueChange={setFlatPenb}>
                            <SelectTrigger id="flat_penb">
                              <SelectValue placeholder="Třída" />
                            </SelectTrigger>
                            <SelectContent>
                              {PENB_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Vybavení bytu</Label>
                        <div className="flex flex-wrap gap-4 pt-1">
                          {FLAT_FEATURE_OPTIONS.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={flatFeatures?.includes(opt) || false}
                                onChange={() => handleFlatFeatureToggle(opt)}
                                className="rounded border-stone-300 text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Block 2: Dům details */}
                  {editKind === 'dům' && (
                    <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                      <h3 className="font-display text-base font-semibold text-foreground">Specifické parametry pro DŮM</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="house_layout">Dispozice / místnosti *</Label>
                          <Select value={houseLayout} onValueChange={setHouseLayout}>
                            <SelectTrigger id="house_layout">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOUSE_LAYOUT_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="house_area">Užitná plocha (m²) *</Label>
                          <Input
                            id="house_area"
                            type="number"
                            value={houseArea}
                            onChange={(e) => setHouseArea(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="land_area">Plocha pozemku (m²) *</Label>
                          <Input
                            id="land_area"
                            type="number"
                            value={landArea}
                            onChange={(e) => setLandArea(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="house_type">Typ domu</Label>
                          <Select value={houseType} onValueChange={setHouseType}>
                            <SelectTrigger id="house_type">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOUSE_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="house_floors">Počet podlaží</Label>
                          <Input
                            id="house_floors"
                            type="number"
                            value={houseFloors}
                            onChange={(e) => setHouseFloors(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="house_cond">Stav domu</Label>
                          <Select value={houseCondition} onValueChange={setHouseCondition}>
                            <SelectTrigger id="house_cond">
                              <SelectValue placeholder="Vyberte" />
                            </SelectTrigger>
                            <SelectContent>
                              {FLAT_CONDITION_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="house_penb">PENB</Label>
                          <Select value={housePenb} onValueChange={setHousePenb}>
                            <SelectTrigger id="house_penb">
                              <SelectValue placeholder="Třída" />
                            </SelectTrigger>
                            <SelectContent>
                              {PENB_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Vybavení a příslušenství</Label>
                        <div className="flex flex-wrap gap-4 pt-1">
                          {HOUSE_FEATURE_OPTIONS.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={houseFeatures?.includes(opt) || false}
                                onChange={() => handleHouseFeatureToggle(opt)}
                                className="rounded border-stone-300 text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Interested Deals */}
                <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8 space-y-6 text-left">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        Zájemci o nemovitost
                      </h3>
                      <span className="text-xs font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-mono">
                        {interestedDeals.length}
                      </span>
                    </div>

                    {interestedDeals.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Žádní aktivní zájemci o tuto nemovitost.</p>
                    ) : (
                      <div className="divide-y divide-stone-150 border border-stone-200 rounded-md overflow-hidden bg-white">
                        {interestedDeals.map((deal) => {
                          const nextStepText = deal.next_step 
                            ? deal.next_step 
                            : deal.stage;

                          const isNextStepOverdue = deal.next_step_date && new Date(deal.next_step_date) < new Date() && deal.stage !== 'podpis' && deal.stage !== 'prohráno';

                          return (
                            <div
                              key={deal.id}
                              onClick={() => {
                                setIsDetailOpen(false);
                                onNavigateToDeal(deal.id);
                              }}
                              className="p-3.5 hover:bg-stone-50 cursor-pointer flex justify-between items-center text-xs font-semibold transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5 text-stone-400" />
                                <span className="text-foreground font-medium truncate max-w-[150px]">
                                  {deal.buyer ? deal.buyer.full_name : deal.deal_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold bg-[#F3F2EC] px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${isNextStepOverdue ? 'text-rose-600 font-bold' : 'text-stone-600'}`}>
                                  {nextStepText}
                                </span>
                                {deal.next_step_date && (
                                  <span className="text-[9px] text-muted-foreground font-normal font-mono">
                                    ({new Date(deal.next_step_date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-stone-200">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal text-left">Přidat nemovitost</DialogTitle>
            <DialogDescription className="text-xs text-left">
              Zadejte základní údaje a přiřaďte nebo rovnou vytvořte vlastníka.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-4 text-left">
            {/* Owner selection mode toggle */}
            <div className="space-y-2">
              <Label>Vlastník nemovitosti *</Label>
              <div className="flex bg-stone-100 p-0.5 rounded-md w-full border border-stone-200">
                <button
                  type="button"
                  onClick={() => setOwnerMode('select')}
                  className={`flex-1 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-all ${
                    ownerMode === 'select'
                      ? 'bg-white text-[#141414] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Vybrat existujícího z kontaktů
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerMode('new')}
                  className={`flex-1 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-all ${
                    ownerMode === 'new'
                      ? 'bg-white text-[#141414] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Vytvořit nového vlastníka
                </button>
              </div>
            </div>

            {/* Selector mode form fields */}
            {ownerMode === 'select' && (
              <div className="space-y-1.5">
                <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                  <SelectTrigger id="new_owner">
                    <SelectValue placeholder="Vyberte vlastníka z kontaktů" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name} ({c.roles.join(', ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Create mode form fields */}
            {ownerMode === 'new' && (
              <div className="border border-stone-200 bg-stone-50/50 p-4 rounded-lg space-y-4">
                <div className="text-xs font-bold text-stone-700 uppercase tracking-wide border-b border-stone-200 pb-1">
                  Údaje nového vlastníka
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner_fullname">Jméno a příjmení *</Label>
                    <Input
                      id="owner_fullname"
                      value={newOwnerFullName}
                      onChange={(e) => setNewOwnerFullName(e.target.value)}
                      placeholder="např. Jan Novák"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner_phone">Telefon *</Label>
                    <Input
                      id="owner_phone"
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value)}
                      placeholder="např. +420 777 888 999"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner_email">E-mail</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      placeholder="např. novak@seznam.cz"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner_source">Odkud přišel *</Label>
                    <Select value={newOwnerSource} onValueChange={setNewOwnerSource}>
                      <SelectTrigger id="owner_source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doporučení">doporučení</SelectItem>
                        <SelectItem value="Sreality">Sreality</SelectItem>
                        <SelectItem value="iDNES">iDNES</SelectItem>
                        <SelectItem value="web">web</SelectItem>
                        <SelectItem value="cold call">cold call</SelectItem>
                        <SelectItem value="monitoring">monitoring</SelectItem>
                        <SelectItem value="osobní">osobní</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner_status">Stav *</Label>
                    <Select value={newOwnerStatus} onValueChange={setNewOwnerStatus}>
                      <SelectTrigger id="owner_status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nový">nový</SelectItem>
                        <SelectItem value="kontaktovaný">kontaktovaný</SelectItem>
                        <SelectItem value="kvalifikovaný">kvalifikovaný</SelectItem>
                        <SelectItem value="klient">klient</SelectItem>
                        <SelectItem value="ztracený">ztracený</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner_note">Poznámka k vlastníku</Label>
                  <Textarea
                    id="owner_note"
                    rows={2}
                    value={newOwnerNote}
                    onChange={(e) => setNewOwnerNote(e.target.value)}
                    placeholder="např. Chce prodat rychle..."
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new_address">Přesná adresa nemovitosti *</Label>
              <Input
                id="new_address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="např. Bory, Plzeň"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_kind">Druh nemovitosti *</Label>
                <Select value={newKind} onValueChange={(val: Property['kind']) => setNewKind(val)} required>
                  <SelectTrigger id="new_kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_trans">Transakce *</Label>
                <Select value={newTransaction} onValueChange={(val: Property['transaction']) => setNewTransaction(val)} required>
                  <SelectTrigger id="new_trans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_price">Cena / Nájem (Kč) *</Label>
                <Input
                  id="new_price"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Kč"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_status">Stav nabídky *</Label>
                <Select value={newOfferStatus} onValueChange={(val: Property['offer_status']) => setNewOfferStatus(val)} required>
                  <SelectTrigger id="new_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFER_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new_handover">Termín předání</Label>
                <Input
                  id="new_handover"
                  value={newHandover}
                  onChange={(e) => setNewHandover(e.target.value)}
                  placeholder="např. Ihned"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_listing">ID inzerátu</Label>
                <Input
                  id="new_listing"
                  value={newListingId}
                  onChange={(e) => setNewListingId(e.target.value)}
                  placeholder="např. 102030"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new_facts">Fakta / Co je v ceně</Label>
              <Textarea
                id="new_facts"
                rows={2}
                value={newFacts}
                onChange={(e) => setNewFacts(e.target.value)}
                placeholder="Fakta sloužící pro AI odpovědi..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">Vytvořit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
