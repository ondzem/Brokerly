import React, { useState, useEffect } from 'react';
import { Property, Contact, Deal } from '@/types';
import { createProperty, updateProperty, createContact, deleteProperty } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, Home, User, Briefcase, DollarSign, MapPin, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

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

const parseSafeNumber = (val: string | number | null | undefined): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  const cleanStr = val.toString().replace(/[^0-9]/g, '');
  if (!cleanStr) return null;
  const num = Number(cleanStr);
  return isNaN(num) ? null : num;
};

interface PropertiesViewProps {
  properties: Property[];
  contacts: Contact[];
  deals: Deal[];
  initialSelectedPropertyId?: string;
  onClearFocusProperty?: () => void;
  onRefresh: () => void;
  onNavigateToContact: (contactId: string) => void;
  onNavigateToDeal: (dealId: string) => void;
  theme?: 'light' | 'dark';
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  contacts,
  deals,
  initialSelectedPropertyId,
  onClearFocusProperty,
  onRefresh,
  onNavigateToContact,
  onNavigateToDeal,
  theme = 'light',
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'vše' | 'prodej' | 'pronájem'>('vše');
  const [kindFilter, setKindFilter] = useState<'vše' | 'byt' | 'dům' | 'pozemek' | 'komerční'>('vše');
  const [statusFilter, setStatusFilter] = useState<'vše' | 'v nabídce' | 'rezervováno' | 'akvizice' | 'uzavřeno'>('vše');
  const [isMobileFiltersExpanded, setIsMobileFiltersExpanded] = useState(false);

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

  // AI Import states
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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

  // Pozemek specific states
  const [landSize, setLandSize] = useState('');
  const [landType, setLandType] = useState('');
  const [landUtilities, setLandUtilities] = useState('');
  const [zoningPlan, setZoningPlan] = useState('');
  const [landAccess, setLandAccess] = useState('');
  const [landDimensions, setLandDimensions] = useState('');

  // Pronájem, Provize and Photo states
  const [rentDeposit, setRentDeposit] = useState('');
  const [rentFeesUtilities, setRentFeesUtilities] = useState('');
  const [commissionPct, setCommissionPct] = useState('');
  const [commissionVal, setCommissionVal] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

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

      // Pozemek specific
      setLandSize(selectedProperty.land_size ? selectedProperty.land_size.toString() : '');
      setLandType(selectedProperty.land_type || '');
      setLandUtilities(selectedProperty.land_utilities ? selectedProperty.land_utilities.join(', ') : '');
      setZoningPlan(selectedProperty.zoning_plan || '');
      setLandAccess(selectedProperty.land_access || '');
      setLandDimensions(selectedProperty.land_dimensions || '');

      // Rent, Commission, and Photo
      setRentDeposit(selectedProperty.rent_deposit ? selectedProperty.rent_deposit.toString() : '');
      setRentFeesUtilities(selectedProperty.rent_fees_utilities ? selectedProperty.rent_fees_utilities.toString() : '');
      setCommissionPct(selectedProperty.commission_pct ? selectedProperty.commission_pct.toString() : '');
      setCommissionVal(selectedProperty.commission_val ? selectedProperty.commission_val.toString() : '');
      setPhotoUrl(selectedProperty.attachments?.[0] || '');
    }
  }, [selectedProperty]);

  // Helper to find matching buyers for a property
  const getMatchingBuyersForProperty = (p: Property) => {
    return contacts.filter((c) => {
      // 1. Role must include kupující
      if (!c.roles || !c.roles.includes('kupující')) return false;

      // 2. Transaction must match
      if (c.seeking_transaction && c.seeking_transaction !== p.transaction) return false;

      // 3. Kind must match if specified
      if (c.seeking_kind && c.seeking_kind.length > 0 && !c.seeking_kind.includes(p.kind as any)) return false;

      // 4. Layout must match if specified
      const checkLayoutMatch = (seeking: string[], propLayout: string) => {
        return seeking.some((s) => {
          if (s === propLayout) return true;
          if (s === '4+ a více') {
            return propLayout === '4+kk' || propLayout === '4+1' || propLayout === '5 a více' || propLayout === '6 a více';
          }
          return false;
        });
      };

      if (p.kind === 'byt' && p.flat_layout && c.seeking_layout && c.seeking_layout.length > 0) {
        if (!checkLayoutMatch(c.seeking_layout, p.flat_layout)) return false;
      }
      if (p.kind === 'dům' && p.house_layout && c.seeking_layout && c.seeking_layout.length > 0) {
        if (!checkLayoutMatch(c.seeking_layout, p.house_layout)) return false;
      }

      // 5. Budget must match (price <= budget_to)
      if (c.budget_to && p.price > c.budget_to) return false;

      return true;
    });
  };

  // Search and advanced filters
  const filteredProperties = properties.filter((p) => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.address.toLowerCase().includes(q) ||
        p.kind.toLowerCase().includes(q) ||
        p.transaction.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Transaction filter
    if (transactionFilter !== 'vše' && p.transaction !== transactionFilter) {
      return false;
    }

    // Kind filter
    if (kindFilter !== 'vše' && p.kind !== kindFilter) {
      return false;
    }

    // Status filter (Note: 'Prodáno' filter maps to 'uzavřeno' in the DB)
    if (statusFilter !== 'vše') {
      if (p.offer_status !== statusFilter) {
        return false;
      }
    }

    return true;
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
      const parsedPrice = parseSafeNumber(editPrice);
      if (parsedPrice === null) {
        toast.error('Cena musí být platné číslo.');
        return;
      }

      const updateData: Partial<Property> = {
        owner_id: editOwnerId,
        kind: editKind,
        transaction: editTransaction,
        address: editAddress,
        offer_status: editOfferStatus,
        price: parsedPrice,
        facts_for_answers: editFacts || null,
        handover_term: editHandover || null,
        listing_id: editListingId || null,
        
        // Byt details
        flat_layout: editKind === 'byt' ? (flatLayout as Property['flat_layout']) : null,
        flat_area: editKind === 'byt' && flatArea ? parseSafeNumber(flatArea) : null,
        floor: editKind === 'byt' ? flatFloor || null : null,
        ownership: editKind === 'byt' ? (flatOwnership as Property['ownership']) || null : null,
        construction: editKind === 'byt' ? (flatConstruction as Property['construction']) || null : null,
        flat_condition: editKind === 'byt' ? (flatCondition as Property['flat_condition']) || null : null,
        flat_features: editKind === 'byt' ? flatFeatures : null,
        flat_penb: editKind === 'byt' ? (flatPenb as Property['flat_penb']) || null : null,

        // Dům details
        house_layout: editKind === 'dům' ? (houseLayout as Property['house_layout']) : null,
        house_area: editKind === 'dům' && houseArea ? parseSafeNumber(houseArea) : null,
        land_area: editKind === 'dům' && landArea ? parseSafeNumber(landArea) : null,
        house_type: editKind === 'dům' ? (houseType as Property['house_type']) || null : null,
        floors_count: editKind === 'dům' && houseFloors ? parseSafeNumber(houseFloors) : null,
        house_features: editKind === 'dům' ? houseFeatures : null,
        house_condition: editKind === 'dům' ? (houseCondition as Property['house_condition']) || null : null,
        house_penb: editKind === 'dům' ? (housePenb as Property['house_penb']) || null : null,

        // Pozemek details
        land_size: editKind === 'pozemek' && landSize ? parseSafeNumber(landSize) : null,
        land_type: editKind === 'pozemek' ? landType || null : null,
        land_utilities: editKind === 'pozemek' && landUtilities ? landUtilities.split(',').map((s) => s.trim()).filter(Boolean) : null,
        zoning_plan: editKind === 'pozemek' ? zoningPlan || null : null,
        land_access: editKind === 'pozemek' ? landAccess || null : null,
        land_dimensions: editKind === 'pozemek' ? landDimensions || null : null,

        // Rent, Commission, and Photo
        rent_deposit: editTransaction === 'pronájem' ? parseSafeNumber(rentDeposit) : null,
        rent_fees_utilities: editTransaction === 'pronájem' ? parseSafeNumber(rentFeesUtilities) : null,
        commission_pct: parseSafeNumber(commissionPct),
        commission_val: parseSafeNumber(commissionVal),
        attachments: photoUrl ? [photoUrl] : null,
      };

      const updated = await updateProperty(selectedProperty.id, updateData);
      toast.success('Nemovitost byla úspěšně uložena.');
      setSelectedProperty(updated);
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`Chyba při ukládání nemovitosti: ${error?.message || error}`);
    }
  };

  const handleDeletePropertyClick = () => {
    setIsConfirmDeleteOpen(true);
  };

  const executeDeleteProperty = async () => {
    if (!selectedProperty) return;
    setIsConfirmDeleteOpen(false);

    try {
      await deleteProperty(selectedProperty.id);
      toast.success('Nemovitost byla úspěšně smazána.');
      setIsDetailOpen(false);
      setSelectedProperty(null);
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`Chyba při mazání nemovitosti: ${error?.message || error}`);
    }
  };
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

    if (newKind === 'byt' && (!flatLayout || !flatArea)) {
      toast.error('Pro druh "byt" jsou Dispozice a Užitná plocha povinné.');
      return;
    }
    if (newKind === 'dům' && (!houseLayout || !houseArea || !landArea)) {
      toast.error('Pro druh "dům" jsou Dispozice, Užitná plocha a Plocha pozemku povinné.');
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

      const parsedPrice = parseSafeNumber(newPrice);
      if (parsedPrice === null) {
        toast.error('Cena musí být platné číslo.');
        return;
      }

      const created = await createProperty({
        owner_id: finalOwnerId,
        kind: newKind,
        transaction: newTransaction,
        address: newAddress,
        offer_status: newOfferStatus,
        price: parsedPrice,
        facts_for_answers: newFacts || null,
        handover_term: newHandover || null,
        listing_id: newListingId || null,
        attachments: photoUrl ? [photoUrl] : null,
        
        // Byt details
        flat_layout: newKind === 'byt' ? (flatLayout as Property['flat_layout']) : null,
        flat_area: newKind === 'byt' && flatArea ? parseSafeNumber(flatArea) : null,
        floor: newKind === 'byt' ? flatFloor || null : null,
        ownership: newKind === 'byt' ? (flatOwnership as Property['ownership']) || null : null,
        construction: newKind === 'byt' ? (flatConstruction as Property['construction']) || null : null,
        flat_condition: newKind === 'byt' ? (flatCondition as Property['flat_condition']) || null : null,
        flat_features: newKind === 'byt' ? flatFeatures : null,
        flat_penb: newKind === 'byt' ? (flatPenb as Property['flat_penb']) || null : null,

        // Dům details
        house_layout: newKind === 'dům' ? (houseLayout as Property['house_layout']) : null,
        house_area: newKind === 'dům' && houseArea ? parseSafeNumber(houseArea) : null,
        land_area: newKind === 'dům' && landArea ? parseSafeNumber(landArea) : null,
        house_type: newKind === 'dům' ? (houseType as Property['house_type']) || null : null,
        floors_count: newKind === 'dům' && houseFloors ? parseSafeNumber(houseFloors) : null,
        house_features: newKind === 'dům' ? houseFeatures : null,
        house_condition: newKind === 'dům' ? (houseCondition as Property['house_condition']) || null : null,
        house_penb: newKind === 'dům' ? (housePenb as Property['house_penb']) || null : null,

        // Pozemek details
        land_size: newKind === 'pozemek' && landSize ? parseSafeNumber(landSize) : null,
        land_type: newKind === 'pozemek' ? landType || null : null,
        land_utilities: newKind === 'pozemek' && landUtilities ? landUtilities.split(',').map(s => s.trim()).filter(Boolean) : null,
        zoning_plan: newKind === 'pozemek' ? zoningPlan || null : null,
        land_access: newKind === 'pozemek' ? landAccess || null : null,
        land_dimensions: newKind === 'pozemek' ? landDimensions || null : null,

        comm_subtype: null,
        comm_floor_area: null,
        comm_condition_equipment: null,
        comm_parking_entrance: null,
        comm_penb: null,
        rent_deposit: newTransaction === 'pronájem' ? parseSafeNumber(rentDeposit) : null,
        rent_fees_utilities: newTransaction === 'pronájem' ? parseSafeNumber(rentFeesUtilities) : null,
        rent_duration: null,
        rent_available_from: null,
        rent_equipment: null,
        commission_pct: parseSafeNumber(commissionPct),
        commission_val: parseSafeNumber(commissionVal),
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

      // Reset specific details
      setFlatLayout('');
      setFlatArea('');
      setFlatFloor('');
      setFlatOwnership('');
      setFlatConstruction('');
      setFlatCondition('');
      setFlatFeatures([]);
      setFlatPenb('');
      setHouseLayout('');
      setHouseArea('');
      setLandArea('');
      setHouseType('');
      setHouseFloors('');
      setHouseFeatures([]);
      setHouseCondition('');
      setHousePenb('');
      setLandSize('');
      setLandType('');
      setLandUtilities('');
      setZoningPlan('');
      setLandAccess('');
      setLandDimensions('');

      // Reset Pronájem, Provize and Photo states
      setRentDeposit('');
      setRentFeesUtilities('');
      setCommissionPct('');
      setCommissionVal('');
      setPhotoUrl('');
    } catch (error: any) {
      console.error(error);
      toast.error(`Chyba při zakládání nemovitosti: ${error?.message || error}`);
    }
  };

  const handleImportFromUrl = async () => {
    if (!importUrl) {
      toast.error('Zadejte prosím platný odkaz na inzerát.');
      return;
    }

    // Automatically normalize URL: prepend https:// if missing
    let normalizedUrl = importUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const geminiKey = import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const scraperKey = import.meta.env.NEXT_PUBLIC_SCRAPER_API_KEY || '';

    if (!geminiKey || !scraperKey) {
      toast.error('Chybí API klíče. Nastavte NEXT_PUBLIC_GEMINI_API_KEY a NEXT_PUBLIC_SCRAPER_API_KEY v .env.local a restartujte aplikaci.');
      return;
    }

    setIsImporting(true);
    
    // Use clear separate toasts to avoid sonner-specific updating bugs
    const toastId = toast.loading('1/2: Stahuji inzerát přes proxy...');

    try {
      // 1. Download via local Vite development proxy (bypasses CORS completely and forwards consent cookies)
      const scraperUrl = `/api-scraper?api_key=${encodeURIComponent(scraperKey)}&url=${encodeURIComponent(normalizedUrl)}&keep_headers=true`;
      const response = await fetch(scraperUrl);
      const html = await response.text();

      // Check if HTML content exists and is valid. We check html.length instead of response.ok
      // because already sold or archived properties return a 410 or 404 status code but still contain the full HTML page.
      if (!html || html.length < 500) {
        throw new Error('Chyba při stahování stránky. Ověřte Váš API klíč pro ScraperAPI nebo platnost URL.');
      }

      // Dismiss first toast and start second stage toast
      toast.dismiss(toastId);
      const toastId2 = toast.loading('2/2: Analyzuji text inzerátu pomocí AI...');

      // 2. Parse HTML, extract image, and clean up text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract first suitable listing image from HTML DOM
      let foundPhotoUrl = '';
      const imgElements = Array.from(doc.querySelectorAll('img'));
      for (const img of imgElements) {
        const src = img.getAttribute('src') || '';
        // Skip tiny icons, tracking pixels, or base64
        if (src.startsWith('data:') || src.includes('icon') || src.includes('logo') || src.includes('pixel') || src.includes('spinner')) {
          continue;
        }
        if (src.includes('img.sreality.cz') || src.includes('remax') || src.includes('bezrealitky') || src.includes('http')) {
          foundPhotoUrl = src;
          // Prepend protocol or domain if relative
          if (foundPhotoUrl.startsWith('//')) {
            foundPhotoUrl = 'https:' + foundPhotoUrl;
          } else if (foundPhotoUrl.startsWith('/')) {
            try {
              const urlObj = new URL(normalizedUrl);
              foundPhotoUrl = urlObj.origin + foundPhotoUrl;
            } catch (e) {}
          }
          break;
        }
      }

      doc.querySelectorAll('script, style, header, footer, nav, noscript, iframe, svg').forEach((el) => el.remove());
      const text = doc.body.innerText || doc.body.textContent || '';
      const cleanText = text.replace(/\s+/g, ' ').substring(0, 15000).trim();

      if (cleanText.length < 100) {
        toast.dismiss(toastId2);
        throw new Error('Nepodařilo se stáhnout obsah stránky (stránka vrátila prázdný text nebo byla zablokována).');
      }

      // 3. Call Gemini Structured Outputs API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const geminiPayload = {
        contents: [
          {
            parts: [
              {
                text: `Analyzuj následující text inzerátu realitní nemovitosti a vytáhni z něj parametry pro databázi. \nText inzerátu:\n"""\n${cleanText}\n"""`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              address: { type: "STRING", description: "Přesná adresa nemovitosti nebo lokalita, např. Bory, Plzeň" },
              kind: { type: "STRING", enum: ["byt", "dům", "pozemek", "komerční", "garáž/ostatní"] },
              transaction: { type: "STRING", enum: ["prodej", "pronájem"] },
              price: { type: "NUMBER", description: "Cena nebo nájemné jako číslo v Kč" },
              flat_layout: { type: "STRING", enum: ["1+kk", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1", "5 a více"] },
              flat_area: { type: "NUMBER", description: "Užitná plocha bytu v m2" },
              floor: { type: "STRING", description: "Patro z pater, např. '3. ze 5'" },
              ownership: { type: "STRING", enum: ["osobní", "družstevní", "SVJ"] },
              construction: { type: "STRING", enum: ["cihla", "panel", "jiné"] },
              flat_condition: { type: "STRING", enum: ["novostavba", "po rekonstrukci", "dobrý", "před rekonstrukcí"] },
              flat_penb: { type: "STRING", enum: ["A", "B", "C", "D", "E", "F", "G"] },
              flat_features: {
                type: "ARRAY",
                items: { type: "STRING", enum: ["výtah", "balkon/lodžie", "terasa", "sklep"] }
              },
              house_layout: { type: "STRING", enum: ["2+kk", "3+kk", "4+kk", "5+kk", "6 a více"] },
              house_area: { type: "NUMBER", description: "Užitná plocha domu v m2" },
              land_area: { type: "NUMBER", description: "Plocha pozemku v m2" },
              house_type: { type: "STRING", enum: ["samostatný", "řadový", "dvojdomek"] },
              floors_count: { type: "NUMBER", description: "Počet podlaží domu" },
              house_features: {
                type: "ARRAY",
                items: { type: "STRING", enum: ["garáž", "zahrada", "bazén"] }
              },
              house_condition: { type: "STRING", enum: ["novostavba", "po rekonstrukci", "dobrý", "před rekonstrukcí"] },
              house_penb: { type: "STRING", enum: ["A", "B", "C", "D", "E", "F", "G"] },
              land_size: { type: "NUMBER", description: "Výměra pozemku v m2" },
              land_type: { type: "STRING", description: "Druh pozemku, např. stavební, les, orná půda" },
              land_utilities: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Seznam inženýrských sítí, např. ['voda', 'elektřina']"
              },
              zoning_plan: { type: "STRING", description: "Info z územního plánu" },
              land_access: { type: "STRING", description: "Přístup k pozemku" },
              land_dimensions: { type: "STRING", description: "Rozměry pozemku" },
              rent_deposit: { type: "NUMBER", description: "Vratná kauce (jistota) v Kč, pokud jde o pronájem" },
              rent_fees_utilities: { type: "NUMBER", description: "Měsíční poplatky za služby a energie v Kč, pokud jde o pronájem" },
              commission_pct: { type: "NUMBER", description: "Provize makléře / RK v procentech (např. 3)" },
              commission_val: { type: "NUMBER", description: "Provize makléře / RK v Kč (např. 150000)" },
              facts_for_answers: { type: "STRING", description: "Jakékoli další důležité poznámky k nemovitosti" }
            }
          }
        }
      };

      // Set DOM photo URL state immediately
      if (foundPhotoUrl) {
        setPhotoUrl(foundPhotoUrl);
      }

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiPayload)
      });

      toast.dismiss(toastId2);

      if (!geminiRes.ok) {
        throw new Error('Chyba při komunikaci s Gemini API (překročen limit nebo neaktivní klíč).');
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Z Gemini API nepřišla žádná strukturovaná data.');
      }

      const parsed = JSON.parse(rawText);

      // 4. Fill form states
      if (parsed.address) setNewAddress(parsed.address);
      if (parsed.kind) setNewKind(parsed.kind);
      if (parsed.transaction) setNewTransaction(parsed.transaction);
      if (parsed.price) setNewPrice(parsed.price.toString());
      if (parsed.facts_for_answers) setNewFacts(parsed.facts_for_answers);

      // Rent and Commission
      if (parsed.rent_deposit) setRentDeposit(parsed.rent_deposit.toString());
      if (parsed.rent_fees_utilities) setRentFeesUtilities(parsed.rent_fees_utilities.toString());
      if (parsed.commission_pct) setCommissionPct(parsed.commission_pct.toString());
      if (parsed.commission_val) setCommissionVal(parsed.commission_val.toString());

      // Byt specific
      if (parsed.flat_layout) setFlatLayout(parsed.flat_layout);
      if (parsed.flat_area) setFlatArea(parsed.flat_area.toString());
      if (parsed.floor) setFlatFloor(parsed.floor);
      if (parsed.ownership) setFlatOwnership(parsed.ownership);
      if (parsed.construction) setFlatConstruction(parsed.construction);
      if (parsed.flat_condition) setFlatCondition(parsed.flat_condition);
      if (parsed.flat_features) setFlatFeatures(parsed.flat_features);
      if (parsed.flat_penb) setFlatPenb(parsed.flat_penb);

      // Dům specific
      if (parsed.house_layout) setHouseLayout(parsed.house_layout);
      if (parsed.house_area) setHouseArea(parsed.house_area.toString());
      if (parsed.land_area) setLandArea(parsed.land_area.toString());
      if (parsed.house_type) setHouseType(parsed.house_type);
      if (parsed.floors_count) setHouseFloors(parsed.floors_count.toString());
      if (parsed.house_features) setHouseFeatures(parsed.house_features);
      if (parsed.house_condition) setHouseCondition(parsed.house_condition);
      if (parsed.house_penb) setHousePenb(parsed.house_penb);

      // Pozemek specific
      if (parsed.land_size) setLandSize(parsed.land_size.toString());
      if (parsed.land_type) setLandType(parsed.land_type);
      if (parsed.land_utilities) setLandUtilities(parsed.land_utilities.join(', '));
      if (parsed.zoning_plan) setZoningPlan(parsed.zoning_plan);
      if (parsed.land_access) setLandAccess(parsed.land_access);
      if (parsed.land_dimensions) setLandDimensions(parsed.land_dimensions);

      toast.success('Inzerát byl úspěšně načten a data byla doplněna!');
      setImportUrl('');
    } catch (err: any) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(`Chyba importu: ${err.message || 'Nepodařilo se importovat data.'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenCreate = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    setNewListingId(randomId);
    setOwnerMode('select');
    setNewOwnerFullName('');
    setNewOwnerPhone('');
    setNewOwnerEmail('');
    setNewOwnerNote('');
    setNewOwnerId('');
    setNewAddress('');
    setNewPrice('');
    setNewFacts('');
    setNewHandover('');

    // Reset layout details
    setFlatLayout('');
    setFlatArea('');
    setFlatFloor('');
    setFlatOwnership('');
    setFlatConstruction('');
    setFlatCondition('');
    setFlatFeatures([]);
    setFlatPenb('');
    setHouseLayout('');
    setHouseArea('');
    setLandArea('');
    setHouseType('');
    setHouseFloors('');
    setHouseFeatures([]);
    setHouseCondition('');
    setHousePenb('');
    setLandSize('');
    setLandType('');
    setLandUtilities('');
    setZoningPlan('');
    setLandAccess('');
    setLandDimensions('');
    
    setIsCreateOpen(true);
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

  // Theme styling tokens
  const colors = theme === 'light' ? {
    bg: '#F2F1EC',
    textPrimary: '#0B1F1A',
    textSecondary: 'rgba(11,31,26,0.6)',
    textMuted: 'rgba(11,31,26,0.5)',
    cardBg: '#ffffff',
    cardBorder: 'border-[0.5px] border-stone-300/60 shadow-sm',
    accent: '#00D991',
    accentBg: '#DCF5E7',
    accentText: '#0B5C3D',
    grayBg: '#ECEBE6',
    grayText: '#55605C',
    propPlaceholderBg: '#E9E8E2',
    propPlaceholderStroke: 'rgba(11,31,26,0.2)',
  } : {
    bg: '#00221F',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(232,232,232,0.6)',
    textMuted: 'rgba(232,232,232,0.5)',
    cardBg: '#072C27',
    cardBorder: 'border-[0.5px] border-white/10 shadow-sm',
    accent: '#00D991',
    accentBg: 'rgba(0,217,145,0.13)',
    accentText: '#4FE0AC',
    grayBg: 'rgba(232,232,232,0.1)',
    grayText: '#C3CFCC',
    propPlaceholderBg: '#0B3833',
    propPlaceholderStroke: 'rgba(232,232,232,0.25)',
  };

  const totalCount = properties.length;
  const inOfferCount = properties.filter(p => p.offer_status === 'v nabídce').length;
  const reservedCount = properties.filter(p => p.offer_status === 'rezervováno').length;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header section (3C Design) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-light text-[26px] leading-tight" style={{ color: colors.textPrimary }}>
            Nemovitosti
          </h1>
          <span className="text-[13px]" style={{ color: colors.textSecondary }}>
            {totalCount} {totalCount === 1 ? 'nemovitost' : totalCount >= 2 && totalCount <= 4 ? 'nemovitosti' : 'nemovitostí'} · {inOfferCount} v nabídce · {reservedCount} {reservedCount === 1 ? 'rezervovaná' : reservedCount >= 2 && reservedCount <= 4 ? 'rezervované' : 'rezervovaných'}
          </span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 hover:opacity-90 font-medium text-[14px] px-4 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 w-full sm:w-auto flex-none shadow-xs"
          style={{ backgroundColor: colors.accent, color: '#00221F' }}
        >
          + Nová nemovitost
        </button>
      </div>

      {/* Search & View Mode Filters Bar (Desktop - 3C Design) */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        {/* Search */}
        <div 
          className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-full px-3.5 h-9 w-[180px] flex-none shadow-sm dark:bg-stone-900 dark:border-white/10"
        >
          <Search className="h-3.5 w-3.5" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Hledat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[12.5px] placeholder-stone-400 focus:ring-0 p-0 h-full"
            style={{ color: colors.textPrimary }}
          />
        </div>

        {/* Separator */}
        <div className="w-[0.5px] h-5 bg-stone-300 dark:bg-white/15 flex-none" />

        {/* Transaction Filters */}
        <button
          onClick={() => setTransactionFilter('vše')}
          className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-full transition-all duration-150 border flex-none cursor-pointer ${
            transactionFilter === 'vše'
              ? 'border-transparent shadow-xs'
              : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
          }`}
          style={{ 
            backgroundColor: transactionFilter === 'vše' ? colors.accent : undefined,
            color: transactionFilter === 'vše' ? '#00221F' : colors.textPrimary 
          }}
        >
          Vše
        </button>
        <button
          onClick={() => setTransactionFilter('prodej')}
          className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-full transition-all duration-150 border flex-none cursor-pointer ${
            transactionFilter === 'prodej'
              ? 'border-transparent shadow-xs'
              : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
          }`}
          style={{ 
            backgroundColor: transactionFilter === 'prodej' ? colors.accent : undefined,
            color: transactionFilter === 'prodej' ? '#00221F' : colors.textPrimary 
          }}
        >
          Prodej
        </button>
        <button
          onClick={() => setTransactionFilter('pronájem')}
          className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-full transition-all duration-150 border flex-none cursor-pointer ${
            transactionFilter === 'pronájem'
              ? 'border-transparent shadow-xs'
              : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
          }`}
          style={{ 
            backgroundColor: transactionFilter === 'pronájem' ? colors.accent : undefined,
            color: transactionFilter === 'pronájem' ? '#00221F' : colors.textPrimary 
          }}
        >
          Pronájem
        </button>

        {/* Separator */}
        <div className="w-[0.5px] h-5 bg-stone-300 dark:bg-white/15 flex-none" />

        {/* Kind Filters */}
        {(['byt', 'dům', 'pozemek', 'komerční'] as const).map((kind) => (
          <button
            key={kind}
            onClick={() => setKindFilter(kindFilter === kind ? 'vše' : kind)}
            className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-full transition-all duration-150 border capitalize flex-none cursor-pointer ${
              kindFilter === kind
                ? 'border-transparent shadow-xs'
                : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
            }`}
            style={{ 
              backgroundColor: kindFilter === kind ? colors.accent : undefined,
              color: kindFilter === kind ? '#00221F' : colors.textPrimary 
            }}
          >
            {kind}
          </button>
        ))}

        {/* Separator */}
        <div className="w-[0.5px] h-5 bg-stone-300 dark:bg-white/15 flex-none" />

        {/* Status Filters */}
        {([
          { id: 'v nabídce', label: 'V nabídce' },
          { id: 'rezervováno', label: 'Rezervováno' },
          { id: 'akvizice', label: 'Akvizice' },
          { id: 'uzavřeno', label: 'Prodáno' }
        ] as const).map((st) => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(statusFilter === st.id ? 'vše' : st.id)}
            className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-full transition-all duration-150 border flex-none cursor-pointer ${
              statusFilter === st.id
                ? 'border-transparent shadow-xs'
                : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
            }`}
            style={{ 
              backgroundColor: statusFilter === st.id ? colors.accent : undefined,
              color: statusFilter === st.id ? '#00221F' : colors.textPrimary 
            }}
          >
            {st.label}
          </button>
        ))}

        {/* View Mode controls / toggles */}
        <div className="ml-auto flex bg-[#ECEBE6] p-[3px] rounded-[10px] flex-none dark:bg-stone-850 h-9 items-center">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 h-[30px] flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Karty
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 h-[30px] flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Seznam
          </button>
        </div>
      </div>

      {/* Search & View Mode Filters Bar (Mobile - Collapsible Filter Drawer) */}
      <div className="flex md:hidden flex-col gap-3.5 w-full">
        {/* Row 1: Filters (Left) and View Switcher (Right) */}
        <div className="flex items-center justify-between w-full">
          {/* Toggle Filter Button */}
          <button
            onClick={() => setIsMobileFiltersExpanded(!isMobileFiltersExpanded)}
            className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-full border border-stone-250/70 bg-white dark:bg-stone-900 dark:border-white/10 font-medium text-[12.5px] shadow-sm cursor-pointer select-none"
            style={{ color: colors.textPrimary }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: isMobileFiltersExpanded ? colors.accent : colors.textMuted }} />
            <span>Filtry</span>
            {(transactionFilter !== 'vše' || kindFilter !== 'vše' || statusFilter !== 'vše') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D991]" />
            )}
          </button>

          {/* View Switcher */}
          <div className="flex bg-[#ECEBE6] p-[3px] rounded-[10px] flex-none dark:bg-stone-850 h-9 items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3.5 h-[30px] flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Karty
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 h-[30px] flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              Seznam
            </button>
          </div>
        </div>

        {/* Row 2: Full-width Search Input */}
        <div 
          className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-full px-3.5 h-9 w-full shadow-sm dark:bg-stone-900 dark:border-white/10"
        >
          <Search className="h-3.5 w-3.5" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Hledat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[12.5px] placeholder-stone-400 focus:ring-0 p-0 h-full"
            style={{ color: colors.textPrimary }}
          />
        </div>

        {/* Collapsible Mobile Options Box */}
        {isMobileFiltersExpanded && (
          <div 
            className="flex flex-col gap-4 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-150 shadow-xs"
            style={{ backgroundColor: colors.cardBg, borderColor: theme === 'light' ? 'rgba(11,31,26,0.1)' : 'rgba(255,255,255,0.08)' }}
          >
            {/* Transaction Group */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.textMuted }}>
                Transakce
              </div>
              <div className="flex flex-wrap gap-2">
                {(['vše', 'prodej', 'pronájem'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTransactionFilter(t)}
                    className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 border cursor-pointer ${
                      transactionFilter === t
                        ? 'border-transparent shadow-xs'
                        : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
                    }`}
                    style={{ 
                      backgroundColor: transactionFilter === t ? colors.accent : undefined,
                      color: transactionFilter === t ? '#00221F' : colors.textPrimary 
                    }}
                  >
                    {t === 'vše' ? 'Všechny' : t === 'prodej' ? 'Prodej' : 'Pronájem'}
                  </button>
                ))}
              </div>
            </div>

            {/* Kind Group */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.textMuted }}>
                Druh nemovitosti
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setKindFilter('vše')}
                  className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 border cursor-pointer ${
                    kindFilter === 'vše'
                      ? 'border-transparent shadow-xs'
                      : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
                  }`}
                  style={{ 
                    backgroundColor: kindFilter === 'vše' ? colors.accent : undefined,
                    color: kindFilter === 'vše' ? '#00221F' : colors.textPrimary 
                  }}
                >
                  Všechny
                </button>
                {(['byt', 'dům', 'pozemek', 'komerční'] as const).map((kind) => (
                  <button
                    key={kind}
                    onClick={() => setKindFilter(kind)}
                    className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 border capitalize cursor-pointer ${
                      kindFilter === kind
                        ? 'border-transparent shadow-xs'
                        : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
                    }`}
                    style={{ 
                      backgroundColor: kindFilter === kind ? colors.accent : undefined,
                      color: kindFilter === kind ? '#00221F' : colors.textPrimary 
                    }}
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Group */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.textMuted }}>
                Stav nabídky
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('vše')}
                  className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 border cursor-pointer ${
                    statusFilter === 'vše'
                      ? 'border-transparent shadow-xs'
                      : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
                  }`}
                  style={{ 
                    backgroundColor: statusFilter === 'vše' ? colors.accent : undefined,
                    color: statusFilter === 'vše' ? '#00221F' : colors.textPrimary 
                  }}
                >
                  Všechny
                </button>
                {([
                  { id: 'v nabídce', label: 'V nabídce' },
                  { id: 'rezervováno', label: 'Rezervováno' },
                  { id: 'akvizice', label: 'Akvizice' },
                  { id: 'uzavřeno', label: 'Prodáno' }
                ] as const).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 border cursor-pointer ${
                      statusFilter === st.id
                        ? 'border-transparent shadow-xs'
                        : 'bg-white border-stone-250/70 dark:bg-stone-900 dark:border-white/10 dark:text-white'
                    }`}
                    style={{ 
                      backgroundColor: statusFilter === st.id ? colors.accent : undefined,
                      color: statusFilter === st.id ? '#00221F' : colors.textPrimary 
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RENDER LIST OR CARDS */}
      {filteredProperties.length === 0 ? (
        /* Empty State (3E Design) */
        <div 
          className="border border-dashed rounded-xl py-18 px-10 flex flex-col items-center justify-center gap-2.5 text-center"
          style={{ borderColor: colors.propPlaceholderStroke, backgroundColor: 'transparent' }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.2" className="flex-none">
            <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z" />
            <path d="M9 4.8V3h2" strokeLinecap="round" />
          </svg>
          <div className="text-[16px] font-medium mt-1" style={{ color: colors.textPrimary }}>
            Zatím tu nic není. Přidej první nemovitost.
          </div>
          <div className="text-[13.5px] max-w-[380px] leading-relaxed" style={{ color: colors.textSecondary }}>
            Přidej první nemovitost a uvidíš u ní zájemce a fáze obchodu.
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 hover:opacity-90 font-medium text-[14px] px-4 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 flex-none mt-2.5 shadow-sm"
            style={{ backgroundColor: colors.accent, color: '#00221F' }}
          >
            + Nová nemovitost
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW - aspect-ratio: 16/10, 4 columns (3C Design) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[14px]">
          {filteredProperties.map((prop) => {
            const matchingBuyersCount = getMatchingBuyersForProperty(prop).length;
            const hasPhoto = prop.attachments && prop.attachments.length > 0 && prop.attachments[0];

            let displayTitle = '';
            if (prop.kind === 'byt') {
              displayTitle = `Byt ${prop.flat_layout || ''}`;
            } else if (prop.kind === 'dům') {
              displayTitle = `Dům ${prop.house_layout || ''}`;
            } else if (prop.kind === 'pozemek') {
              displayTitle = 'Pozemek';
            } else if (prop.kind === 'komerční') {
              displayTitle = 'Komerční';
            } else {
              displayTitle = 'Garáž/Ostatní';
            }

            const addressParts = prop.address.split(',');
            const streetPart = addressParts[0]?.trim() || '';
            const cityPart = addressParts[1]?.trim() || prop.address;

            // Details subtitle
            let detailsStr = streetPart;
            if (prop.kind === 'byt' && prop.flat_area) {
              detailsStr += ` · ${prop.flat_area} m²` + (prop.floor ? ` · ${prop.floor}. patro` : '');
            } else if (prop.kind === 'dům' && prop.house_area) {
              detailsStr += ` · ${prop.house_area} m²` + (prop.land_area ? ` · pozemek ${prop.land_area} m²` : '');
            } else if (prop.kind === 'pozemek' && prop.land_area) {
              detailsStr = `Stavební parcela · ${prop.land_area} m²`;
            } else if (prop.kind === 'komerční' && prop.flat_area) {
              detailsStr += ` · ${prop.flat_area} m²`;
            }

            // Price suffix
            const priceStr = prop.price.toLocaleString('cs-CZ') + (prop.transaction === 'pronájem' ? ' Kč/měs' : ' Kč');

            // Status colors
            let statusBg = colors.accent;
            let statusText = '#00221F';
            if (prop.offer_status === 'rezervováno') {
              statusBg = '#E8A13C';
            } else if (prop.offer_status === 'akvizice') {
              statusBg = theme === 'light' ? '#ffffff' : '#072C27';
              statusText = colors.textPrimary;
            } else if (prop.offer_status === 'uzavřeno') {
              statusBg = '#C9C8C2';
              statusText = '#0B1F1A';
            }

            return (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setIsDetailOpen(true);
                }}
                className={`rounded-xl overflow-hidden cursor-pointer hover:border-[#00D991]/60 hover:shadow-md transition-all duration-200 flex flex-col text-left group border ${colors.cardBorder}`}
                style={{ backgroundColor: colors.cardBg }}
              >
                {/* Visual Header Image Container (Aspect-Ratio 16/10) */}
                <div 
                  className="w-full aspect-[16/10] overflow-hidden relative flex items-center justify-center border-b select-none"
                  style={{ backgroundColor: colors.propPlaceholderBg, borderColor: theme === 'light' ? 'rgba(11,31,26,0.08)' : 'rgba(255,255,255,0.05)' }}
                >
                  {hasPhoto ? (
                    <img 
                      src={prop.attachments?.[0] || ''} 
                      alt={displayTitle} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.propPlaceholderStroke} strokeWidth="1.4" className="opacity-70 group-hover:scale-105 transition-transform duration-200">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z" />
                    </svg>
                  )}

                  {/* Overlaid Badges */}
                  <span className="absolute top-2.5 left-2.5 bg-[#00221F] text-white text-[11px] font-medium px-2 py-0.5 rounded-[5px] uppercase tracking-wider select-none shadow-xs">
                    {prop.transaction}
                  </span>
                  <span 
                    className="absolute top-2.5 right-2.5 text-[11px] font-medium px-2 py-0.5 rounded-[5px] uppercase tracking-wider select-none border shadow-xs"
                    style={{ 
                      backgroundColor: statusBg, 
                      color: statusText,
                      borderColor: prop.offer_status === 'akvizice' ? (theme === 'light' ? 'rgba(11,31,26,0.25)' : 'rgba(255,255,255,0.15)') : 'transparent'
                    }}
                  >
                    {prop.offer_status === 'uzavřeno' ? 'Prodáno' : prop.offer_status}
                  </span>
                </div>

                {/* Card Body Info */}
                <div className="p-3.5 pb-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-1">
                    <div className="font-semibold text-[15px] truncate" style={{ color: colors.textPrimary }}>
                      {displayTitle}
                    </div>
                    <div className="font-semibold text-[18px] tracking-tight font-sans mt-0.5" style={{ color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                      {priceStr}
                    </div>
                    <div className="text-[13.5px] mt-2 truncate" style={{ color: colors.textPrimary }}>
                      {cityPart}
                    </div>
                    <div className="text-[12px] mt-1 truncate" style={{ color: colors.textSecondary }} title={detailsStr}>
                      {detailsStr || 'Bez popisu'}
                    </div>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div 
                  className="flex justify-between items-center py-2 px-3.5 border-t"
                  style={{ borderColor: theme === 'light' ? 'rgba(11,31,26,0.08)' : 'rgba(255,255,255,0.05)' }}
                >
                  <span 
                    className="text-[12px] font-medium px-2 py-0.5 rounded-[6px] transition-colors select-none"
                    style={{ 
                      backgroundColor: colors.grayBg, 
                      color: matchingBuyersCount > 0 ? colors.textPrimary : colors.textMuted 
                    }}
                  >
                    {matchingBuyersCount > 0 
                      ? `${matchingBuyersCount} ${matchingBuyersCount === 1 ? 'zájemce' : matchingBuyersCount >= 2 && matchingBuyersCount <= 4 ? 'zájemci' : 'zájemců'}` 
                      : 'Bez zájemců'}
                  </span>
                  <span className="text-[12.5px] font-medium flex items-center hover:underline cursor-pointer" style={{ color: '#0E8A5F' }}>
                    Detail →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        /* TABLE LIST VIEW (Desktop table, Mobile stacked list) */
        <div>
          {/* Desktop Table View */}
          <div 
            className="hidden md:block overflow-x-auto rounded-xl border shadow-sm"
            style={{ backgroundColor: colors.cardBg, borderColor: theme === 'light' ? 'rgba(11,31,26,0.12)' : 'rgba(255,255,255,0.1)' }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr 
                  className="border-b text-[10.5px] uppercase font-bold tracking-wider"
                  style={{ 
                    color: colors.textMuted,
                    borderColor: theme === 'light' ? 'rgba(11,31,26,0.08)' : 'rgba(255,255,255,0.05)',
                    backgroundColor: theme === 'light' ? '#F9F8F6' : '#052320'
                  }}
                >
                  <th className="py-3 px-4">Adresa</th>
                  <th className="py-3 px-4">Druh</th>
                  <th className="py-3 px-4">Transakce</th>
                  <th className="py-3 px-4 text-right">Cena</th>
                  <th className="py-3 px-4 text-center">Stav</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody 
                className="divide-y text-[13px]"
                style={{ 
                  color: colors.textPrimary,
                  borderColor: theme === 'light' ? 'rgba(11,31,26,0.08)' : 'rgba(255,255,255,0.05)'
                }}
              >
                {filteredProperties.map((prop) => {
                  const count = getMatchingBuyersForProperty(prop).length;
                  const priceStr = prop.price.toLocaleString('cs-CZ') + (prop.transaction === 'pronájem' ? ' Kč/měs' : ' Kč');
                  let displayTitle = '';
                  if (prop.kind === 'byt') {
                    displayTitle = `Byt ${prop.flat_layout || ''}`;
                  } else if (prop.kind === 'dům') {
                    displayTitle = `Dům ${prop.house_layout || ''}`;
                  } else if (prop.kind === 'pozemek') {
                    displayTitle = 'Pozemek';
                  } else if (prop.kind === 'komerční') {
                    displayTitle = 'Komerční';
                  } else {
                    displayTitle = 'Garáž/Ostatní';
                  }
                  return (
                    <tr
                      key={prop.id}
                      onClick={() => {
                        setSelectedProperty(prop);
                        setIsDetailOpen(true);
                      }}
                      className="hover:bg-stone-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium truncate max-w-[280px]">
                        {prop.address}
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        {displayTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[9px] font-bold bg-[#00221F] text-white px-2 py-0.5 rounded-[4px]">
                          {prop.transaction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {priceStr}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-[4px] uppercase tracking-wider"
                              style={{
                                backgroundColor: prop.offer_status === 'v nabídce' ? colors.accentBg : prop.offer_status === 'rezervováno' ? '#FBEED8' : colors.grayBg,
                                color: prop.offer_status === 'v nabídce' ? colors.accentText : prop.offer_status === 'rezervováno' ? '#8A5A16' : colors.textPrimary
                              }}>
                          {prop.offer_status === 'uzavřeno' ? 'Prodáno' : prop.offer_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[12.5px] font-medium hover:underline" style={{ color: '#0E8A5F' }}>
                          Detail →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked List View */}
          <div className="block md:hidden space-y-3">
            {filteredProperties.map((prop) => {
              const priceStr = prop.price.toLocaleString('cs-CZ') + (prop.transaction === 'pronájem' ? ' Kč/měs' : ' Kč');
              let displayTitle = '';
              if (prop.kind === 'byt') {
                displayTitle = `Byt ${prop.flat_layout || ''}`;
              } else if (prop.kind === 'dům') {
                displayTitle = `Dům ${prop.house_layout || ''}`;
              } else if (prop.kind === 'pozemek') {
                displayTitle = 'Pozemek';
              } else if (prop.kind === 'komerční') {
                displayTitle = 'Komerční';
              } else {
                displayTitle = 'Garáž/Ostatní';
              }

              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedProperty(prop);
                    setIsDetailOpen(true);
                  }}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 shadow-xs cursor-pointer hover:border-[#00D991]/50 transition-all ${colors.cardBorder}`}
                  style={{ backgroundColor: colors.cardBg }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-[14.5px] truncate max-w-[70%]" style={{ color: colors.textPrimary }}>
                      {prop.address}
                    </div>
                    <span 
                      className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] uppercase tracking-wider flex-none"
                      style={{
                        backgroundColor: prop.offer_status === 'v nabídce' ? colors.accentBg : prop.offer_status === 'rezervováno' ? '#FBEED8' : colors.grayBg,
                        color: prop.offer_status === 'v nabídce' ? colors.accentText : prop.offer_status === 'rezervováno' ? '#8A5A16' : colors.textPrimary
                      }}
                    >
                      {prop.offer_status === 'uzavřeno' ? 'Prodáno' : prop.offer_status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-[9px] font-bold bg-[#00221F] text-white px-2 py-0.5 rounded-[4px]">
                        {prop.transaction}
                      </span>
                      <span className="capitalize" style={{ color: colors.textSecondary }}>
                        {displayTitle}
                      </span>
                    </div>
                    <div className="font-semibold" style={{ color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                      {priceStr}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t" style={{ borderColor: theme === 'light' ? 'rgba(11,31,26,0.06)' : 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[12.5px] font-medium hover:underline flex items-center gap-1" style={{ color: '#0E8A5F' }}>
                      Detail nemovitosti →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL DIALOG */}
      {selectedProperty && (
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) onClearFocusProperty?.();
        }}>
          <DialogContent className="max-w-6xl lg:max-w-7xl w-[90vw] md:w-[92vw] lg:w-full max-h-[90vh] overflow-y-auto border-border">
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
                          <SelectTrigger id="edit_owner" className="w-full">
                            <span className="text-foreground text-xs">
                              {contacts.find((c) => c.id === editOwnerId)?.full_name || "Vyberte vlastníka"}
                            </span>
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
                            {OFFER_STATUS_OPTIONS.filter((opt) => opt !== 'prodá později').map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_price">Cena / nájem (Kč) *</Label>
                        <Input
                          id="edit_price"
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit_photo">Hlavní fotografie (URL)</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="edit_photo"
                            type="text"
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            placeholder="https://..."
                            className="text-xs flex-1"
                          />
                          {photoUrl && /^https?:\/\//i.test(photoUrl) && (
                            <img src={photoUrl} alt="Náhled" className="h-9 w-9 rounded object-cover border border-stone-200" />
                          )}
                        </div>
                      </div>
                    </div>

                    {editTransaction === 'pronájem' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-stone-200 pt-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="edit_deposit">Vratná kauce (Kč)</Label>
                          <Input
                            id="edit_deposit"
                            type="number"
                            value={rentDeposit}
                            onChange={(e) => setRentDeposit(e.target.value)}
                            placeholder="Kč"
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edit_fees">Měsíční poplatky (Kč)</Label>
                          <Input
                            id="edit_fees"
                            type="number"
                            value={rentFeesUtilities}
                            onChange={(e) => setRentFeesUtilities(e.target.value)}
                            placeholder="Kč"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-stone-200 pt-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_commission_pct">Provize makléře (%)</Label>
                        <Input
                          id="edit_commission_pct"
                          type="number"
                          value={commissionPct}
                          onChange={(e) => setCommissionPct(e.target.value)}
                          placeholder="%"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit_commission_val">Provize makléře (Kč)</Label>
                        <Input
                          id="edit_commission_val"
                          type="number"
                          value={commissionVal}
                          onChange={(e) => setCommissionVal(e.target.value)}
                          placeholder="Kč"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit_facts">Poznámka</Label>
                      <Textarea
                        id="edit_facts"
                        rows={3}
                        value={editFacts}
                        onChange={(e) => setEditFacts(e.target.value)}
                        placeholder="Poznámka k nemovitosti..."
                        className="text-xs"
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

                  {/* Block 3: Pozemek details */}
                  {editKind === 'pozemek' && (
                    <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                      <h3 className="font-display text-base font-semibold text-foreground">Specifické parametry pro POZEMEK</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="land_size">Výměra (m²) *</Label>
                          <Input
                            id="land_size"
                            type="number"
                            value={landSize}
                            onChange={(e) => setLandSize(e.target.value)}
                            placeholder="např. 800"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="land_type">Druh pozemku</Label>
                          <Input
                            id="land_type"
                            value={landType}
                            onChange={(e) => setLandType(e.target.value)}
                            placeholder="např. stavební, zahrada"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="land_utilities">Zasíťování</Label>
                          <Input
                            id="land_utilities"
                            value={landUtilities}
                            onChange={(e) => setLandUtilities(e.target.value)}
                            placeholder="např. elektřina, voda, plyn"
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="zoning_plan">Územní plán</Label>
                          <Input
                            id="zoning_plan"
                            value={zoningPlan}
                            onChange={(e) => setZoningPlan(e.target.value)}
                            placeholder="např. čisté obytné území"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="land_access">Přístup</Label>
                          <Input
                            id="land_access"
                            value={landAccess}
                            onChange={(e) => setLandAccess(e.target.value)}
                            placeholder="např. z obecní asfaltové cesty"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="land_dimensions">Šířka / tvar / svažitost</Label>
                          <Input
                            id="land_dimensions"
                            value={landDimensions}
                            onChange={(e) => setLandDimensions(e.target.value)}
                            placeholder="např. 20x40m, mírný svah"
                            className="text-xs"
                          />
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

                  {/* Doporučení zájemci (Párování) */}
                  {(() => {
                    const matchingBuyers = getMatchingBuyersForProperty(selectedProperty).filter((c) => {
                      return !deals.some((d) => d.buyer_id === c.id && d.property_id === selectedProperty.id);
                    });

                    return (
                      <div className="space-y-4 pt-4 border-t border-dashed border-stone-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            Doporučení zájemci z databáze
                          </h3>
                          <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-mono">
                            {matchingBuyers.length}
                          </span>
                        </div>

                        {matchingBuyers.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Žádní další vhodní kupující v databázi.</p>
                        ) : (
                          <div className="divide-y divide-stone-150 border border-stone-200 rounded-md overflow-hidden bg-white">
                            {matchingBuyers.map((contact) => {
                              const budgetText = contact.budget_to 
                                ? `do ${formatCompactPrice(contact.budget_to)}` 
                                : 'neuveden';
                              
                              return (
                                <div
                                  key={contact.id}
                                  onClick={() => {
                                    setIsDetailOpen(false);
                                    onNavigateToContact(contact.id);
                                  }}
                                  className="p-3 hover:bg-stone-50 cursor-pointer flex justify-between items-center text-xs transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-stone-400" />
                                    <div>
                                      <div className="text-foreground font-semibold">
                                        {contact.full_name}
                                      </div>
                                      <div className="text-[10px] text-stone-500 font-normal">
                                        Rozpočet: {budgetText}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-primary hover:underline font-bold">
                                    Zobrazit
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeletePropertyClick}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 font-medium"
                >
                  Odstranit nemovitost
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Zavřít
                  </Button>
                  <Button type="submit">
                    Uložit změny
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="max-w-md w-[90vw] border-stone-200 text-left p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#141414]">
              Opravdu smazat nemovitost?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 pt-1">
              Tato akce je nevratná a odebere nemovitost ze všech přidružených obchodů.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="text-xs border-stone-200 hover:bg-stone-50 text-stone-600"
            >
              Zrušit
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={executeDeleteProperty}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 h-9"
            >
              Ano, smazat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-5xl lg:max-w-6xl w-[90vw] md:w-[92vw] lg:w-full max-h-[90vh] overflow-y-auto border-stone-200 p-6 md:p-8">
          <DialogHeader className="border-b border-stone-250 pb-4 mb-4">
            <DialogTitle className="font-display text-2xl font-normal text-left text-[#141414]">Přidat nemovitost</DialogTitle>
            <DialogDescription className="text-xs text-left text-muted-foreground mt-1">
              Vyplňte základní údaje o nemovitosti a přiřaďte nebo rovnou vytvořte jejího vlastníka na jednom místě.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Vlastník nemovitosti (col-span-5) */}
              <div className="md:col-span-5 space-y-5">
                <h3 className="font-display text-sm font-semibold text-stone-700 uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">1</span>
                  Vlastník nemovitosti
                </h3>

                {/* Owner selection mode toggle */}
                <div className="space-y-2">
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
                      Vybrat z kontaktů
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
                      Nový vlastník
                    </button>
                  </div>
                </div>

                {/* Selector mode form fields */}
                {ownerMode === 'select' && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="new_owner">Vyberte existující kontakt *</Label>
                    <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                      <SelectTrigger id="new_owner" className="w-full border-stone-200">
                        <span className={`text-xs ${newOwnerId ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {contacts.find((c) => c.id === newOwnerId)?.full_name || "Vyberte vlastníka z kontaktů"}
                        </span>
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
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="owner_fullname">Jméno a příjmení *</Label>
                      <Input
                        id="owner_fullname"
                        value={newOwnerFullName}
                        onChange={(e) => setNewOwnerFullName(e.target.value)}
                        placeholder="např. Jan Novák"
                        className="border-stone-200 h-9 text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="owner_phone">Telefon *</Label>
                      <Input
                        id="owner_phone"
                        value={newOwnerPhone}
                        onChange={(e) => setNewOwnerPhone(e.target.value)}
                        placeholder="např. +420 777 888 999"
                        className="border-stone-200 h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner_email">E-mail</Label>
                      <Input
                        id="owner_email"
                        type="email"
                        value={newOwnerEmail}
                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                        placeholder="např. novak@seznam.cz"
                        className="border-stone-200 h-9 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="owner_source">Odkud přišel *</Label>
                        <Select value={newOwnerSource} onValueChange={setNewOwnerSource}>
                          <SelectTrigger id="owner_source" className="border-stone-200 h-9 text-xs">
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
                          <SelectTrigger id="owner_status" className="border-stone-200 h-9 text-xs">
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
                        rows={3}
                        value={newOwnerNote}
                        onChange={(e) => setNewOwnerNote(e.target.value)}
                        placeholder="např. Chce prodat rychle..."
                        className="border-stone-200 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Údaje nemovitosti (col-span-7) */}
              <div className="md:col-span-7 space-y-5 md:border-l md:border-stone-200 md:pl-8">
                <h3 className="font-display text-sm font-semibold text-stone-700 uppercase tracking-wider border-b border-stone-200 pb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">2</span>
                  Údaje nemovitosti
                </h3>

                {/* AI Import Bar */}
                <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-lg space-y-2 text-left">
                  <Label htmlFor="import_url" className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                    Bleskový import inzerátu pomocí AI
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="import_url"
                      type="url"
                      placeholder="Vložte odkaz (Sreality, Bezrealitky...)"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      disabled={isImporting}
                      className="border-stone-200 h-9 text-xs bg-white flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleImportFromUrl}
                      disabled={isImporting || !importUrl}
                      size="sm"
                      className="h-9 text-xs shrink-0 font-medium"
                    >
                      {isImporting ? 'Načítám...' : 'Importovat'}
                    </Button>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Stáhne data ze zadaného webu a automaticky předvyplní všechna pole níže.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new_address">Přesná adresa nemovitosti *</Label>
                  <Input
                    id="new_address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="např. Bory, Plzeň"
                    required
                    className="border-stone-200 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new_kind">Druh nemovitosti *</Label>
                    <Select value={newKind} onValueChange={(val: Property['kind']) => setNewKind(val)} required>
                      <SelectTrigger id="new_kind" className="border-stone-200 h-9 text-xs">
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
                      <SelectTrigger id="new_trans" className="border-stone-200 h-9 text-xs">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new_price">Cena / Nájem (Kč) *</Label>
                    <Input
                      id="new_price"
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Kč"
                      required
                      className="border-stone-200 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new_status">Stav nabídky *</Label>
                    <Select value={newOfferStatus} onValueChange={(val: Property['offer_status']) => setNewOfferStatus(val)} required>
                      <SelectTrigger id="new_status" className="border-stone-200 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OFFER_STATUS_OPTIONS.filter((opt) => opt !== 'prodá později').map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new_photo">Hlavní fotografie (URL)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="new_photo"
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="border-stone-200 h-9 text-xs flex-1"
                    />
                    {photoUrl && /^https?:\/\//i.test(photoUrl) && (
                      <img src={photoUrl} alt="Náhled" className="h-9 w-9 rounded object-cover border border-stone-200" />
                    )}
                  </div>
                </div>

                {newTransaction === 'pronájem' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-stone-200 pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="new_deposit">Vratná kauce (Kč)</Label>
                      <Input
                        id="new_deposit"
                        type="number"
                        value={rentDeposit}
                        onChange={(e) => setRentDeposit(e.target.value)}
                        placeholder="Kč"
                        className="border-stone-200 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new_fees">Měsíční poplatky (Kč)</Label>
                      <Input
                        id="new_fees"
                        type="number"
                        value={rentFeesUtilities}
                        onChange={(e) => setRentFeesUtilities(e.target.value)}
                        placeholder="Kč"
                        className="border-stone-200 h-9 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-stone-200 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="new_commission_pct">Provize makléře (%)</Label>
                    <Input
                      id="new_commission_pct"
                      type="number"
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(e.target.value)}
                      placeholder="%"
                      className="border-stone-200 h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new_commission_val">Provize makléře (Kč)</Label>
                    <Input
                      id="new_commission_val"
                      type="number"
                      value={commissionVal}
                      onChange={(e) => setCommissionVal(e.target.value)}
                      placeholder="Kč"
                      className="border-stone-200 h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Specific layouts based on kind selection */}
                {newKind === 'byt' && (
                  <div className="border-t border-stone-200 pt-4 space-y-4 text-left">
                    <h4 className="font-display text-xs font-semibold text-stone-700 uppercase tracking-wider">Specifické parametry pro BYT</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flat_layout">Dispozice *</Label>
                        <Select value={flatLayout} onValueChange={setFlatLayout}>
                          <SelectTrigger id="flat_layout" className="border-stone-200 h-9 text-xs w-full">
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
                          className="border-stone-200 h-9 text-xs"
                          placeholder="m²"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flat_floor">Patro / z pater</Label>
                        <Input
                          id="flat_floor"
                          value={flatFloor}
                          onChange={(e) => setFlatFloor(e.target.value)}
                          placeholder="Např. 3. ze 5"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flat_ownership">Vlastnictví</Label>
                        <Select value={flatOwnership} onValueChange={setFlatOwnership}>
                          <SelectTrigger id="flat_ownership" className="border-stone-200 h-9 text-xs w-full">
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
                          <SelectTrigger id="flat_const" className="border-stone-200 h-9 text-xs w-full">
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
                          <SelectTrigger id="flat_cond" className="border-stone-200 h-9 text-xs w-full">
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
                          <SelectTrigger id="flat_penb" className="border-stone-200 h-9 text-xs w-full">
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

                {newKind === 'dům' && (
                  <div className="border-t border-stone-200 pt-4 space-y-4 text-left">
                    <h4 className="font-display text-xs font-semibold text-stone-700 uppercase tracking-wider">Specifické parametry pro DŮM</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="house_layout">Dispozice / místnosti *</Label>
                        <Select value={houseLayout} onValueChange={setHouseLayout}>
                          <SelectTrigger id="house_layout" className="border-stone-200 h-9 text-xs w-full">
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
                          className="border-stone-200 h-9 text-xs"
                          placeholder="m²"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_area">Plocha pozemku (m²) *</Label>
                        <Input
                          id="land_area"
                          type="number"
                          value={landArea}
                          onChange={(e) => setLandArea(e.target.value)}
                          className="border-stone-200 h-9 text-xs"
                          placeholder="m²"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="house_type">Typ domu</Label>
                        <Select value={houseType} onValueChange={setHouseType}>
                          <SelectTrigger id="house_type" className="border-stone-200 h-9 text-xs w-full">
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
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="house_cond">Stav domu</Label>
                        <Select value={houseCondition} onValueChange={setHouseCondition}>
                          <SelectTrigger id="house_cond" className="border-stone-200 h-9 text-xs w-full">
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
                          <SelectTrigger id="house_penb" className="border-stone-200 h-9 text-xs w-full">
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

                {newKind === 'pozemek' && (
                  <div className="border-t border-stone-200 pt-4 space-y-4 text-left">
                    <h4 className="font-display text-xs font-semibold text-stone-700 uppercase tracking-wider">Specifické parametry pro POZEMEK</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="land_size">Výměra (m²) *</Label>
                        <Input
                          id="land_size"
                          type="number"
                          value={landSize}
                          onChange={(e) => setLandSize(e.target.value)}
                          placeholder="např. 800"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_type">Druh pozemku</Label>
                        <Input
                          id="land_type"
                          value={landType}
                          onChange={(e) => setLandType(e.target.value)}
                          placeholder="např. stavební"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_utilities">Zasíťování</Label>
                        <Input
                          id="land_utilities"
                          value={landUtilities}
                          onChange={(e) => setLandUtilities(e.target.value)}
                          placeholder="např. voda, plyn"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="zoning_plan">Územní plán</Label>
                        <Input
                          id="zoning_plan"
                          value={zoningPlan}
                          onChange={(e) => setZoningPlan(e.target.value)}
                          placeholder="např. obytné území"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_access">Přístup</Label>
                        <Input
                          id="land_access"
                          value={landAccess}
                          onChange={(e) => setLandAccess(e.target.value)}
                          placeholder="např. asfaltová cesta"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_dimensions">Šířka / tvar / svažitost</Label>
                        <Input
                          id="land_dimensions"
                          value={landDimensions}
                          onChange={(e) => setLandDimensions(e.target.value)}
                          placeholder="např. 20x40m"
                          className="border-stone-200 h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="new_facts">Poznámka</Label>
                  <Textarea
                    id="new_facts"
                    rows={3}
                    value={newFacts}
                    onChange={(e) => setNewFacts(e.target.value)}
                    placeholder="Poznámka k nemovitosti..."
                    className="border-stone-200 text-xs"
                  />
                </div>
              </div>

            </div>

            <DialogFooter className="pt-4 border-t border-stone-200 mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">
                Vytvořit nemovitost
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
