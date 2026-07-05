import React, { useState, useEffect } from 'react';
import { Property, Contact, Deal } from '@/types';
import { createProperty, updateProperty } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, Home, User, Briefcase, PlusCircle, DollarSign, MapPin } from 'lucide-react';

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

  // Focus property if navigated from outside
  useEffect(() => {
    if (initialSelectedPropertyId) {
      const match = properties.find((p) => p.id === initialSelectedPropertyId);
      if (match) {
        setSelectedProperty(match);
      }
    } else if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0]);
    }
  }, [initialSelectedPropertyId, properties, selectedProperty]);

  // Create form states
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
    if (!newOwnerId || !newAddress || !newPrice) {
      toast.error('Vlastník, Adresa a Cena jsou povinné údaje.');
      return;
    }

    try {
      const created = await createProperty({
        owner_id: newOwnerId,
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

      toast.success('Nemovitost byla úspěšně vytvořena. Nyní doplňte dispozice na její kartě.');
      setIsCreateOpen(false);
      setSelectedProperty(created);
      onRefresh();

      // Reset fields
      setNewOwnerId('');
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

  const formatCurrency = (val: number | null) => {
    if (val === null) return '';
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);
  };

  // Find interested deals
  const interestedDeals = selectedProperty
    ? deals.filter((d) => d.property_id === selectedProperty.id)
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Column: List */}
      <div className="md:col-span-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat adresu, druh..."
            className="pl-9 border-stone-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card className="border-[#EAE9E2] shadow-sm">
          <div className="divide-y divide-[#EAE9E2]/60 max-h-[500px] overflow-y-auto">
            {filteredProperties.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground italic text-center">Žádné nemovitosti nenalezeny.</div>
            ) : (
              filteredProperties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className={`p-3.5 cursor-pointer transition-colors duration-150 text-left ${
                      isSelected
                        ? 'bg-stone-100 dark:bg-stone-800'
                        : 'hover:bg-stone-50/50 dark:hover:bg-stone-900/30'
                    }`}
                  >
                    <div className="font-display font-medium text-sm text-foreground dark:text-stone-100 truncate">
                      {prop.address}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate flex justify-between items-center">
                      <span className="capitalize">{prop.transaction}: {prop.kind === 'byt' && prop.flat_layout ? `${prop.flat_layout} byt` : prop.kind}</span>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">{formatCurrency(prop.price)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="bg-[#F3F2EC] dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[9px] font-medium px-1.5 py-0.5 rounded-sm uppercase">
                        {prop.offer_status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full gap-1.5 font-medium h-10"
        >
          <Plus className="h-4.5 w-4.5" />
          Přidat novou nemovitost
        </Button>
      </div>

      {/* Right Column: Details */}
      <div className="md:col-span-8">
        {selectedProperty ? (
          <form onSubmit={handleSaveProperty} className="space-y-6">
            <Card className="border-[#EAE9E2] shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="border-b border-[#EAE9E2] pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="font-display text-2xl font-normal leading-tight">{editAddress}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {editTransaction} · {editKind}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Uložit změny
                    </Button>
                  </div>
                </div>

                {/* Block 1: Společná pole */}
                <div className="space-y-4">
                  <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">Společná pole</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_owner">Vlastník *</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select value={editOwnerId} onValueChange={setEditOwnerId} required>
                            <SelectTrigger id="edit_owner">
                              <SelectValue placeholder="Vyberte vlastníka" />
                            </SelectTrigger>
                            <SelectContent>
                              {contacts.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedProperty.owner && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onNavigateToContact(selectedProperty.owner_id)}
                            title="Otevřít kartu vlastníka"
                            className="border-stone-300"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_address">Přesná adresa *</Label>
                      <Input
                        id="edit_address"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="edit_price">Cena / Měsíční nájem *</Label>
                      <div className="relative">
                        <Input
                          id="edit_price"
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">Kč</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_kind">Druh nemovitosti *</Label>
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
                      <Label htmlFor="edit_transaction">Transakce *</Label>
                      <Select
                        value={editTransaction}
                        onValueChange={(val: Property['transaction']) => setEditTransaction(val)}
                        required
                      >
                        <SelectTrigger id="edit_transaction">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit_status">Stav nabídky *</Label>
                      <Select
                        value={editOfferStatus}
                        onValueChange={(val: Property['offer_status']) => setEditOfferStatus(val)}
                        required
                      >
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

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_handover">Možný termín předání</Label>
                      <Input
                        id="edit_handover"
                        value={editHandover}
                        onChange={(e) => setEditHandover(e.target.value)}
                        placeholder="např. Ihned, dohodou"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_listing">ID inzerátu</Label>
                      <Input
                        id="edit_listing"
                        value={editListingId}
                        onChange={(e) => setEditListingId(e.target.value)}
                        placeholder="např. 123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_facts">Co je v ceně / fakta pro odpovědi AI</Label>
                    <Textarea
                      id="edit_facts"
                      rows={3}
                      value={editFacts}
                      onChange={(e) => setEditFacts(e.target.value)}
                      placeholder="např. Kuchyňská linka včetně myčky a lednice, parkovací stání č. 14..."
                    />
                  </div>
                </div>

                {/* Block 2: Conditional blocks */}
                {/* 2.1 BYT SPECIFIC */}
                {editKind === 'byt' && (
                  <div className="border-t border-[#EAE9E2] pt-5 space-y-4">
                    <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">Specifická pole pro BYT</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flat_layout">Dispozice *</Label>
                        <Select value={flatLayout} onValueChange={setFlatLayout}>
                          <SelectTrigger id="flat_layout">
                            <SelectValue placeholder="Vyberte dispozici" />
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

                      <div className="space-y-1.5 col-span-2">
                        <Label htmlFor="flat_area">Užitná plocha (m²) *</Label>
                        <Input
                          id="flat_area"
                          type="number"
                          value={flatArea}
                          onChange={(e) => setFlatArea(e.target.value)}
                          placeholder="výměra"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flat_floor">Patro / z pater</Label>
                        <Input
                          id="flat_floor"
                          value={flatFloor}
                          onChange={(e) => setFlatFloor(e.target.value)}
                          placeholder="např. 3/5"
                        />
                      </div>

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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <Label>Vybavení / vlastnosti bytu</Label>
                        <div className="flex flex-wrap gap-4 pt-1">
                          {FLAT_FEATURE_OPTIONS.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={flatFeatures?.includes(opt) || false}
                                onChange={() => handleFlatFeatureToggle(opt)}
                                className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flat_penb">Energetický štítek (PENB)</Label>
                        <Select value={flatPenb} onValueChange={setFlatPenb}>
                          <SelectTrigger id="flat_penb">
                            <SelectValue placeholder="Vyberte třídu" />
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
                  </div>
                )}

                {/* 2.2 DŮM SPECIFIC */}
                {editKind === 'dům' && (
                  <div className="border-t border-[#EAE9E2] pt-5 space-y-4">
                    <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">Specifická pole pro DŮM</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="house_layout">Dispozice / místnosti *</Label>
                        <Select value={houseLayout} onValueChange={setHouseLayout}>
                          <SelectTrigger id="house_layout">
                            <SelectValue placeholder="Vyberte dispozici" />
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
                          placeholder="výměra domu"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_area">Plocha pozemku (m²) *</Label>
                        <Input
                          id="land_area"
                          type="number"
                          value={landArea}
                          onChange={(e) => setLandArea(e.target.value)}
                          placeholder="výměra pozemku"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          placeholder="podlaží"
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
                        <Label htmlFor="house_penb">Energetická náročnost (PENB)</Label>
                        <Select value={housePenb} onValueChange={setHousePenb}>
                          <SelectTrigger id="house_penb">
                            <SelectValue placeholder="Vyberte" />
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
                      <Label>Vybavení / vlastnosti domu</Label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {HOUSE_FEATURE_OPTIONS.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={houseFeatures?.includes(opt) || false}
                              onChange={() => handleHouseFeatureToggle(opt)}
                              className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Block 3: Interested Deals list */}
                <div className="border-t border-[#EAE9E2] pt-5 space-y-3">
                  <h3 className="font-display text-base font-semibold text-[#141414] dark:text-stone-300">
                    Zájemci o tuto nemovitost
                  </h3>
                  {interestedDeals.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Žádné aktivní obchody k této nemovitosti.</p>
                  ) : (
                    <div className="grid gap-2 max-w-xl">
                      {interestedDeals.map((deal) => (
                        <div
                          key={deal.id}
                          onClick={() => onNavigateToDeal(deal.id)}
                          className="p-3 border border-stone-200 hover:border-primary cursor-pointer rounded-sm bg-stone-50/50 flex justify-between items-center text-xs font-medium transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-stone-500" />
                            <span>{deal.deal_name}</span>
                            {deal.buyer && <span className="text-muted-foreground font-normal">({deal.buyer.full_name})</span>}
                          </div>
                          <div className="flex gap-2 items-center">
                            {deal.temperature && (
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm">
                                {deal.temperature}
                              </span>
                            )}
                            <span className="text-[10px] text-primary bg-[#F3F2EC] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                              {deal.stage}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center">
            <Home className="h-10 w-10 text-muted-foreground/60 stroke-[1.25] mb-3" />
            <CardTitle className="text-lg font-display font-normal">Vyberte nemovitost</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Vyberte nemovitost z levého panelu nebo přidejte novou.
            </CardDescription>
          </Card>
        )}
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg border-[#EAE9E2]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">Přidat nemovitost</DialogTitle>
            <DialogDescription>
              Zadejte základní údaje. Specifické dispozice (flat/house) vyplníte na kartě po vytvoření.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new_owner">Vlastník (Vyberte z kontaktů) *</Label>
              <Select value={newOwnerId} onValueChange={setNewOwnerId} required>
                <SelectTrigger id="new_owner">
                  <SelectValue placeholder="Vyberte vlastníka" />
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
                placeholder="Fakta sloužící pro budoucí AI odpovědi..."
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
