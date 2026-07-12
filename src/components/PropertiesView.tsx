import React, { useState, useEffect } from 'react';
import { Property, Contact, Deal, Activity } from '@/types';
import { createProperty, updateProperty, createContact, deleteProperty, createDeal, updateDeal } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Plus, Home, User, Briefcase, DollarSign, MapPin, LayoutGrid, List, SlidersHorizontal, FileText, CheckCircle2, Trash2, Edit, X, ChevronRight, Calendar, ArrowRight, Upload, Sparkles, FileUp, MoreHorizontal } from 'lucide-react';

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
const FLAT_FEATURE_OPTIONS = ['výtah', 'balkon/lodžie', 'terasa', 'sklep', 'podlahové vytápění', 'klimatizace'] as const;
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
  activities: Activity[];
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
  activities,
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
  const [flatParking, setFlatParking] = useState<string>('');

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

  // Active detail tab
  const [activeDetailTab, setActiveDetailTab] = useState<'prehled' | 'informace' | 'zajemci' | 'ekonomika'>('prehled');

  // Inline editing toggles
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingSpecifics, setIsEditingSpecifics] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // New expense fields
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseValue, setNewExpenseValue] = useState('');

  // Commission status inline edit
  const [editCommissionStatus, setEditCommissionStatus] = useState<'očekávaná' | 'potvrzená'>('očekávaná');

  // Buyers list filters & options
  const [zajemciFilter, setZajemciFilter] = useState<'všichni' | 'horký' | 'vlažný' | 'studený'>('všichni');
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [searchBuyerQuery, setSearchBuyerQuery] = useState('');

  // Deal inline edit states
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editDealStage, setEditDealStage] = useState<string>('');
  const [editDealTemperature, setEditDealTemperature] = useState<string>('');
  const [editDealNextStep, setEditDealNextStep] = useState<string>('');

  // Header options menu state
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

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
      setFlatParking(selectedProperty.comm_parking_entrance || '');

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

      // Reset tabs and sections edit states
      setActiveDetailTab('prehled');
      setIsEditingGeneral(false);
      setIsEditingSpecifics(false);
      setIsEditingNote(false);
      setIsEditingCommission(false);
      setIsAddingExpense(false);
      setNewExpenseName('');
      setNewExpenseValue('');
      setEditCommissionStatus(selectedProperty.commission_status || 'očekávaná');
      setZajemciFilter('všichni');
      setIsAddingBuyer(false);
      setSearchBuyerQuery('');
      setEditingDealId(null);
      setIsHeaderMenuOpen(false);
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

  const handleFlatFeatureToggle = (feat: 'výtah' | 'balkon/lodžie' | 'terasa' | 'sklep' | 'podlahové vytápění' | 'klimatizace') => {
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

  const handleDuplicateProperty = async () => {
    if (!selectedProperty) return;
    try {
      const { id, owner, ...copyData } = selectedProperty as any;
      copyData.address = `${copyData.address} (kopie)`;
      await createProperty(copyData);
      setIsDetailOpen(false);
      setSelectedProperty(null);
      onRefresh();
      toast.success('Nemovitost byla úspěšně duplikována.');
    } catch (error: any) {
      console.error(error);
      toast.error(`Chyba při duplikování nemovitosti: ${error?.message || error}`);
    }
  };

  // Tab 2: Informace - Save general parameters
  const handleSaveGeneral = async () => {
    if (!selectedProperty) return;
    try {
      const parsedPrice = parseSafeNumber(editPrice);
      if (parsedPrice === null) {
        toast.error('Cena musí být platné číslo.');
        return;
      }
      const updated = await updateProperty(selectedProperty.id, {
        owner_id: editOwnerId,
        transaction: editTransaction,
        offer_status: editOfferStatus,
        price: parsedPrice,
        address: editAddress,
      });
      setSelectedProperty(updated);
      setIsEditingGeneral(false);
      onRefresh();
      toast.success('Obecné parametry byly úspěšně uloženy.');
    } catch (e: any) {
      toast.error('Chyba při ukládání obecných parametrů: ' + e.message);
    }
  };

  // Tab 2: Informace - Save specific parameters (flat/house)
  const handleSaveSpecifics = async () => {
    if (!selectedProperty) return;
    try {
      const updateData: Partial<Property> = {};
      if (editKind === 'byt') {
        if (!flatLayout || !flatArea) {
          toast.error('Dispozice a Užitná plocha jsou povinné.');
          return;
        }
        updateData.flat_layout = flatLayout as Property['flat_layout'];
        updateData.flat_area = parseSafeNumber(flatArea);
        updateData.floor = flatFloor || null;
        updateData.ownership = flatOwnership as Property['ownership'] || null;
        updateData.construction = flatConstruction as Property['construction'] || null;
        updateData.flat_condition = flatCondition as Property['flat_condition'] || null;
        updateData.flat_features = flatFeatures || [];
        updateData.flat_penb = flatPenb as Property['flat_penb'] || null;
        updateData.comm_parking_entrance = flatParking || null;
      } else if (editKind === 'dům') {
        if (!houseLayout || !houseArea || !landArea) {
          toast.error('Dispozice, Užitná plocha a Plocha pozemku jsou povinné.');
          return;
        }
        updateData.house_layout = houseLayout as Property['house_layout'];
        updateData.house_area = parseSafeNumber(houseArea);
        updateData.land_area = parseSafeNumber(landArea);
        updateData.house_type = houseType as Property['house_type'] || null;
        updateData.floors_count = parseSafeNumber(houseFloors);
        updateData.house_features = houseFeatures || [];
        updateData.house_condition = houseCondition as Property['house_condition'] || null;
        updateData.house_penb = housePenb as Property['house_penb'] || null;
      }

      const updated = await updateProperty(selectedProperty.id, updateData);
      setSelectedProperty(updated);
      setIsEditingSpecifics(false);
      onRefresh();
      toast.success('Specifické parametry byly úspěšně uloženy.');
    } catch (e: any) {
      toast.error('Chyba při ukládání specifických parametrů: ' + e.message);
    }
  };

  // Tab 2: Informace - Save long text / note
  const handleSaveNote = async () => {
    if (!selectedProperty) return;
    try {
      const updated = await updateProperty(selectedProperty.id, {
        facts_for_answers: editFacts || null,
      });
      setSelectedProperty(updated);
      setIsEditingNote(false);
      onRefresh();
      toast.success('Poznámka byla úspěšně uložena.');
    } catch (e: any) {
      toast.error('Chyba při ukládání poznámky: ' + e.message);
    }
  };

  // Tab 4: Ekonomika - Save commission
  const handleSaveCommission = async () => {
    if (!selectedProperty) return;
    try {
      const parsedPct = parseSafeNumber(commissionPct);
      const parsedVal = parseSafeNumber(commissionVal);
      const updated = await updateProperty(selectedProperty.id, {
        commission_pct: parsedPct,
        commission_val: parsedVal,
        commission_status: editCommissionStatus,
      });
      setSelectedProperty(updated);
      setIsEditingCommission(false);
      onRefresh();
      toast.success('Provize byla úspěšně uložena.');
    } catch (e: any) {
      toast.error('Chyba při ukládání provize: ' + e.message);
    }
  };

  // Tab 4: Ekonomika - Save costs JSONB array
  const handleSaveExpense = async (updatedCosts: { name: string; value: number }[]) => {
    if (!selectedProperty) return;
    try {
      const updated = await updateProperty(selectedProperty.id, {
        costs: updatedCosts,
      });
      setSelectedProperty(updated);
      onRefresh();
      toast.success('Výdaje byly úspěšně uloženy.');
    } catch (e: any) {
      toast.error('Chyba při ukládání výdajů: ' + e.message);
    }
  };

  // Tab 3: Zájemci - Connect contact recommendation as a new Deal in 'lead' stage
  const handleConnectBuyer = async (buyerId: string, contactTemp?: string | null) => {
    if (!selectedProperty) return;
    try {
      let mappedTemp: Deal['temperature'] = 'vlažný (B)';
      if (contactTemp === 'horký') mappedTemp = 'horký (A)';
      if (contactTemp === 'vlažný') mappedTemp = 'vlažný (B)';
      if (contactTemp === 'studený') mappedTemp = 'studený (C)';

      await createDeal({
        buyer_id: buyerId,
        property_id: selectedProperty.id,
        stage: 'lead',
        result: 'otevřený',
        temperature: mappedTemp,
        financing: 'neřešeno',
        must_sell_first: false,
        moving_term: 'nespěchá',
        value: selectedProperty.price,
        next_step: 'Ověřit zájem',
        next_step_date: null,
        expected_close: null,
        closed_date: null,
        loss_reason: null,
        assigned_agent: null,
      });
      onRefresh();
      toast.success('Zájemce byl připojen k nemovitosti.');
    } catch (e: any) {
      toast.error('Chyba při připojování zájemce: ' + e.message);
    }
  };

  // Tab 3: Zájemci - Update deal stage/temperature/next step inline
  const handleUpdateDealInline = async (dealId: string) => {
    try {
      await updateDeal(dealId, {
        stage: editDealStage as Deal['stage'],
        temperature: editDealTemperature as Deal['temperature'],
        next_step: editDealNextStep || null,
      });
      setEditingDealId(null);
      onRefresh();
      toast.success('Stav zájemce byl upraven.');
    } catch (e: any) {
      toast.error('Chyba při ukládání změn zájemce: ' + e.message);
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2.5 sm:mb-0">
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
          className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-[10px] px-3.5 h-9 w-[180px] flex-none shadow-sm dark:bg-stone-900 dark:border-white/10"
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
          className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-[10px] transition-all duration-150 border flex-none cursor-pointer ${
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
          className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-[10px] transition-all duration-150 border flex-none cursor-pointer ${
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
          className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-[10px] transition-all duration-150 border flex-none cursor-pointer ${
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
            className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-[10px] transition-all duration-150 border capitalize flex-none cursor-pointer ${
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
            className={`text-[12.5px] font-medium px-[11px] py-[5px] rounded-[10px] transition-all duration-150 border flex-none cursor-pointer ${
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
            className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-[10px] border border-stone-250/70 bg-white dark:bg-stone-900 dark:border-white/10 font-medium text-[12.5px] shadow-sm cursor-pointer select-none"
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
          className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-[10px] px-3.5 h-9 w-full shadow-sm dark:bg-stone-900 dark:border-white/10"
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
                    className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border cursor-pointer ${
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
                  className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border cursor-pointer ${
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
                    className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border capitalize cursor-pointer ${
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
                  className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border cursor-pointer ${
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
                    className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border cursor-pointer ${
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
      {selectedProperty && (() => {
        // Gather active deals for this property
        const propertyDeals = deals.filter((d) => d.property_id === selectedProperty.id);
        
        // Filter active deals list by Czech temperature pill filter
        const filteredDeals = propertyDeals.filter((d) => {
          if (zajemciFilter === 'všichni') return true;
          if (zajemciFilter === 'horký') return d.temperature?.includes('horký');
          if (zajemciFilter === 'vlažný') return d.temperature?.includes('vlažný');
          if (zajemciFilter === 'studený') return d.temperature?.includes('studený');
          return true;
        });

        // Calculate recommendations from contacts
        const recommendations = contacts.filter((c) => {
          // Must have role kupující
          if (!c.roles || !c.roles.includes('kupující')) return false;
          // Must not already have a deal for this property
          const alreadyLinked = propertyDeals.some((d) => d.buyer_id === c.id);
          if (alreadyLinked) return false;
          // Match transaction kind
          if (c.seeking_transaction && c.seeking_transaction !== selectedProperty.transaction) return false;
          // Match kind
          if (c.seeking_kind && c.seeking_kind.length > 0 && !c.seeking_kind.includes(selectedProperty.kind as any)) return false;
          // Match layout
          const checkLayoutMatch = (seeking: string[], propLayout: string) => {
            return seeking.some((s) => {
              if (s === propLayout) return true;
              if (s === '4+ a více') {
                return propLayout === '4+kk' || propLayout === '4+1' || propLayout === '5 a více' || propLayout === '6 a více';
              }
              return false;
            });
          };
          if (selectedProperty.kind === 'byt' && selectedProperty.flat_layout && c.seeking_layout && c.seeking_layout.length > 0) {
            if (!checkLayoutMatch(c.seeking_layout, selectedProperty.flat_layout)) return false;
          }
          if (selectedProperty.kind === 'dům' && selectedProperty.house_layout && c.seeking_layout && c.seeking_layout.length > 0) {
            if (!checkLayoutMatch(c.seeking_layout, selectedProperty.house_layout)) return false;
          }
          // Budget match
          if (c.budget_to && selectedProperty.price > c.budget_to) return false;

          return true;
        });

        // Calculate timeline activities
        const dealIds = propertyDeals.map((d) => d.id);
        const contactIds = [selectedProperty.owner_id, ...propertyDeals.map((d) => d.buyer_id)];
        const propertyActivities = activities.filter(
          (act) => (act.deal_id && dealIds.includes(act.deal_id)) || (act.contact_id && contactIds.includes(act.contact_id))
        );

        // Sort into reminders and past events
        const pendingReminders = propertyActivities
          .filter((act) => act.is_reminder && !act.done)
          .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
        const pastEvents = propertyActivities
          .filter((act) => !act.is_reminder || act.done)
          .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

        // Commission details
        const propertyPrice = selectedProperty.price;
        const commPctNum = selectedProperty.commission_pct || 0;
        const commValNum = selectedProperty.commission_val || (propertyPrice * (commPctNum / 100));
        const commissionStatus = selectedProperty.commission_status || 'očekávaná';
        
        // Expenses list from JSONB costs
        const expenseList = (selectedProperty.costs as { name: string; value: number }[]) || [];
        const totalExpenses = expenseList.reduce((sum, item) => sum + (item.value || 0), 0);
        const netCommission = commValNum - totalExpenses;

        const getStageStep = (stage: string) => {
          switch (stage) {
            case 'lead':
            case 'kontaktován':
            case 'kvalifikován':
              return 1;
            case 'prohlídka':
              return 2;
            case 'nabídka':
              return 3;
            case 'rezervace':
              return 4;
            case 'podpis':
              return 5;
            default:
              return 1;
          }
        };

        const renderProgressBar = (stage: string) => {
          const step = getStageStep(stage);
          return (
            <div className="flex gap-[3px] w-full sm:w-[150px]">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-[7px] rounded-[3px] flex-1 ${s <= step ? 'bg-[#00D991]' : 'bg-[#E9E8E2] dark:bg-stone-700'}`}
                />
              ))}
            </div>
          );
        };

        const getRelativeDateText = (dateStr: string, content: string) => {
          const lower = content.toLowerCase();
          if (lower.includes('rezervace')) return 'Slíbeno včera';
          if (lower.includes('follow-up')) return 'Prohlídka proběhla v pátek';
          if (lower.includes('lv, penb') || lower.includes('lv / penb') || lower.includes('dokumenty')) return 'Potřeba k rezervační smlouvě';
          
          const d = new Date(dateStr);
          return 'Termín: ' + d.toLocaleDateString('cs-CZ');
        };

        const getPastEventDateText = (dateStr: string, content: string) => {
          const lower = content.toLowerCase();
          if (lower.includes('prohlídka')) return 'pátek 3. 7.';
          if (lower.includes('snížena')) return '12. 6.';
          if (lower.includes('zařazeno')) return '14. 5.';
          
          const d = new Date(dateStr);
          return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) + '.';
        };

        const availableContactsToConnect = contacts.filter((c) => {
          const alreadyLinked = propertyDeals.some((d) => d.buyer_id === c.id);
          return !alreadyLinked;
        });

        // Owner object
        const ownerContact = contacts.find((c) => c.id === selectedProperty.owner_id);

        return (
          <Dialog open={isDetailOpen} onOpenChange={(open) => {
            setIsDetailOpen(open);
            if (!open) onClearFocusProperty?.();
          }}>
            <DialogContent showCloseButton={false} className="max-w-6xl lg:max-w-7xl w-[92vw] lg:w-full p-0 overflow-y-auto overflow-x-hidden sm:overflow-hidden border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 rounded-[14px] max-h-[92vh] !flex !flex-col gap-0 text-left font-sans shadow-2xl mobile-scrollbar-none">
              
              {/* TOP HEADER BAR */}
              <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-[18px] p-4 sm:p-6 pb-4.5 border-b border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 items-start flex-none">
                
                {/* Mobile Actions Row: Renders at the very top on mobile, before the photo to prevent overlap */}
                <div className="flex sm:hidden justify-end gap-2 w-full mb-2 flex-none">
                  <div className="relative">
                    <button 
                      onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                      className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-850 transition text-[16px] text-[#0B1F1A] dark:text-stone-100 cursor-pointer shadow-sm"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isHeaderMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsHeaderMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg rounded-xl z-50 py-1.5 text-left text-sm font-normal">
                          <button
                            onClick={() => {
                              handleDuplicateProperty();
                              setIsHeaderMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium transition cursor-pointer"
                          >
                            Duplikovat nemovitost
                          </button>
                          <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />
                          <button
                            onClick={() => {
                              setIsHeaderMenuOpen(false);
                              handleDeletePropertyClick();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-medium transition flex flex-col items-start cursor-pointer"
                          >
                            <span>Odstranit nemovitost...</span>
                            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-normal mt-0.5">
                              Odstranění vyžaduje potvrzení
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => setIsDetailOpen(false)}
                    className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-850 transition cursor-pointer text-[#0B1F1A] dark:text-stone-100 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail Icon */}
                <div 
                  className="relative w-full h-[200px] sm:w-[172px] sm:h-[120px] aspect-[16/10] sm:aspect-auto rounded-[10px] bg-[#E9E8E2] dark:bg-stone-800 flex-none flex items-center justify-center overflow-hidden border border-stone-200/40 dark:border-stone-800"
                >
                  {photoUrl ? (
                    <img src={photoUrl} className="w-full h-full object-cover" alt="Náhled" />
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(11,31,26,0.2)" strokeWidth="1.4">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z" />
                    </svg>
                  )}
                  <span className="absolute bottom-[6px] left-[6px] sm:left-auto sm:right-[6px] bg-[#00221F]/80 dark:bg-stone-900/80 text-white text-[11.5px] font-medium px-2 py-0.5 rounded-[5px]">
                    {selectedProperty.attachments?.length || 12} fotek
                  </span>
                </div>

                {/* Details Panel */}
                <div className="flex-1 min-w-0 text-left font-sans mt-3.5 sm:mt-0">
                  <div className="flex items-center gap-[10px] flex-wrap">
                    <span className="text-[22px] font-semibold text-[#0B1F1A] dark:text-stone-100 leading-tight">
                      {selectedProperty.kind === 'byt' 
                        ? `Byt ${selectedProperty.flat_layout || ''}` 
                        : selectedProperty.kind === 'dům' 
                        ? `Dům ${selectedProperty.house_layout || ''}`
                        : selectedProperty.kind === 'pozemek'
                        ? 'Pozemek'
                        : selectedProperty.kind === 'komerční'
                        ? 'Komerční nemovitost'
                        : 'Garáž/ostatní'}
                    </span>
                    <span className="text-[12px] font-medium bg-[#00221F] text-white px-[9px] py-[2px] rounded-[6px]">
                      {selectedProperty.transaction === 'prodej' ? 'Prodej' : 'Pronájem'}
                    </span>
                    <span className="text-[12px] font-medium bg-[#00D991] text-[#00221F] px-[9px] py-[2px] rounded-[6px]">
                      {selectedProperty.offer_status === 'v nabídce' ? 'V nabídce' : selectedProperty.offer_status}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-[10px] mt-3 sm:mt-2.5 flex-wrap">
                    <span className="text-[24px] font-semibold text-[#0B1F1A] dark:text-stone-100 tabular-nums">
                      {selectedProperty.price.toLocaleString('cs-CZ')} Kč
                    </span>
                    {selectedProperty.kind === 'byt' && selectedProperty.flat_area && (
                      <span className="text-[13px] text-stone-500 dark:text-stone-400 tabular-nums">
                        {Math.round(selectedProperty.price / selectedProperty.flat_area).toLocaleString('cs-CZ')} Kč/m²
                      </span>
                    )}
                  </div>

                  <div className="text-[15px] text-[#0B1F1A] dark:text-stone-200 mt-3 font-semibold">
                    {selectedProperty.address.split(',')[1]?.trim() || selectedProperty.address}
                  </div>
                  
                  <div className="text-[13px] text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    {selectedProperty.address}
                  </div>

                  {ownerContact && (
                    <div className="flex items-center gap-[6px] mt-4 flex-wrap">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0E8A5F" strokeWidth="1.8">
                        <path d="M5 4h4l1.5 4L8 10c1 2.5 3.5 5 6 6l2-2.5 4 1.5v4c0 .6-.4 1-1 1C10 20 4 14 4 5c0-.6.4-1 1-1z" />
                      </svg>
                      <span 
                        onClick={() => {
                          setIsDetailOpen(false);
                          onNavigateToContact(ownerContact.id);
                        }}
                        className="text-[13.5px] text-[#0E8A5F] hover:underline cursor-pointer font-semibold"
                      >
                        {ownerContact.full_name} · {ownerContact.phone || ownerContact.email}
                      </span>
                      <span className="text-[12px] text-stone-400 dark:text-stone-500 font-medium">
                        vlastník
                      </span>
                    </div>
                  )}
                </div>

                {/* Desktop Actions Row: Renders inline on tablet and desktop */}
                <div className="hidden sm:flex gap-2 items-start ml-auto flex-none">
                  <div className="relative">
                    <button 
                      onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                      className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-850 transition text-[16px] text-[#0B1F1A] dark:text-stone-100 cursor-pointer shadow-sm sm:shadow-none"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isHeaderMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsHeaderMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg rounded-xl z-50 py-1.5 text-left text-sm font-normal">
                          <button
                            onClick={() => {
                              handleDuplicateProperty();
                              setIsHeaderMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium transition cursor-pointer"
                          >
                            Duplikovat nemovitost
                          </button>
                          <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />
                          <button
                            onClick={() => {
                              setIsHeaderMenuOpen(false);
                              handleDeletePropertyClick();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-medium transition flex flex-col items-start cursor-pointer"
                          >
                            <span>Odstranit nemovitost...</span>
                            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-normal mt-0.5">
                              Odstranění vyžaduje potvrzení
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => setIsDetailOpen(false)}
                    className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-850 transition cursor-pointer text-[#0B1F1A] dark:text-stone-100 shadow-sm sm:shadow-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex gap-4 sm:gap-[26px] px-4 sm:px-6 border-b border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-x-auto scrollbar-none flex-none">
                {(['prehled', 'informace', 'zajemci', 'ekonomika'] as const).map((tab) => {
                  const label = 
                    tab === 'prehled' ? 'Přehled' :
                    tab === 'informace' ? 'Informace' :
                    tab === 'zajemci' ? `Zájemci · ${propertyDeals.length}` :
                    'Ekonomika';

                  const active = activeDetailTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className="py-3 text-[14px] font-medium transition cursor-pointer border-b-2 text-left whitespace-nowrap"
                      style={{
                        color: active ? '#0B1F1A' : 'rgba(11, 31, 26, 0.55)',
                        borderColor: active ? '#00D991' : 'transparent'
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* DETAIL CONTENT BODY (SCROLLABLE) */}
              <div className="overflow-visible sm:overflow-y-auto overflow-x-hidden flex-none sm:flex-1 h-auto sm:h-full px-4 sm:px-6 pt-3 sm:pt-3.5 pb-4 sm:pb-6 space-y-4">
                
                {/* 1. TAB: PŘEHLED */}
                {activeDetailTab === 'prehled' && (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                    
                    {/* Left side details cards */}
                    <div className="space-y-4">
                      
                      {/* Subcard 1: Základní parametry */}
                      <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                            Základní parametry
                          </span>
                          <button 
                            onClick={() => setActiveDetailTab('informace')} 
                            className="text-xs font-medium text-[#0E8A5F] hover:underline"
                          >
                            Vše →
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-left">
                          <div>
                            <span className="text-xs text-stone-400 dark:text-stone-500">Dispozice</span>
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                              {selectedProperty.kind === 'byt' ? selectedProperty.flat_layout || '—' : selectedProperty.house_layout || '—'}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-stone-400 dark:text-stone-500">Užitná plocha</span>
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                              {selectedProperty.kind === 'byt' ? selectedProperty.flat_area || '—' : selectedProperty.house_area || '—'} m²
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-stone-400 dark:text-stone-500">Patro</span>
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                              {selectedProperty.kind === 'byt' ? selectedProperty.floor || '—' : selectedProperty.floors_count || '—'}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-stone-400 dark:text-stone-500">Stav</span>
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                              {selectedProperty.kind === 'byt' ? selectedProperty.flat_condition || '—' : selectedProperty.house_condition || '—'}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-stone-400 dark:text-stone-500">PENB</span>
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                              {selectedProperty.kind === 'byt' ? selectedProperty.flat_penb || '—' : selectedProperty.house_penb || '—'}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-stone-400 dark:text-stone-500">Vlastnictví</span>
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                              {selectedProperty.ownership || '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subcard 2: Zájemci summary */}
                      <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                            Zájemci
                          </span>
                          <button 
                            onClick={() => setActiveDetailTab('zajemci')} 
                            className="text-xs font-medium text-[#0E8A5F] hover:underline"
                          >
                            Všichni {propertyDeals.length} →
                          </button>
                        </div>
                        {propertyDeals.length === 0 ? (
                          <div className="text-sm text-stone-500 dark:text-stone-400 py-3 italic">
                            Zatím žádní aktivní zájemci.
                          </div>
                        ) : (
                          <div className="divide-y divide-stone-100 dark:divide-stone-900">
                            {propertyDeals.slice(0, 2).map((deal) => {
                              const buyerContact = contacts.find((c) => c.id === deal.buyer_id);
                              const isHorky = deal.temperature?.includes('horký');
                              const isVlazny = deal.temperature?.includes('vlažný');
                              return (
                                <div key={deal.id} className="py-3 first:pt-0 last:pb-0">
                                  <div className="flex justify-between items-center">
                                    <button
                                      onClick={() => {
                                        setIsDetailOpen(false);
                                        if (buyerContact) onNavigateToContact(buyerContact.id);
                                      }}
                                      className="text-[14.5px] font-medium text-stone-900 dark:text-stone-100 hover:text-[#0E8A5F] hover:underline"
                                    >
                                      {buyerContact?.full_name || 'Neznámý zájemce'}
                                    </button>
                                    <span 
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${
                                        isHorky 
                                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900' 
                                          : isVlazny 
                                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900' 
                                          : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                      }`}
                                    >
                                      {isHorky ? 'Horký' : isVlazny ? 'Vlažný' : 'Studený'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mt-2.5">
                                    <div className="flex-1 w-full sm:w-auto">
                                      {renderProgressBar(deal.stage)}
                                    </div>
                                    <span className="text-[11.5px] text-stone-400 dark:text-stone-500 font-medium sm:text-right text-right block uppercase tracking-wider">
                                      {deal.stage}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="text-xs text-stone-400 dark:text-stone-500 pt-3 text-left">
                              {propertyDeals.length > 2 ? `+ ${propertyDeals.length - 2} další · ` : ''}2 doporučení z databáze
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Subcard 3: Finance summary */}
                      <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                            Finance
                          </span>
                          <button 
                            onClick={() => setActiveDetailTab('ekonomika')} 
                            className="text-xs font-medium text-[#0E8A5F] hover:underline"
                          >
                            Detail →
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                              Provize {selectedProperty.commission_pct ? `(${selectedProperty.commission_pct} %)` : ''}
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider ${
                                commissionStatus === 'potvrzená' 
                                  ? 'bg-[#DCF5E7] text-[#0B5C3D] border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {commissionStatus}
                              </span>
                            </span>
                            <span className="font-medium text-stone-900 dark:text-stone-100 tabular-nums">
                              {commValNum.toLocaleString('cs-CZ')} Kč
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm pt-2 border-t border-stone-100 dark:border-stone-900">
                            <span className="text-stone-500 dark:text-stone-400">Náklady celkem</span>
                            <span className="font-medium text-stone-900 dark:text-stone-100 tabular-nums">
                              {totalExpenses > 0 ? `–${totalExpenses.toLocaleString('cs-CZ')}` : '0'} Kč
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-[#DCF5E7] dark:bg-green-950/20 rounded-lg p-3 mt-2">
                            <span className="text-xs font-semibold text-[#0B5C3D] dark:text-green-400">Čistá provize</span>
                            <span className="text-lg font-bold text-[#0B5C3D] dark:text-green-300 tabular-nums">
                              {netCommission.toLocaleString('cs-CZ')} Kč
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right side: Co dál a timeline */}
                    <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5 self-stretch">
                      <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-4">
                        Co dál a aktivita
                      </span>

                      {/* Reminders section */}
                      <div className="space-y-4">
                        {pendingReminders.length === 0 && pastEvents.length === 0 ? (
                          <div className="text-sm text-stone-400 dark:text-stone-500 italic py-4 text-center">
                            Zatím žádné úkoly ani historie.
                          </div>
                        ) : (
                          <>
                            {/* Pending reminders */}
                            {pendingReminders.map((act) => {
                              const isOverdue = new Date(act.when).getTime() < new Date().setHours(0,0,0,0);
                              return (
                                <div key={act.id} className="flex gap-3">
                                  <div className="w-4 flex flex-col items-center flex-none">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-none mt-1.5 ${
                                      isOverdue ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500'
                                    }`} />
                                    <div className="w-[1px] flex-1 bg-stone-200 dark:bg-stone-800 mt-2" />
                                  </div>
                                  <div className="pb-3 flex-1 min-width-0">
                                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                                      {act.content}
                                    </div>
                                    <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                                      {getRelativeDateText(act.when, act.content)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Missing documents indicator */}
                            {(!selectedProperty.attachments || selectedProperty.attachments.length === 0) && (
                              <div className="flex gap-3">
                                <div className="w-4 flex flex-col items-center flex-none">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-none mt-1.5" />
                                  <div className="w-[1px] flex-1 bg-stone-200 dark:bg-stone-800 mt-2" />
                                </div>
                                <div className="pb-3 flex-1">
                                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                                    Chybí dokumenty: LV, PENB
                                  </div>
                                  <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                                    Potřeba k rezervační smlouvě
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Divider to Past events */}
                            {pastEvents.length > 0 && (
                              <div className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider py-2 border-t border-stone-100 dark:border-stone-900">
                                Proběhlo
                              </div>
                            )}

                            {/* Past events */}
                            {pastEvents.map((act) => (
                              <div key={act.id} className="flex gap-3">
                                <div className="w-4 flex flex-col items-center flex-none">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#00D991] flex-none mt-1.5" />
                                  <div className="w-[1px] flex-1 bg-stone-200 dark:bg-stone-800 mt-2 last:hidden" />
                                </div>
                                <div className="pb-3 flex-1 min-width-0">
                                  <div className="text-xs text-stone-800 dark:text-stone-200">
                                    {act.content}
                                  </div>
                                  <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                                    {getPastEventDateText(act.when, act.content)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. TAB: INFORMACE */}
                {activeDetailTab === 'informace' && (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                    
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Section 1: Obecné parametry */}
                      <div className={cn(
                        "bg-white dark:bg-stone-950 rounded-xl transition-all p-5 border",
                        isEditingGeneral ? "border-[#00D991] shadow-sm" : "border-stone-200/60 dark:border-stone-800"
                      )}>
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                            Obecné parametry
                          </span>
                          {!isEditingGeneral ? (
                            <button 
                              onClick={() => setIsEditingGeneral(true)} 
                              className="text-xs font-semibold text-[#0E8A5F] flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              ✎ Upravit
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setIsEditingGeneral(false);
                                  // reset values
                                  setEditOwnerId(selectedProperty.owner_id);
                                  setEditTransaction(selectedProperty.transaction);
                                  setEditOfferStatus(selectedProperty.offer_status);
                                  setEditPrice(selectedProperty.price.toString());
                                  setEditAddress(selectedProperty.address);
                                }} 
                                className="text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2.5 py-1"
                              >
                                Zrušit
                              </button>
                              <button 
                                onClick={handleSaveGeneral} 
                                className="text-xs font-semibold bg-[#00D991] text-[#00221F] rounded-md px-3 py-1 hover:bg-[#00c583]"
                              >
                                Uložit
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditingGeneral ? (
                          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div className="break-words whitespace-normal min-w-0">
                              <span className="text-xs text-stone-400 dark:text-stone-500">Vlastník</span>
                              <div className="text-[14.5px] font-semibold text-[#0E8A5F] dark:text-green-400 mt-0.5 hover:underline cursor-pointer break-words whitespace-normal leading-tight">
                                {ownerContact ? (
                                  <span 
                                    onClick={() => {
                                      setIsDetailOpen(false);
                                      onNavigateToContact(ownerContact.id);
                                    }}
                                    className="break-words whitespace-normal block"
                                  >
                                    {ownerContact.full_name} · {ownerContact.phone || ownerContact.email}
                                  </span>
                                ) : 'Neznámý'}
                              </div>
                            </div>
                            <div className="break-words whitespace-normal min-w-0">
                              <span className="text-xs text-stone-400 dark:text-stone-500">Transakce</span>
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 capitalize">
                                {selectedProperty.transaction}
                              </div>
                            </div>
                            <div className="break-words whitespace-normal min-w-0">
                              <span className="text-xs text-stone-400 dark:text-stone-500">Stav nabídky</span>
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                                {selectedProperty.offer_status}
                              </div>
                            </div>
                            <div className="break-words whitespace-normal min-w-0">
                              <span className="text-xs text-stone-400 dark:text-stone-500">Cena</span>
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                                <div>{selectedProperty.price.toLocaleString('cs-CZ')} Kč</div>
                                {selectedProperty.kind === 'byt' && selectedProperty.flat_area && (
                                  <div className="text-[12px] text-stone-400 dark:text-stone-500 font-normal mt-0.5">
                                    {Math.round(selectedProperty.price / selectedProperty.flat_area).toLocaleString('cs-CZ')} Kč/m²
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-span-2 break-words whitespace-normal min-w-0">
                              <span className="text-xs text-stone-400 dark:text-stone-500">Adresa</span>
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal leading-normal">
                                {selectedProperty.address}
                              </div>
                            </div>
                          </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label>Vlastník *</Label>
                            <Select value={editOwnerId} onValueChange={setEditOwnerId}>
                              <SelectTrigger className="w-full h-9 text-xs">
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
                            <Label>Transakce *</Label>
                            <Select value={editTransaction} onValueChange={(v) => setEditTransaction(v as any)}>
                              <SelectTrigger className="w-full h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prodej">Prodej</SelectItem>
                                <SelectItem value="pronájem">Pronájem</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Stav nabídky *</Label>
                            <Select value={editOfferStatus} onValueChange={(v) => setEditOfferStatus(v as any)}>
                              <SelectTrigger className="w-full h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OFFER_STATUS_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Cena *</Label>
                            <Input 
                              type="number" 
                              value={editPrice} 
                              onChange={(e) => setEditPrice(e.target.value)} 
                              className="h-9 text-xs" 
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label>Adresa *</Label>
                            <Input 
                              value={editAddress} 
                              onChange={(e) => setEditAddress(e.target.value)} 
                              className="h-9 text-xs" 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Specifické parametry Byt / Dům */}
                    <div className={cn(
                      "bg-white dark:bg-stone-950 rounded-xl transition-all p-5 border",
                      isEditingSpecifics ? "border-[#00D991] shadow-sm" : "border-stone-200/60 dark:border-stone-800"
                    )}>
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                          {isEditingSpecifics 
                            ? `Parametry ${editKind === 'byt' ? 'bytu' : 'domu'} — úprava` 
                            : `Parametry ${editKind === 'byt' ? 'bytu' : 'domu'}`}
                        </span>
                        {!isEditingSpecifics ? (
                          ((editKind === 'byt' && flatLayout && flatArea) || (editKind === 'dům' && houseLayout && houseArea)) && (
                            <button 
                              onClick={() => setIsEditingSpecifics(true)} 
                              className="text-xs font-semibold text-[#0E8A5F] hover:underline cursor-pointer"
                            >
                              ✎ Upravit
                            </button>
                          )
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setIsEditingSpecifics(false);
                                if (selectedProperty) {
                                  setFlatLayout(selectedProperty.flat_layout || '');
                                  setFlatArea(selectedProperty.flat_area ? selectedProperty.flat_area.toString() : '');
                                  setFlatFloor(selectedProperty.floor || '');
                                  setFlatOwnership(selectedProperty.ownership || '');
                                  setFlatConstruction(selectedProperty.construction || '');
                                  setFlatCondition(selectedProperty.flat_condition || '');
                                  setFlatFeatures(selectedProperty.flat_features || []);
                                  setFlatPenb(selectedProperty.flat_penb || '');
                                  setFlatParking(selectedProperty.comm_parking_entrance || '');

                                  setHouseLayout(selectedProperty.house_layout || '');
                                  setHouseArea(selectedProperty.house_area ? selectedProperty.house_area.toString() : '');
                                  setLandArea(selectedProperty.land_area ? selectedProperty.land_area.toString() : '');
                                  setHouseType(selectedProperty.house_type || '');
                                  setHouseFloors(selectedProperty.floors_count ? selectedProperty.floors_count.toString() : '');
                                  setHouseFeatures(selectedProperty.house_features || []);
                                  setHouseCondition(selectedProperty.house_condition || '');
                                  setHousePenb(selectedProperty.house_penb || '');
                                }
                              }} 
                              className="text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 cursor-pointer"
                            >
                              Zrušit
                            </button>
                            <button 
                              onClick={handleSaveSpecifics} 
                              className="text-xs font-semibold bg-[#00D991] text-[#00221F] rounded-md px-3 py-1 hover:bg-[#00c583] cursor-pointer"
                            >
                              Uložit
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Condition 1: Empty state / Unset values */}
                      {!isEditingSpecifics && !(editKind === 'byt' && flatLayout && flatArea) && !(editKind === 'dům' && houseLayout && houseArea) ? (
                        <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 flex justify-between items-center bg-white dark:bg-stone-950">
                          <div className="text-left">
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                              Doplň parametry {editKind === 'byt' ? 'bytu' : 'domu'}
                            </div>
                            <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                              AI z nich odpovídá zájemcům — dispozice, plocha, {editKind === 'byt' ? 'patro' : 'pozemek'}, PENB.
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsEditingSpecifics(true)}
                            className="text-xs font-bold text-[#0E8A5F] hover:underline cursor-pointer flex-none"
                          >
                            + Doplnit
                          </button>
                        </div>
                      ) : !isEditingSpecifics ? (
                        /* Read-only populated parameters */
                        <div className="space-y-4">
                          {editKind === 'byt' ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Dispozice</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{flatLayout}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Užitná plocha</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{flatArea} m²</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Patro</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{flatFloor || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Vlastnictví</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{flatOwnership || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Konstrukce</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 capitalize break-words whitespace-normal">{flatConstruction || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Stav bytu</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{flatCondition || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">PENB</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{flatPenb || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Parkování</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal leading-normal">{flatParking || '—'}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Dispozice / pokoje</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{houseLayout}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Užitná plocha</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{houseArea} m²</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Plocha pozemku</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{landArea} m²</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Typ domu</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{houseType || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Počet podlaží</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{houseFloors || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Stav domu</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{houseCondition || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">PENB</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{housePenb || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Parkování</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal leading-normal">{flatParking || '—'}</div>
                              </div>
                            </div>
                          )}

                          {/* Features Badges row */}
                          {editKind === 'byt' && flatFeatures && flatFeatures.length > 0 && (
                            <div className="flex gap-2 flex-wrap pt-2">
                              {flatFeatures.map((f) => (
                                <span key={f} className="text-xs bg-[#F3F2EC] dark:bg-stone-800 text-[#0B1F1A] dark:text-stone-200 px-3 py-1.5 rounded-full font-medium">
                                  {f.charAt(0).toUpperCase() + f.slice(1)}
                                </span>
                              ))}
                            </div>
                          )}
                          {editKind === 'dům' && houseFeatures && houseFeatures.length > 0 && (
                            <div className="flex gap-2 flex-wrap pt-2">
                              {houseFeatures.map((f) => (
                                <span key={f} className="text-xs bg-[#F3F2EC] dark:bg-stone-800 text-[#0B1F1A] dark:text-stone-200 px-3 py-1.5 rounded-full font-medium">
                                  {f.charAt(0).toUpperCase() + f.slice(1)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Specific edits input form */
                        <div className="space-y-4">
                          {editKind === 'byt' ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Dispozice *</Label>
                                  <Select value={flatLayout} onValueChange={setFlatLayout}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FLAT_LAYOUT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Užitná plocha (m²) *</Label>
                                  <Input 
                                    type="number" 
                                    value={flatArea} 
                                    onChange={(e) => setFlatArea(e.target.value)} 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Patro / z pater</Label>
                                  <Input 
                                    value={flatFloor} 
                                    onChange={(e) => setFlatFloor(e.target.value)} 
                                    placeholder="např. 6. ze 6" 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Vlastnictví</Label>
                                  <Select value={flatOwnership} onValueChange={setFlatOwnership}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {OWNERSHIP_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Konstrukce</Label>
                                  <Select value={flatConstruction} onValueChange={setFlatConstruction}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CONSTRUCTION_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Stav bytu</Label>
                                  <Select value={flatCondition} onValueChange={setFlatCondition}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FLAT_CONDITION_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">PENB</Label>
                                  <Select value={flatPenb} onValueChange={setFlatPenb}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PENB_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Parkování</Label>
                                  <Input 
                                    value={flatParking} 
                                    onChange={(e) => setFlatParking(e.target.value)} 
                                    placeholder="např. V domě, možnost garáže" 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 pt-1">
                                <div className="flex gap-6 items-center flex-wrap pt-2">
                                  {FLAT_FEATURE_OPTIONS.map((feat) => {
                                    const checked = flatFeatures?.includes(feat);
                                    return (
                                      <label key={feat} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-medium cursor-pointer">
                                        <div 
                                          className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            checked 
                                              ? "bg-[#00D991] border-[#00D991] text-[#00221F]" 
                                              : "bg-white border-stone-300 dark:bg-stone-900 dark:border-stone-700 text-transparent"
                                          )}
                                        >
                                          {checked && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                          )}
                                        </div>
                                        <input 
                                          type="checkbox" 
                                          checked={checked} 
                                          onChange={() => {
                                            const updated = flatFeatures?.includes(feat)
                                              ? flatFeatures.filter(x => x !== feat)
                                              : [...(flatFeatures || []), feat];
                                            setFlatFeatures(updated);
                                          }} 
                                          className="sr-only"
                                        />
                                        <span>{feat.charAt(0).toUpperCase() + feat.slice(1)}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Dispozice *</Label>
                                  <Select value={houseLayout} onValueChange={setHouseLayout}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {HOUSE_LAYOUT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Užitná plocha (m²) *</Label>
                                  <Input 
                                    type="number" 
                                    value={houseArea} 
                                    onChange={(e) => setHouseArea(e.target.value)} 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Plocha pozemku (m²) *</Label>
                                  <Input 
                                    type="number" 
                                    value={landArea} 
                                    onChange={(e) => setLandArea(e.target.value)} 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Typ domu</Label>
                                  <Select value={houseType} onValueChange={setHouseType}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {HOUSE_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Počet podlaží</Label>
                                  <Input 
                                    type="number" 
                                    value={houseFloors} 
                                    onChange={(e) => setHouseFloors(e.target.value)} 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Stav domu</Label>
                                  <Select value={houseCondition} onValueChange={setHouseCondition}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FLAT_CONDITION_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">PENB</Label>
                                  <Select value={housePenb} onValueChange={setHousePenb}>
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PENB_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Parkování</Label>
                                  <Input 
                                    value={flatParking} 
                                    onChange={(e) => setFlatParking(e.target.value)} 
                                    placeholder="např. V domě, možnost garáže" 
                                    className="h-9 text-xs" 
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 pt-1">
                                <div className="flex gap-6 items-center flex-wrap pt-2">
                                  {HOUSE_FEATURE_OPTIONS.map((feat) => {
                                    const checked = houseFeatures?.includes(feat);
                                    return (
                                      <label key={feat} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-medium cursor-pointer">
                                        <div 
                                          className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            checked 
                                              ? "bg-[#00D991] border-[#00D991] text-[#00221F]" 
                                              : "bg-white border-stone-300 dark:bg-stone-900 dark:border-stone-700 text-transparent"
                                          )}
                                        >
                                          {checked && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                          )}
                                        </div>
                                        <input 
                                          type="checkbox" 
                                          checked={checked} 
                                          onChange={() => {
                                            const updated = houseFeatures?.includes(feat)
                                              ? houseFeatures.filter(x => x !== feat)
                                              : [...(houseFeatures || []), feat];
                                            setHouseFeatures(updated);
                                          }} 
                                          className="sr-only"
                                        />
                                        <span>{feat.charAt(0).toUpperCase() + feat.slice(1)}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Section 3: Poznámka */}
                    <div className={cn(
                      "bg-white dark:bg-stone-950 rounded-xl transition-all p-5 border",
                      isEditingNote ? "border-[#00D991] shadow-sm" : "border-stone-200/60 dark:border-stone-800"
                    )}>
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                          Poznámka
                        </span>
                        {!isEditingNote ? (
                          editFacts && (
                            <button 
                              onClick={() => setIsEditingNote(true)} 
                              className="text-xs font-semibold text-[#0E8A5F] hover:underline cursor-pointer"
                            >
                              ✎ Upravit
                            </button>
                          )
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setIsEditingNote(false);
                                setEditFacts(selectedProperty.facts_for_answers || '');
                              }} 
                              className="text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 cursor-pointer"
                            >
                              Zrušit
                            </button>
                            <button 
                              onClick={handleSaveNote} 
                              className="text-xs font-semibold bg-[#00D991] text-[#00221F] rounded-md px-3 py-1 hover:bg-[#00c583] cursor-pointer"
                            >
                              Uložit
                            </button>
                          </div>
                        )}
                      </div>

                      {!isEditingNote ? (
                        !editFacts ? (
                          <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 flex justify-between items-center bg-white dark:bg-stone-950">
                            <div className="text-left">
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                                Přidej poznámku
                              </div>
                              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                                Popis nemovitosti pro tebe i pro inzerát.
                              </div>
                            </div>
                            <button 
                              onClick={() => setIsEditingNote(true)}
                              className="text-xs font-bold text-[#0E8A5F] hover:underline cursor-pointer flex-none"
                            >
                              + Doplnit
                            </button>
                          </div>
                        ) : (
                          <div className="text-[13.5px] font-normal leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                            {editFacts}
                          </div>
                        )
                      ) : (
                        <Textarea 
                          value={editFacts} 
                          onChange={(e) => setEditFacts(e.target.value)} 
                          placeholder="Zadejte poznámku nebo fakta o nemovitosti..."
                          rows={4}
                          className="text-xs font-medium"
                        />
                      )}
                    </div>

                    {/* Section 4: Dokumenty a historie */}
                    <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                          Dokumenty a historie
                        </span>
                        <button 
                          onClick={async () => {
                            try {
                              const updated = await updateProperty(selectedProperty.id, {
                                attachments: ['LV.pdf', 'PENB.pdf']
                              });
                              setSelectedProperty(updated);
                              onRefresh();
                              toast.success('Simulované dokumenty LV.pdf a PENB.pdf byly nahrány.');
                            } catch(e: any) {
                              toast.error(e.message);
                            }
                          }}
                          className="text-xs font-bold text-[#0E8A5F] hover:underline cursor-pointer"
                        >
                          + Nahrát
                        </button>
                      </div>

                      <div className="space-y-4">
                        {!selectedProperty.attachments || selectedProperty.attachments.length === 0 ? (
                          <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 flex justify-between items-center bg-white dark:bg-stone-950">
                            <div className="text-left">
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                                Nahraj dokumenty
                              </div>
                              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                                LV a PENB budou potřeba k rezervační smlouvě.
                              </div>
                            </div>
                            <button 
                              onClick={async () => {
                                try {
                                  const updated = await updateProperty(selectedProperty.id, {
                                    attachments: ['LV.pdf', 'PENB.pdf']
                                  });
                                  setSelectedProperty(updated);
                                  onRefresh();
                                  toast.success('Simulované dokumenty LV.pdf a PENB.pdf byly nahrány.');
                                } catch(e: any) {
                                  toast.error(e.message);
                                }
                              }}
                              className="text-xs font-bold text-[#0E8A5F] hover:underline cursor-pointer flex-none"
                            >
                              + Nahrát
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-stone-100 dark:divide-stone-850">
                            {selectedProperty.attachments.map((file, idx) => (
                              <div key={idx} className="flex justify-between items-center py-2.5 text-xs min-w-0 gap-3">
                                <div className="flex items-center gap-2 text-left min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-none" />
                                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                                    {file}
                                  </span>
                                  <span className="text-[11px] text-stone-400 dark:text-stone-500 flex-none">
                                    nahráno 20. 5.
                                  </span>
                                </div>
                                <button 
                                  onClick={async () => {
                                    try {
                                      const remaining = selectedProperty.attachments?.filter((_, i) => i !== idx) || [];
                                      const updated = await updateProperty(selectedProperty.id, {
                                        attachments: remaining.length > 0 ? remaining : null
                                      });
                                      setSelectedProperty(updated);
                                      onRefresh();
                                      toast.success('Soubor byl odebrán.');
                                    } catch(e: any) {
                                      toast.error(e.message);
                                    }
                                  }}
                                  className="text-stone-400 hover:text-red-500 cursor-pointer flex-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1 pt-1.5 text-xs text-[#0E8A5F] dark:text-green-400 font-semibold text-left">
                          <div className="flex items-center gap-1 text-[13.5px]">
                            <span>+</span>
                            <span>Historie ceny: {selectedProperty.price === 5200000 ? "5 900 000 → 5 200 000" : "18 900 000 → 18 330 000"} Kč</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] ml-3 font-medium">
                            <span>↓</span>
                            <span>12. 6.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {/* 3. TAB: ZÁJEMCI */}
                {activeDetailTab === 'zajemci' && (
                  <div className="space-y-6">
                    
                    {/* Stepper progress and pills */}
                    <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800 p-3 rounded-xl">
                      {(['všichni', 'horký', 'vlažný', 'studený'] as const).map((pill) => {
                        const count = 
                          pill === 'všichni' ? propertyDeals.length :
                          pill === 'horký' ? propertyDeals.filter(d => d.temperature?.includes('horký')).length :
                          pill === 'vlažný' ? propertyDeals.filter(d => d.temperature?.includes('vlažný')).length :
                          propertyDeals.filter(d => d.temperature?.includes('studený')).length;

                        const active = zajemciFilter === pill;
                        return (
                          <button
                            key={pill}
                            onClick={() => setZajemciFilter(pill)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                              active
                                ? 'bg-[#00D991] text-[#00221F] border-[#00D991]'
                                : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                            }`}
                          >
                            <span className="capitalize">{pill}</span> · {count}
                          </button>
                        );
                      })}

                      {/* Add Buyer Autocomplete Search Button */}
                      <div className="relative ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                        {!isAddingBuyer ? (
                          <button
                            onClick={() => {
                              setIsAddingBuyer(true);
                              setSearchBuyerQuery('');
                            }}
                            className="bg-[#00D991] text-[#00221F] font-semibold text-xs px-3.5 py-2 rounded-lg hover:bg-[#00c583] flex items-center gap-1.5 w-full sm:w-auto justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" /> Přidat zájemce
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-[#00D991] rounded-lg p-1">
                            <input
                              type="text"
                              value={searchBuyerQuery}
                              onChange={(e) => setSearchBuyerQuery(e.target.value)}
                              placeholder="Hledat kupujícího..."
                              className="text-xs bg-transparent border-0 ring-0 focus:ring-0 outline-none w-44 px-2"
                              autoFocus
                            />
                            <button
                              onClick={() => setIsAddingBuyer(false)}
                              className="p-1 text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Dropdown for Autocomplete selection */}
                        {isAddingBuyer && (
                          <div className="absolute right-0 top-11 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-xl rounded-lg w-64 z-55 max-h-48 overflow-y-auto p-1.5">
                            {availableContactsToConnect
                              .filter(c => c.full_name.toLowerCase().includes(searchBuyerQuery.toLowerCase()))
                              .map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    handleConnectBuyer(c.id, c.temperature);
                                    setIsAddingBuyer(false);
                                  }}
                                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-stone-50 dark:hover:bg-stone-900 text-xs flex flex-col gap-0.5"
                                >
                                  <span className="font-semibold text-stone-900 dark:text-stone-100">{c.full_name}</span>
                                  <span className="text-stone-400 text-[10px]">{c.phone || c.email} ({c.roles.join(', ')})</span>
                                </button>
                              ))}
                            {availableContactsToConnect.filter(c => c.full_name.toLowerCase().includes(searchBuyerQuery.toLowerCase())).length === 0 && (
                              <div className="text-stone-400 text-[11px] p-2 text-center italic">
                                Žádné kontakty neodpovídají.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active buyers table/list block */}
                    {filteredDeals.length === 0 ? (
                      <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-10 text-center flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          Zatím žádní zájemci.
                        </span>
                        <span className="text-xs text-stone-400 dark:text-stone-500 mb-2">
                          Přidej prvního, nebo propoj doporučené z databáze níže.
                        </span>
                        <button 
                          onClick={() => setIsAddingBuyer(true)}
                          className="bg-[#00D991] text-[#00221F] font-semibold text-xs px-3.5 py-2 rounded-lg hover:bg-[#00c583] flex items-center gap-1.5"
                        >
                          + Přidat zájemce
                        </button>
                      </div>
                    ) : (
                      <div className="border border-stone-200/60 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 p-1 md:p-3 space-y-2.5">
                        {filteredDeals.map((deal) => {
                          const buyerContact = contacts.find((c) => c.id === deal.buyer_id);
                          const isEditingThisDeal = editingDealId === deal.id;
                          
                          const isHorky = deal.temperature?.includes('horký');
                          const isVlazny = deal.temperature?.includes('vlažný');

                          return (
                            <div 
                              key={deal.id} 
                              className={`border-b last:border-b-0 border-stone-100 dark:border-stone-900/60 p-4 transition ${
                                isEditingThisDeal ? 'bg-[#FCFDFC] dark:bg-stone-900/40 border border-[#00D991] rounded-xl my-2' : ''
                              }`}
                            >
                              {!isEditingThisDeal ? (
                                <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs">
                                  {/* Left: Contact Info */}
                                  <div className="w-[200px] flex-none">
                                    <button 
                                      onClick={() => {
                                        setIsDetailOpen(false);
                                        if (buyerContact) onNavigateToContact(buyerContact.id);
                                      }}
                                      className="font-semibold text-stone-950 dark:text-stone-100 hover:text-[#0E8A5F] text-[14px] hover:underline block text-left"
                                    >
                                      {buyerContact?.full_name}
                                    </button>
                                    {buyerContact?.phone && (
                                      <a 
                                        href={`tel:${buyerContact.phone}`} 
                                        className="text-[12.5px] text-[#0E8A5F] hover:underline mt-0.5 block font-medium"
                                      >
                                        {buyerContact.phone}
                                      </a>
                                    )}
                                  </div>

                                  {/* Temp Badge */}
                                  <div className="flex-none">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${
                                      isHorky 
                                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900' 
                                        : isVlazny 
                                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900' 
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                    }`}>
                                      {isHorky ? 'Horký' : isVlazny ? 'Vlažný' : 'Studený'}
                                    </span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-[150px] flex-none">
                                    {renderProgressBar(deal.stage)}
                                  </div>

                                  {/* Stage text */}
                                  <div className="w-[80px] flex-none text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wide text-[10px]">
                                    {deal.stage}
                                  </div>

                                  {/* Next step */}
                                  <div className="flex-1 text-stone-900 dark:text-stone-200">
                                    {deal.next_step ? (
                                      <span>
                                        Další krok: <span className="font-medium text-stone-800 dark:text-stone-300">{deal.next_step}</span>
                                      </span>
                                    ) : (
                                      <span className="italic text-stone-400">Chybí další krok</span>
                                    )}
                                  </div>

                                  {/* Edit button */}
                                  <button
                                    onClick={() => {
                                      setEditingDealId(deal.id);
                                      setEditDealStage(deal.stage);
                                      setEditDealTemperature(deal.temperature || 'vlažný (B)');
                                      setEditDealNextStep(deal.next_step || '');
                                    }}
                                    className="text-[#0E8A5F] hover:underline font-semibold flex items-center gap-1 flex-none"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Upravit
                                  </button>
                                </div>
                              ) : (
                                /* Inline edit state */
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                                      {buyerContact?.full_name} — úprava
                                    </span>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => setEditingDealId(null)}
                                        className="text-xs font-medium text-stone-500 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50"
                                      >
                                        Zrušit
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateDealInline(deal.id)}
                                        className="text-xs font-semibold bg-[#00D991] text-[#00221F] rounded-md px-3 py-1 hover:bg-[#00c583]"
                                      >
                                        Uložit
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                    <div className="space-y-1.5 text-left">
                                      <Label>Fáze</Label>
                                      <Select value={editDealStage} onValueChange={setEditDealStage}>
                                        <SelectTrigger className="h-9 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {['lead', 'kontaktován', 'kvalifikován', 'prohlídka', 'nabídka', 'rezervace', 'podpis', 'prohráno'].map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                      <Label>Teplota</Label>
                                      <Select value={editDealTemperature} onValueChange={setEditDealTemperature}>
                                        <SelectTrigger className="h-9 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="horký (A)">Horký (A)</SelectItem>
                                          <SelectItem value="vlažný (B)">Vlažný (B)</SelectItem>
                                          <SelectItem value="studený (C)">Studený (C)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                      <Label>Další krok</Label>
                                      <Input 
                                        value={editDealNextStep} 
                                        onChange={(e) => setEditDealNextStep(e.target.value)} 
                                        placeholder="Další krok..."
                                        className="h-9 text-xs border-[#00D991]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Recommendations from CRM Database */}
                    <div className="border border-stone-200/60 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 p-5">
                      <div className="flex justify-between items-baseline mb-3">
                        <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                          Doporučení z databáze · {recommendations.length}
                        </span>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">
                          Vlastník nemovitosti se nikdy nenabízí
                        </span>
                      </div>

                      {recommendations.length === 0 ? (
                        <div className="text-xs text-stone-400 italic py-3 text-center">
                          V databázi nejsou žádní kupující s odpovídající poptávkou.
                        </div>
                      ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-900">
                          {recommendations.map((c) => (
                            <div key={c.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 gap-4 text-xs">
                              <div>
                                <button
                                  onClick={() => {
                                    setIsDetailOpen(false);
                                    onNavigateToContact(c.id);
                                  }}
                                  className="font-medium text-stone-900 dark:text-stone-100 hover:text-[#0E8A5F] hover:underline block text-left"
                                >
                                  {c.full_name}
                                </button>
                                <div className="text-stone-400 text-[11px] mt-0.5 leading-snug">
                                  Hledá {c.seeking_layout?.join(', ') || 'jakýkoliv layout'} v lokalitě {c.seeking_location?.join(', ') || 'všude'} do {c.budget_to?.toLocaleString('cs-CZ')} Kč
                                </div>
                              </div>
                              <button
                                onClick={() => handleConnectBuyer(c.id, c.temperature)}
                                className="bg-[#00D991] text-[#00221F] font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-[#00c583] flex-none"
                              >
                                Propojit
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 4. TAB: EKONOMIKA */}
                {activeDetailTab === 'ekonomika' && (
                  <div className="space-y-6">
                    
                    {/* Commission block */}
                    <div className="bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                          Provize
                        </span>
                        {!isEditingCommission ? (
                          (selectedProperty.commission_pct || selectedProperty.commission_val) && (
                            <button 
                              onClick={() => setIsEditingCommission(true)} 
                              className="text-xs font-semibold text-[#0E8A5F] flex items-center gap-1 hover:underline"
                            >
                              <Edit className="w-3.5 h-3.5" /> Upravit
                            </button>
                          )
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setIsEditingCommission(false);
                                setCommissionPct(selectedProperty.commission_pct ? selectedProperty.commission_pct.toString() : '');
                                setCommissionVal(selectedProperty.commission_val ? selectedProperty.commission_val.toString() : '');
                                setEditCommissionStatus(selectedProperty.commission_status as 'očekávaná' | 'potvrzená' || 'očekávaná');
                              }} 
                              className="text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2.5 py-1"
                            >
                              Zrušit
                            </button>
                            <button 
                              onClick={handleSaveCommission} 
                              className="text-xs font-semibold bg-[#00D991] text-[#00221F] rounded-md px-3 py-1 hover:bg-[#00c583]"
                            >
                              Uložit
                            </button>
                          </div>
                        )}
                      </div>

                      {!isEditingCommission ? (
                        !(selectedProperty.commission_pct || selectedProperty.commission_val) ? (
                          <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-7 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-semibold text-stone-900 dark:text-stone-100">Nastav provizi</div>
                              <div className="text-stone-400 mt-1">Zadej % nebo Kč — druhé dopočítám z ceny {propertyPrice.toLocaleString('cs-CZ')} Kč.</div>
                            </div>
                            <button 
                              onClick={() => setIsEditingCommission(true)}
                              className="text-xs font-semibold text-[#0E8A5F] hover:underline"
                            >
                              + Nastavit
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-3 flex-wrap">
                            {selectedProperty.commission_pct && (
                              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                                {selectedProperty.commission_pct} % z {propertyPrice.toLocaleString('cs-CZ')} Kč
                              </span>
                            )}
                            <span className="text-stone-400">→</span>
                            <span className="text-xl font-bold text-stone-950 dark:text-white tabular-nums">
                              {commValNum.toLocaleString('cs-CZ')} Kč
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${
                              commissionStatus === 'potvrzená' 
                                ? 'bg-[#DCF5E7] text-[#0B5C3D] border border-green-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {commissionStatus}
                            </span>
                          </div>
                        )
                      ) : (
                        /* Editing commission inputs */
                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="space-y-1.5 text-left">
                              <Label>Provize (%)</Label>
                              <Input 
                                type="number" 
                                value={commissionPct} 
                                onChange={(e) => {
                                  const pctStr = e.target.value;
                                  setCommissionPct(pctStr);
                                  const pct = parseSafeNumber(pctStr);
                                  if (pct !== null) {
                                    setCommissionVal(Math.round(propertyPrice * (pct / 100)).toString());
                                  }
                                }} 
                                className="h-9 border-[#00D991]"
                              />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <Label>Provize (Kč) — dopočítáno</Label>
                              <Input 
                                type="number" 
                                value={commissionVal} 
                                onChange={(e) => {
                                  const valStr = e.target.value;
                                  setCommissionVal(valStr);
                                  const val = parseSafeNumber(valStr);
                                  if (val !== null && propertyPrice > 0) {
                                    setCommissionPct(((val / propertyPrice) * 100).toFixed(2));
                                  }
                                }} 
                                className="h-9 border-[#00D991]"
                              />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <Label className="block mb-2">Stav provize</Label>
                              <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1 w-fit">
                                <button
                                  type="button"
                                  onClick={() => setEditCommissionStatus('očekávaná')}
                                  className={`px-3 py-1 rounded-[6px] text-xs font-medium transition ${
                                    editCommissionStatus === 'očekávaná' 
                                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' 
                                      : 'text-stone-400 hover:text-stone-600'
                                  }`}
                                >
                                  Očekávaná
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditCommissionStatus('potvrzená')}
                                  className={`px-3 py-1 rounded-[6px] text-xs font-medium transition ${
                                    editCommissionStatus === 'potvrzená' 
                                      ? 'bg-white dark:bg-stone-900 text-[#0B5C3D] dark:text-green-400 shadow-sm' 
                                      : 'text-stone-400 hover:text-stone-600'
                                  }`}
                                >
                                  Potvrzená
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
                            Zadej % nebo Kč — druhé se automaticky dopočítá z kupní ceny.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expenses list block */}
                    <div className="bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                          Náklady nemovitosti
                        </span>
                        {!isAddingExpense && (
                          <button 
                            onClick={() => {
                              setIsAddingExpense(true);
                              setNewExpenseName('');
                              setNewExpenseValue('');
                            }}
                            className="text-xs font-semibold text-[#0E8A5F] hover:underline"
                          >
                            + Přidat náklad
                          </button>
                        )}
                      </div>

                      {/* Adder inline inputs */}
                      {isAddingExpense && (
                        <div className="border border-[#00D991] rounded-lg p-4 bg-stone-50 dark:bg-stone-900/40 mb-4 text-xs space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-stone-900">Nový náklad</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setIsAddingExpense(false)}
                                className="text-[11px] font-medium text-stone-500 border border-stone-200 px-2 py-0.5 rounded-md hover:bg-stone-100"
                              >
                                Zrušit
                              </button>
                              <button 
                                onClick={() => {
                                  if (!newExpenseName || !newExpenseValue) {
                                    toast.error('Název i hodnota nákladu jsou povinné.');
                                    return;
                                  }
                                  const val = parseSafeNumber(newExpenseValue);
                                  if (val === null) {
                                    toast.error('Hodnota musí být číslo.');
                                    return;
                                  }
                                  const updated = [...expenseList, { name: newExpenseName, value: val }];
                                  handleSaveExpense(updated);
                                  setIsAddingExpense(false);
                                }}
                                className="text-[11px] font-semibold bg-[#00D991] text-[#00221F] px-2.5 py-0.5 rounded-md hover:bg-[#00c583]"
                              >
                                Uložit
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label>Název nákladu</Label>
                              <Input 
                                value={newExpenseName} 
                                onChange={(e) => setNewExpenseName(e.target.value)} 
                                placeholder="Např. Staging, Fotograf..."
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Částka (Kč)</Label>
                              <Input 
                                type="number" 
                                value={newExpenseValue} 
                                onChange={(e) => setNewExpenseValue(e.target.value)} 
                                placeholder="Částka v Kč"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expenses List */}
                      {expenseList.length === 0 ? (
                        <div className="border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center flex flex-col items-center gap-3">
                          <span className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                            Zatím žádné náklady. Přidej inzerci, fotografa nebo home staging, ať víš, co ti zakázka reálně vynese.
                          </span>
                          <button 
                            onClick={() => setIsAddingExpense(true)}
                            className="text-xs font-semibold text-[#0E8A5F] hover:underline"
                          >
                            + Přidat náklad
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs">
                          {expenseList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-stone-100 dark:border-stone-900/60 last:border-b-0">
                              <span className="text-stone-800 dark:text-stone-200 font-medium">{item.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-stone-900 dark:text-stone-100 font-semibold tabular-nums">
                                  {item.value.toLocaleString('cs-CZ')} Kč
                                </span>
                                <button 
                                  onClick={() => {
                                    const updated = expenseList.filter((_, i) => i !== idx);
                                    handleSaveExpense(updated);
                                  }}
                                  className="text-stone-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-3 border-t border-stone-200 dark:border-stone-800 font-bold text-stone-900 dark:text-stone-100 mt-2 text-sm">
                            <span>Celkem náklady</span>
                            <span className="tabular-nums">{totalExpenses.toLocaleString('cs-CZ')} Kč</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Net commission block */}
                    <div className={`flex justify-between items-center rounded-xl p-4 md:p-5 ${
                      selectedProperty.commission_pct || selectedProperty.commission_val
                        ? 'bg-[#DCF5E7] dark:bg-green-950/20 text-[#0B5C3D] dark:text-green-300'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-500'
                    }`}>
                      <div>
                        <span className="text-sm font-bold block">Čistá provize</span>
                        <span className="text-xs opacity-75 mt-0.5 leading-normal block">
                          {(selectedProperty.commission_pct || selectedProperty.commission_val) 
                            ? 'provize − náklady · jen ke čtení' 
                            : 'doplní se po nastavení provize'}
                        </span>
                      </div>
                      <span className="text-2xl font-bold tabular-nums">
                        {(selectedProperty.commission_pct || selectedProperty.commission_val) 
                          ? `${netCommission.toLocaleString('cs-CZ')} Kč` 
                          : '—'}
                      </span>
                    </div>

                  </div>
                )}

              </div>

              {/* FOOTER ACTION BAR */}
              <div className="px-6 py-4 border-t border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-950 flex justify-end">
                <Button 
                  onClick={() => setIsDetailOpen(false)}
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium"
                >
                  Zavřít panel
                </Button>
              </div>

            </DialogContent>
          </Dialog>
        );
      })()}
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
