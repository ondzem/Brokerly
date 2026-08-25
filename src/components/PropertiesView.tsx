import React, { useState, useEffect, useRef } from 'react';
import { Property, Contact, Deal, Activity, PropertyDocument } from '@/types';
import { createProperty, updateProperty, createContact, deleteProperty, createDeal, updateDeal } from '@/lib/db';
import { cn } from '@/lib/utils';
import { OptionSelect } from '@/components/ui/option-select';
import { ChipPicker } from '@/components/ui/chip-picker';
import { uploadPropertyDocument } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PhotoUploader } from '@/components/PhotoUploader';
import { Search, Plus, Home, User, Briefcase, DollarSign, MapPin, LayoutGrid, List, SlidersHorizontal, FileText, CheckCircle2, Trash2, Edit, X, ChevronRight, Calendar, ArrowRight, Upload, Sparkles, FileUp, MoreHorizontal, Building2, Trees, Store, Warehouse, AlertTriangle } from 'lucide-react';

const KIND_OPTIONS = [
  { id: 'byt', label: 'byt' },
  { id: 'dům', label: 'dům' },
  { id: 'pozemek', label: 'pozemek' },
  { id: 'komerční', label: 'komerční' },
  { id: 'garáž/ostatní', label: 'garáž' },
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

const FLAT_LAYOUT_OPTIONS = ['garsoniéra', '1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6 a více', 'atypické'] as const;
const OWNERSHIP_OPTIONS = ['osobní', 'družstevní', 'SVJ', 'státní / obecní'] as const;
const CONSTRUCTION_OPTIONS = ['cihla', 'panel', 'skelet', 'dřevostavba', 'montovaná', 'smíšená', 'kamenná'] as const;
// Stav objektu — škála podle Sreality, doplněná o fáze rozestavěnosti
const FLAT_CONDITION_OPTIONS = [
  'novostavba',
  'po rekonstrukci',
  'velmi dobrý',
  'dobrý',
  'před rekonstrukcí',
  'v rekonstrukci',
  've výstavbě',
  'projekt',
  'k demolici',
] as const;
const FLAT_FEATURE_OPTIONS = ['výtah', 'balkon/lodžie', 'terasa', 'sklep', 'garáž', 'parkovací stání', 'zahrada', 'podlahové vytápění', 'klimatizace', 'bezbariérový'] as const;
const PENB_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'zatím nezpracován'] as const;

const HOUSE_LAYOUT_OPTIONS = ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6+kk', '6+1', '7 a více', 'atypické'] as const;
const HOUSE_TYPE_OPTIONS = [
  'samostatný',
  'řadový — vnitřní',
  'řadový — krajní',
  'dvojdomek',
  'vila',
  'chalupa / chata',
  'roubenka / srub',
  'zemědělská usedlost',
] as const;
const HOUSE_FEATURE_OPTIONS = ['garáž', 'parkovací stání', 'zahrada', 'bazén', 'terasa', 'balkon', 'sklep', 'podsklepený', 'krb', 'podlahové vytápění', 'klimatizace', 'fotovoltaika'] as const;

// Taxonomie podle kategorií Sreality (komerční prostory)
const COMM_SUBTYPE_OPTIONS = [
  'kancelář',
  'obchodní prostor',
  'sklad',
  'výrobní prostor',
  'restaurace / gastro',
  'ubytování',
  'ordinace',
  'zemědělský objekt',
  'činžovní dům',
  'hotel / penzion',
  'výrobní hala',
  'sportovní objekt',
  'pozemek pro komerci',
] as const;
const RENT_EQUIPMENT_OPTIONS = ['vybaveno', 'částečně vybaveno', 'nevybaveno', 'po domluvě'] as const;

// Průvodce: pět otázek, jedna na obrazovku
const WIZARD_STEPS = [
  { key: 'druh', label: 'Druh', question: 'Co dáváte do nabídky?', hint: 'Podle druhu se zeptám na správné parametry.' },
  { key: 'adresa', label: 'Adresa', question: 'Kde to stojí?', hint: 'Ulice a město stačí.' },
  { key: 'parametry', label: 'Parametry', question: 'Jak je to velké?', hint: 'Jen to podstatné — zbytek doplníte kdykoli později.' },
  { key: 'fotky', label: 'Fotky', question: 'Máte fotky?', hint: 'Nepovinné — dají se doplnit i později na kartě nemovitosti.' },
  { key: 'cena', label: 'Cena', question: 'Za kolik?', hint: 'Cenu za metr spočítám průběžně.' },
  { key: 'vlastnik', label: 'Vlastník', question: 'Čí to je?', hint: 'Vyberte z kontaktů, nebo rovnou založte nový.' },
] as const;

// Co se skrývá pod „ostatní parametry" — popisek podle druhu
const MORE_PARAMS_HINT: Record<string, string> = {
  byt: 'Patro, vlastnictví, konstrukce, PENB, vybavení · popis, provize',
  'dům': 'Typ domu, podlaží, stav, PENB, garáž a zahrada · popis, provize',
  pozemek: 'Územní plán, přístup, rozměry, sítě · popis, provize',
  'komerční': 'Stav a vybavenost, parkování, PENB · popis, provize',
  'garáž/ostatní': 'Stav, vjezd a přístup · popis, provize',
};

const KIND_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  byt: Building2,
  'dům': Home,
  pozemek: Trees,
  'komerční': Store,
  'garáž/ostatní': Warehouse,
};

// Pozemky — druhy podle kategorií Sreality, zbytek podle běžné praxe v ČR
const LAND_TYPE_OPTIONS = [
  'bydlení',
  'komerční',
  'pole',
  'louka',
  'les',
  'rybník',
  'sady / vinice',
  'zahrada',
  'rekreace',
  'ostatní',
] as const;
const LAND_UTILITY_OPTIONS = ['elektřina', 'voda', 'plyn', 'kanalizace', 'studna', 'čistička', 'internet'] as const;
const ZONING_PLAN_OPTIONS = [
  'zastavitelné — bydlení',
  'zastavitelné — smíšené obytné',
  'zastavitelné — komerce / výroba',
  'zastavitelné — rekreace',
  'nezastavitelné — zemědělská půda',
  'nezastavitelné — les',
  'nezastavitelné — ostatní',
  'není součástí územního plánu',
  'zatím nezjištěno',
] as const;
// Garáž / ostatní — sdílí comm_* sloupce, vlastní sadu v DB nemá
const GARAGE_SUBTYPE_OPTIONS = [
  'garáž',
  'garážové stání',
  'parkovací stání',
  'sklad',
  'kůlna',
  'dílna',
  'ateliér',
  'sklep / kóje',
  'ostatní',
] as const;
const GARAGE_CONDITION_OPTIONS = FLAT_CONDITION_OPTIONS;
// Garáž/ostatní ukládá své parametry do stejných comm_* sloupců jako komerční —
// vlastní sadu sloupců v DB nemá a zakládat ji kvůli čtyřem polím by bylo zbytečné.
const usesCommColumns = (kind: Property['kind']) => kind === 'komerční' || kind === 'garáž/ostatní';

const LAND_ACCESS_OPTIONS = [
  'asfaltová cesta',
  'zpevněná cesta',
  'nezpevněná cesta',
  'polní cesta',
  'přímo z ulice',
  'přes cizí pozemek',
  'bez přístupu',
] as const;

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
  const [kindFilter, setKindFilter] = useState<'vše' | 'byt' | 'dům' | 'pozemek' | 'komerční' | 'garáž/ostatní'>('vše');
  const [statusFilter, setStatusFilter] = useState<'vše' | 'akvizice' | 'v nabídce' | 'rezervováno' | 'uzavřeno'>('vše');
  const [isMobileFiltersExpanded, setIsMobileFiltersExpanded] = useState(false);
  const [isDesktopFiltersOpen, setIsDesktopFiltersOpen] = useState(false);

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

  // Průvodce přidáním nemovitosti: rozcestí → kroky → hotovo.
  // 'vse' je původní formulář na jedné stránce (expertní režim).
  type CreateMode = 'rozcestí' | 'import' | 'kroky' | 'vse' | 'hotovo';
  const [createMode, setCreateMode] = useState<CreateMode>('rozcestí');
  const [wizardStep, setWizardStep] = useState(0);
  const [importLines, setImportLines] = useState<{ label: string; value: string }[]>([]);
  const [importStage, setImportStage] = useState<string>('');
  const [createdSummary, setCreatedSummary] = useState<Property | null>(null);
  const [showMoreParams, setShowMoreParams] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [editNote, setEditNote] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [photoPending, setPhotoPending] = useState(false);   // načtená fotka bez potvrzeného ořezu
  const [photoWarning, setPhotoWarning] = useState(false);   // upozornění „přijdete o ni"
  const [photoDraft, setPhotoDraft] = useState('');

  // Našeptávač adres (Photon nad daty OpenStreetMap — zdarma, bez klíče)
  type AddrSuggestion = { label: string; detail: string };
  const [addrSuggestions, setAddrSuggestions] = useState<AddrSuggestion[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const addrPickedRef = React.useRef(false);
  const addrListRef = React.useRef<HTMLDivElement>(null);

  // Create form: collapsed optional section (foto, provize, poznámka)
  const [showOptional, setShowOptional] = useState(false);
  const optionalSectionRef = React.useRef<HTMLDivElement>(null);
  const createScrollRef = React.useRef<HTMLDivElement>(null);

  // Po rozbalení odroluj na sekci — jinak se obsah otevře mimo viditelnou část
  // a uživatel nevidí, že se něco stalo. scrollIntoView uvnitř dialogu nefunguje
  // spolehlivě, proto posouváme scroll kontejner ručně.
  const toggleOptional = () => {
    const next = !showOptional;
    setShowOptional(next);
    if (!next) return;
    // setTimeout, ne requestAnimationFrame — rAF se neprovede, když je záložka skrytá
    window.setTimeout(() => {
      const scroller = createScrollRef.current;
      const section = optionalSectionRef.current;
      if (!scroller || !section) return;
      // offsetTop řetěz místo getBoundingClientRect — nezávisí na velikosti viewportu
      let top = 0;
      let node: HTMLElement | null = section;
      while (node && node !== scroller) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      const target = Math.max(0, top - 12);
      scroller.scrollTo({ top: target, behavior: 'smooth' });
      // Plynulý scroll některé prohlížeče (a reduced-motion) ignorují — dorovnej ho.
      window.setTimeout(() => {
        if (Math.abs(scroller.scrollTop - target) > 4) scroller.scrollTop = target;
      }, 350);
    }, 0);
  };

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

  // Komerční specific states
  const [commSubtype, setCommSubtype] = useState<string>('');
  const [commFloorArea, setCommFloorArea] = useState('');
  const [commCondition, setCommCondition] = useState('');
  const [commParking, setCommParking] = useState('');
  const [commPenb, setCommPenb] = useState<string>('');

  // Pronájem, Provize and Photo states
  const [rentDeposit, setRentDeposit] = useState('');
  const [rentFeesUtilities, setRentFeesUtilities] = useState('');
  const [rentDuration, setRentDuration] = useState('');
  const [rentAvailableFrom, setRentAvailableFrom] = useState('');
  const [rentEquipment, setRentEquipment] = useState<string>('');
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

  // Sync edits when selectedProperty changes. Tab/edit-state reset happens only
  // when a different property is opened — a save updates the same property and
  // must leave the user on the tab they were working in.
  const openedPropertyIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProperty) {
      setEditOwnerId(selectedProperty.owner_id);
      setEditKind(selectedProperty.kind);
      setEditTransaction(selectedProperty.transaction);
      setEditAddress(selectedProperty.address);
      setEditOfferStatus(selectedProperty.offer_status);
      setEditPrice(selectedProperty.price.toString());
      setEditFacts(selectedProperty.facts_for_answers || '');
      setEditNote(selectedProperty.note || '');
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

      // Komerční specific
      setCommSubtype(selectedProperty.comm_subtype || '');
      setCommFloorArea(selectedProperty.comm_floor_area ? selectedProperty.comm_floor_area.toString() : '');
      setCommCondition(selectedProperty.comm_condition_equipment || '');
      setCommParking(selectedProperty.comm_parking_entrance || '');
      setCommPenb(selectedProperty.comm_penb || '');

      // Rent, Commission, and Photo
      setRentDeposit(selectedProperty.rent_deposit ? selectedProperty.rent_deposit.toString() : '');
      setRentFeesUtilities(selectedProperty.rent_fees_utilities ? selectedProperty.rent_fees_utilities.toString() : '');
      setRentDuration(selectedProperty.rent_duration || '');
      setRentAvailableFrom(selectedProperty.rent_available_from || '');
      setRentEquipment(selectedProperty.rent_equipment || '');
      setCommissionPct(selectedProperty.commission_pct ? selectedProperty.commission_pct.toString() : '');
      setCommissionVal(selectedProperty.commission_val ? selectedProperty.commission_val.toString() : '');
      setPhotoUrl(selectedProperty.attachments?.[0] || '');

      setEditCommissionStatus(selectedProperty.commission_status || 'očekávaná');

      // Reset tabs and sections edit states — only on opening a different property
      if (openedPropertyIdRef.current !== selectedProperty.id) {
        openedPropertyIdRef.current = selectedProperty.id;
        setActiveDetailTab('prehled');
        setIsEditingGeneral(false);
        setIsEditingSpecifics(false);
        setIsEditingNote(false);
        setIsEditingCommission(false);
        setIsAddingExpense(false);
        setNewExpenseName('');
        setNewExpenseValue('');
        setZajemciFilter('všichni');
        setIsAddingBuyer(false);
        setSearchBuyerQuery('');
        setEditingDealId(null);
        setIsHeaderMenuOpen(false);
      }
    } else {
      openedPropertyIdRef.current = null;
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

  const handleFlatFeatureToggle = (feat: string) => {
    const target = flatFeatures || [];
    if (target.includes(feat)) {
      setFlatFeatures(target.filter((f) => f !== feat));
    } else {
      setFlatFeatures([...target, feat]);
    }
  };

  // Zasíťování se v DB drží jako TEXT[], ve formuláři jako čárkami oddělený řetězec.
  // Checkboxy s ním pracují přes tyhle dva helpery, aby se nic z importu neztratilo.
  // Našeptávač adres — Photon nad OpenStreetMap. Bbox omezuje výsledky na ČR,
  // takže makléři stačí napsat ulici a vybrat konkrétní dům ze seznamu.
  useEffect(() => {
    if (createMode !== 'kroky' || WIZARD_STEPS[wizardStep]?.key !== 'adresa') return;
    if (addrPickedRef.current) { addrPickedRef.current = false; return; }
    const q = newAddress.trim();
    if (q.length < 3) { setAddrSuggestions([]); setAddrLoading(false); return; }

    let cancelled = false;
    setAddrLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=default&limit=6&bbox=12.09,48.55,18.86,51.06`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('geokodér nedostupný');
        const data = await res.json();
        if (cancelled) return;
        const seen = new Set<string>();
        const items: AddrSuggestion[] = [];
        for (const f of data.features || []) {
          const pr = f.properties || {};
          if (pr.countrycode && pr.countrycode !== 'CZ') continue;
          const street = pr.street || pr.name;
          if (!street) continue;
          const label = [street, pr.housenumber].filter(Boolean).join(' ');
          const city = pr.city || pr.town || pr.village || pr.county || '';
          const detail = [pr.district, city, pr.postcode].filter(Boolean).join(' · ');
          const key = `${label}|${city}`;
          if (seen.has(key)) continue;
          seen.add(key);
          items.push({ label: city ? `${label}, ${city}` : label, detail });
        }
        setAddrSuggestions(items);
        setAddrOpen(items.length > 0);
        // Seznam je v toku stránky — odroluj, aby nebyl schovaný pod patičkou dialogu
        if (items.length > 0) {
          window.setTimeout(() => {
            const scroller = createScrollRef.current;
            const list = addrListRef.current;
            if (!scroller || !list) return;
            const overflow = list.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom;
            if (overflow > 0) scroller.scrollTop += overflow + 16;
          }, 60);
        }
      } catch {
        if (!cancelled) setAddrSuggestions([]);
      } finally {
        if (!cancelled) setAddrLoading(false);
      }
    }, 320);

    return () => { cancelled = true; window.clearTimeout(timer); setAddrLoading(false); };
  }, [newAddress, createMode, wizardStep]);

  const pickAddress = (value: string) => {
    addrPickedRef.current = true;
    setNewAddress(value);
    setAddrSuggestions([]);
    setAddrOpen(false);
    setShowMoreParams(false);
    setPhotoUrls([]);
    setPhotoDraft('');
  };

  // Podmínky pro přechod na další krok průvodce
  const wizardStepValid = (() => {
    if (createMode !== 'kroky') return true;
    switch (WIZARD_STEPS[wizardStep]?.key) {
      case 'druh':
        return Boolean(newKind && newTransaction);
      case 'adresa':
        return newAddress.trim().length > 2;
      case 'parametry':
        if (newKind === 'byt') return Boolean(flatLayout && flatArea);
        if (newKind === 'dům') return Boolean(houseLayout && houseArea && landArea);
        if (newKind === 'pozemek') return Boolean(landSize);
        return Boolean(commSubtype);
      case 'fotky':
        return true; // nepovinné
      case 'cena':
        return Boolean(newPrice) && Number(newPrice) > 0;
      case 'vlastnik':
        return ownerMode === 'select'
          ? Boolean(newOwnerId)
          : Boolean(newOwnerFullName && (newOwnerPhone || newOwnerEmail));
      default:
        return true;
    }
  })();

  const onPhotoStep = createMode === 'kroky' && WIZARD_STEPS[wizardStep]?.key === 'fotky';

  // Ořez potvrzený nebo zahozený → upozornění je bezpředmětné a další fotka
  // musí dostat vlastní varování, ne zdědit odklepnuté.
  useEffect(() => {
    if (!photoPending) setPhotoWarning(false);
  }, [photoPending]);

  /**
   * Na kroku s fotkami první kliknutí jen upozorní, že rozdělaný ořez není
   * potvrzený — teprve druhé pustí dál. Fotka se jinak tiše ztratí (krok se
   * odmountuje) a uživatel se to dozví až na kartě nemovitosti.
   */
  const goToNextStep = () => {
    if (onPhotoStep && photoPending && !photoWarning) {
      setPhotoWarning(true);
      return;
    }
    setPhotoWarning(false);
    setWizardStep(wizardStep + 1);
  };

  // Popis nemovitosti pro nadpisy („Byt 3+kk", „Pozemek — pole")
  const describeProperty = (p: Property) => {
    if (p.kind === 'byt') return `Byt ${p.flat_layout || ''}`.trim();
    if (p.kind === 'dům') return `Dům ${p.house_layout || ''}`.trim();
    if (p.kind === 'pozemek') return p.land_type ? `Pozemek — ${p.land_type}` : 'Pozemek';
    if (p.kind === 'komerční') return p.comm_subtype ? `Komerční — ${p.comm_subtype}` : 'Komerční prostor';
    return p.comm_subtype || 'Garáž';
  };

  // Živý souhrn v průvodci — co už je vyplněné
  const wizardArea = newKind === 'byt' ? flatArea : newKind === 'dům' ? houseArea : newKind === 'pozemek' ? landSize : commFloorArea;
  const wizardSummary = [
    newKind ? `${newKind} · ${newTransaction}` : '',
    newAddress,
    newKind === 'byt' ? flatLayout : newKind === 'dům' ? houseLayout : commSubtype || landType,
    wizardArea ? `${wizardArea} m²` : '',
    newPrice ? `${Number(newPrice).toLocaleString('cs-CZ')} Kč` : '',
    contacts.find((c) => c.id === newOwnerId)?.full_name || (ownerMode === 'new' ? newOwnerFullName : ''),
  ].filter(Boolean) as string[];

  const pricePerM2 =
    newPrice && wizardArea && Number(wizardArea) > 0
      ? Math.round(Number(newPrice) / Number(wizardArea)).toLocaleString('cs-CZ')
      : null;

  const landUtilityList = landUtilities.split(',').map((s) => s.trim()).filter(Boolean);
  const toggleLandUtility = (util: string) => {
    const next = landUtilityList.includes(util)
      ? landUtilityList.filter((u) => u !== util)
      : [...landUtilityList, util];
    setLandUtilities(next.join(', '));
  };

  const handleHouseFeatureToggle = (feat: string) => {
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

        // Komerční details (comm_parking_entrance sdílí i byt — parkování)
        comm_subtype: usesCommColumns(editKind) ? commSubtype || null : null,
        comm_floor_area: usesCommColumns(editKind) && commFloorArea ? parseSafeNumber(commFloorArea) : null,
        comm_condition_equipment: usesCommColumns(editKind) ? commCondition || null : null,
        comm_parking_entrance: usesCommColumns(editKind) ? commParking || null : editKind === 'byt' ? flatParking || null : null,
        comm_penb: editKind === 'komerční' ? commPenb || null : null,

        // Rent, Commission, and Photo
        rent_deposit: editTransaction === 'pronájem' ? parseSafeNumber(rentDeposit) : null,
        rent_fees_utilities: editTransaction === 'pronájem' ? parseSafeNumber(rentFeesUtilities) : null,
        rent_duration: editTransaction === 'pronájem' ? rentDuration || null : null,
        rent_available_from: editTransaction === 'pronájem' ? rentAvailableFrom || null : null,
        rent_equipment: editTransaction === 'pronájem' ? rentEquipment || null : null,
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
      // Změna ceny se zapíše do historie — dřív se v kartě zobrazovala
      // dvě natvrdo napsaná čísla, která k nemovitosti nepatřila.
      const nextHistory =
        parsedPrice !== selectedProperty.price
          ? [
              ...(selectedProperty.price_history ?? []),
              { from: selectedProperty.price, to: parsedPrice, changed_at: new Date().toISOString() },
            ]
          : undefined;

      const updated = await updateProperty(selectedProperty.id, {
        owner_id: editOwnerId,
        transaction: editTransaction,
        offer_status: editOfferStatus,
        price: parsedPrice,
        address: editAddress,
        ...(nextHistory ? { price_history: nextHistory } : {}),
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
      } else if (editKind === 'pozemek') {
        updateData.land_size = parseSafeNumber(landSize);
        updateData.land_type = landType || null;
        updateData.land_utilities = landUtilities ? landUtilities.split(',').map((s) => s.trim()).filter(Boolean) : null;
        updateData.zoning_plan = zoningPlan || null;
        updateData.land_access = landAccess || null;
        updateData.land_dimensions = landDimensions || null;
      } else if (usesCommColumns(editKind)) {
        updateData.comm_subtype = commSubtype || null;
        updateData.comm_floor_area = parseSafeNumber(commFloorArea);
        updateData.comm_condition_equipment = commCondition || null;
        updateData.comm_parking_entrance = commParking || null;
        updateData.comm_penb = commPenb || null;
      }

      // Pronájem — platí pro každý druh, ukládá se ze stejné karty
      if (editTransaction === 'pronájem') {
        updateData.rent_deposit = parseSafeNumber(rentDeposit);
        updateData.rent_fees_utilities = parseSafeNumber(rentFeesUtilities);
        updateData.rent_duration = rentDuration || null;
        updateData.rent_available_from = rentAvailableFrom || null;
        updateData.rent_equipment = rentEquipment || null;
      }

      // Druhy bez vlastního bloku (komerční, garáž/ostatní, pozemek) by poslaly prázdný
      // update — PostgREST na něj vrací chybu a uživatel by viděl nesmyslné hlášení.
      if (Object.keys(updateData).length === 0) {
        toast.error(`Pro druh „${editKind}" zatím nejsou samostatné parametry — zapište je do Faktů pro odpovědi.`);
        setIsEditingSpecifics(false);
        return;
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
  /**
   * Řádek „co teď" nad kartou. Nepřidává žádné pole k vyplnění — všechno se
   * počítá z toho, co už v databázi leží (obchody, aktivity, historie ceny).
   * Co spočítat nejde, se neukáže; prázdné místo je lepší než vymyšlený údaj.
   */
  /** Cena za metr podle druhu — u pozemku se počítá z výměry, ne z podlahy. */
  const selectedPricePerM2 = (() => {
    if (!selectedProperty) return null;
    const area =
      selectedProperty.flat_area ||
      selectedProperty.house_area ||
      selectedProperty.comm_floor_area ||
      selectedProperty.land_size;
    if (!area || area <= 0) return null;
    return Math.round(selectedProperty.price / area).toLocaleString('cs-CZ');
  })();

  const propertySignals = (() => {
    if (!selectedProperty) return [];
    const now = Date.now();
    const dayMs = 86400000;
    /** Rozdíl v kalendářních dnech — jinak by včerejší večer hlásil „dnes". */
    const daysAgo = (iso: string) => {
      const a = new Date(iso); const b = new Date();
      a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0);
      return Math.round((b.getTime() - a.getTime()) / dayMs);
    };
    const out: { label: string; value: string; tone?: 'accent' | 'warn' }[] = [];

    if (selectedProperty.created_at) {
      const days = daysAgo(selectedProperty.created_at);
      out.push({
        label: 'přidáno',
        value: days === 0 ? 'dnes' : days === 1 ? 'včera' : `před ${days} dny`,
        tone: days > 90 ? 'warn' : undefined,
      });
    }

    const propertyDeals = deals.filter((d) => d.property_id === selectedProperty.id);
    const live = propertyDeals.filter((d) => d.result === 'otevřený');
    out.push({
      label: 'zájemci',
      value: live.length === 0 ? 'zatím žádní' : live.length === 1 ? '1 aktivní' : `${live.length} aktivní`,
      tone: live.length > 0 ? 'accent' : undefined,
    });

    const dealIds = new Set(propertyDeals.map((d) => d.id));
    const upcoming = activities
      .filter((a) => a.deal_id && dealIds.has(a.deal_id) && !a.done && new Date(a.when).getTime() >= now)
      .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime())[0];
    if (upcoming) {
      const when = new Date(upcoming.when);
      const inDays = Math.round((when.getTime() - now) / dayMs);
      const den = inDays <= 0 ? 'dnes' : inDays === 1 ? 'zítra' : when.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
      const cas = when.toLocaleTimeString('cs-CZ', { hour: 'numeric', minute: '2-digit' });
      out.push({ label: upcoming.type.toLowerCase(), value: `${den} ${cas}`, tone: 'accent' });
    }

    const lastChange = (selectedProperty.price_history ?? []).slice(-1)[0];
    if (lastChange) {
      const days = daysAgo(lastChange.changed_at);
      const diff = Math.abs(lastChange.to - lastChange.from);
      out.push({
        label: lastChange.to < lastChange.from ? 'cena dolů' : 'cena nahoru',
        value: `${diff.toLocaleString('cs-CZ')} Kč · ${days === 0 ? 'dnes' : `před ${days} dny`}`,
      });
    }

    const lastActivity = activities
      .filter((a) => a.deal_id && dealIds.has(a.deal_id) && new Date(a.when).getTime() <= now)
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())[0];
    if (lastActivity) {
      const days = daysAgo(lastActivity.when);
      if (days >= 14) out.push({ label: 'bez odezvy', value: `${days} dní`, tone: 'warn' });
    }

    return out;
  })();

  const documents = selectedProperty?.documents ?? [];
  const priceHistory = selectedProperty?.price_history ?? [];

  const formatDocMeta = (doc: PropertyDocument) => {
    const kb = doc.size / 1024;
    const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} kB`;
    const date = new Date(doc.uploaded_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
    return `${size} · ${date}`;
  };

  /** Dokumenty se jen přidávají — nikdy nepřepíšou to, co už je nahrané. */
  const handleUploadDocuments = async (files: FileList | null) => {
    if (!selectedProperty || !files || files.length === 0) return;
    setUploadingDoc(true);
    try {
      const uploaded: PropertyDocument[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadPropertyDocument(file);
        uploaded.push({ name: file.name, url, size: file.size, uploaded_at: new Date().toISOString() });
      }
      const updated = await updateProperty(selectedProperty.id, {
        documents: [...documents, ...uploaded],
      });
      setSelectedProperty(updated);
      onRefresh();
      toast.success(uploaded.length === 1 ? 'Dokument byl nahrán.' : `Nahráno souborů: ${uploaded.length}.`);
    } catch (e: any) {
      toast.error(e.message || 'Dokument se nepodařilo nahrát.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDocument = async (index: number) => {
    if (!selectedProperty) return;
    try {
      const updated = await updateProperty(selectedProperty.id, {
        documents: documents.filter((_, i) => i !== index),
      });
      setSelectedProperty(updated);
      onRefresh();
      toast.success('Dokument byl odebrán.');
    } catch (e: any) {
      toast.error(e.message || 'Dokument se nepodařilo odebrat.');
    }
  };

  // Poznámka má vlastní sloupec, ne facts_for_answers: fakta jdou do odpovědí
  // zájemcům, poznámka je interní a nikam se neposílá.
  const handleSaveNote = async () => {
    if (!selectedProperty) return;
    try {
      const updated = await updateProperty(selectedProperty.id, {
        note: editNote || null,
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

      const createAttachments = Array.from(new Set([...(photoUrl ? [photoUrl] : []), ...photoUrls])).filter(Boolean);

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
        attachments: createAttachments.length > 0 ? createAttachments : null,

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

        comm_subtype: usesCommColumns(newKind) ? commSubtype || null : null,
        comm_floor_area: usesCommColumns(newKind) && commFloorArea ? parseSafeNumber(commFloorArea) : null,
        comm_condition_equipment: usesCommColumns(newKind) ? commCondition || null : null,
        // Byt sdílí sloupec parkování s komerčními prostory — vlastní nemá.
        comm_parking_entrance: usesCommColumns(newKind)
          ? commParking || null
          : newKind === 'byt'
            ? flatParking || null
            : null,
        comm_penb: newKind === 'komerční' ? commPenb || null : null,
        rent_deposit: newTransaction === 'pronájem' ? parseSafeNumber(rentDeposit) : null,
        rent_fees_utilities: newTransaction === 'pronájem' ? parseSafeNumber(rentFeesUtilities) : null,
        rent_duration: newTransaction === 'pronájem' ? rentDuration || null : null,
        rent_available_from: newTransaction === 'pronájem' ? rentAvailableFrom || null : null,
        rent_equipment: newTransaction === 'pronájem' ? rentEquipment || null : null,
        commission_pct: parseSafeNumber(commissionPct),
        commission_val: parseSafeNumber(commissionVal),
      });

      toast.success('Nemovitost a vlastník byli úspěšně uloženi.');
      setCreatedSummary(created);
      setCreateMode('hotovo');
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
    setImportLines([]);
    setImportStage('Stahuji stránku…');

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
      setImportStage('Čtu text inzerátu…');
      const toastId2 = toast.loading('2/2: Analyzuji text inzerátu pomocí AI...');

      // 2. Parse HTML, extract image, and clean up text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract the listing photo. og:image is what every portal sets for sharing and is
      // always a real listing photo — the <img> scan is only a fallback, because portals
      // lazy-load gallery images and their src often points at a placeholder.
      const absolutizeUrl = (raw: string): string => {
        if (!raw) return '';
        if (raw.startsWith('//')) return 'https:' + raw;
        if (raw.startsWith('/')) {
          try {
            return new URL(normalizedUrl).origin + raw;
          } catch {
            return '';
          }
        }
        return raw;
      };

      let foundPhotoUrl = absolutizeUrl(
        doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
        ''
      );

      if (!foundPhotoUrl) {
        const imgElements = Array.from(doc.querySelectorAll('img'));
        for (const img of imgElements) {
          // Lazy-loaded galleries keep the real photo in data-src / data-original.
          const src =
            img.getAttribute('src') ||
            img.getAttribute('data-src') ||
            img.getAttribute('data-original') ||
            '';
          // Skip tiny icons, tracking pixels, or base64
          if (!src || src.startsWith('data:') || /icon|logo|pixel|spinner|placeholder|\.svg(\?|$)/i.test(src)) {
            continue;
          }
          const absolute = absolutizeUrl(src);
          if (absolute.startsWith('http')) {
            foundPhotoUrl = absolute;
            break;
          }
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
              flat_layout: { type: "STRING", enum: ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1", "5+kk", "5+1", "6 a více", "atypické"] },
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
              house_layout: { type: "STRING", enum: ["2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1", "5+kk", "5+1", "6+kk", "6+1", "7 a více", "atypické"] },
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
              land_type: { type: "STRING", enum: ["bydlení", "komerční", "pole", "louka", "les", "rybník", "sady / vinice", "zahrada", "ostatní"], description: "Druh pozemku" },
              land_utilities: {
                type: "ARRAY",
                items: { type: "STRING", enum: ["elektřina", "voda", "plyn", "kanalizace"] },
                description: "Inženýrské sítě dostupné na pozemku"
              },
              zoning_plan: { type: "STRING", enum: ["zastavitelné — bydlení", "zastavitelné — smíšené obytné", "zastavitelné — komerce / výroba", "zastavitelné — rekreace", "nezastavitelné — zemědělská půda", "nezastavitelné — les", "nezastavitelné — ostatní"], description: "Zařazení podle územního plánu" },
              land_access: { type: "STRING", enum: ["asfaltová cesta", "zpevněná cesta", "nezpevněná cesta", "přes cizí pozemek", "bez přístupu"], description: "Přístup k pozemku" },
              land_dimensions: { type: "STRING", description: "Rozměry pozemku" },
              comm_subtype: { type: "STRING", enum: ["kancelář", "obchodní prostor", "sklad", "výrobní prostor", "restaurace / gastro", "ubytování", "ordinace", "zemědělský objekt", "činžovní dům", "jiné"], description: "Podtyp komerční nemovitosti" },
              comm_floor_area: { type: "NUMBER", description: "Podlahová/užitná plocha komerčního prostoru v m2" },
              comm_condition_equipment: { type: "STRING", description: "Stav a vybavenost komerčního prostoru, např. 'po rekonstrukci, klimatizace, kuchyňka'" },
              comm_parking_entrance: { type: "STRING", description: "Parkování a vjezd, např. '4 stání ve dvoře, vjezd pro dodávku'" },
              comm_penb: { type: "STRING", enum: ["A", "B", "C", "D", "E", "F", "G"], description: "PENB komerčního prostoru" },
              rent_deposit: { type: "NUMBER", description: "Vratná kauce (jistota) v Kč, pokud jde o pronájem" },
              rent_fees_utilities: { type: "NUMBER", description: "Měsíční poplatky za služby a energie v Kč, pokud jde o pronájem" },
              rent_duration: { type: "STRING", description: "Doba nájmu, např. '1 rok s možností prodloužení', 'na dobu neurčitou'" },
              rent_available_from: { type: "STRING", description: "Od kdy je nemovitost dostupná k nastěhování, ve formátu YYYY-MM-DD. Vynech, pokud v textu není konkrétní datum." },
              rent_equipment: { type: "STRING", enum: ["vybaveno", "částečně vybaveno", "nevybaveno"], description: "Vybavení pronajímané nemovitosti" },
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
        setPhotoUrls((prev) => (prev.includes(foundPhotoUrl) ? prev : [foundPhotoUrl, ...prev]));
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
      setImportStage('');

      // Vypiš postupně, co se našlo — makléř vidí, že systém odvedl jeho práci
      const KIND_LABEL: Record<string, string> = {
        byt: 'byt', 'dům': 'dům', pozemek: 'pozemek', 'komerční': 'komerční', 'garáž/ostatní': 'garáž',
      };
      const found: { label: string; value: string }[] = [];
      const push = (label: string, value: unknown, suffix = '') => {
        if (value !== undefined && value !== null && value !== '') {
          found.push({ label, value: `${Array.isArray(value) ? value.join(', ') : value}${suffix}` });
        }
      };
      push('Adresa', parsed.address);
      push('Druh', parsed.kind ? `${KIND_LABEL[parsed.kind] || parsed.kind} · ${parsed.transaction || 'prodej'}` : null);
      push('Dispozice', parsed.flat_layout || parsed.house_layout);
      push('Plocha', parsed.flat_area || parsed.house_area || parsed.comm_floor_area, ' m²');
      push('Výměra', parsed.land_size, ' m²');
      push('Patro', parsed.floor);
      push('Cena', parsed.price ? Number(parsed.price).toLocaleString('cs-CZ') : null, parsed.price ? ' Kč' : '');
      push('Stav', parsed.flat_condition || parsed.house_condition || parsed.comm_condition_equipment);
      push('Konstrukce', parsed.construction);
      push('Vlastnictví', parsed.ownership);
      push('PENB', parsed.flat_penb || parsed.house_penb || parsed.comm_penb);
      push('Vybavení', parsed.flat_features || parsed.house_features);
      push('Sítě', parsed.land_utilities);

      found.forEach((line, i) => {
        window.setTimeout(() => setImportLines((prev) => [...prev, line]), i * 160);
      });

      // 4. Fill form states
      if (parsed.address) setNewAddress(parsed.address);
      if (parsed.kind) setNewKind(parsed.kind);
      if (parsed.transaction) setNewTransaction(parsed.transaction);
      if (parsed.price) setNewPrice(parsed.price.toString());

      if (parsed.facts_for_answers) setNewFacts(parsed.facts_for_answers);

      // Rent and Commission
      if (parsed.rent_deposit) setRentDeposit(parsed.rent_deposit.toString());
      if (parsed.rent_fees_utilities) setRentFeesUtilities(parsed.rent_fees_utilities.toString());
      if (parsed.rent_duration) setRentDuration(parsed.rent_duration);
      // DB sloupec je DATE — vezmi jen validní YYYY-MM-DD, jinak by insert spadl
      if (parsed.rent_available_from && /^\d{4}-\d{2}-\d{2}$/.test(parsed.rent_available_from)) {
        setRentAvailableFrom(parsed.rent_available_from);
      }
      if (parsed.rent_equipment) setRentEquipment(parsed.rent_equipment);
      if (parsed.commission_pct) setCommissionPct(parsed.commission_pct.toString());
      if (parsed.commission_val) setCommissionVal(parsed.commission_val.toString());

      // Komerční specific
      if (parsed.comm_subtype) setCommSubtype(parsed.comm_subtype);
      if (parsed.comm_floor_area) setCommFloorArea(parsed.comm_floor_area.toString());
      if (parsed.comm_condition_equipment) setCommCondition(parsed.comm_condition_equipment);
      if (parsed.comm_parking_entrance) setCommParking(parsed.comm_parking_entrance);
      if (parsed.comm_penb) setCommPenb(parsed.comm_penb);

      // Import naplnil i volitelná pole — rozbal je, ať uživatel vidí, co se doplnilo
      if (foundPhotoUrl || parsed.commission_pct || parsed.commission_val || parsed.facts_for_answers) {
        setShowOptional(true);
      }

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

      toast.success(`Inzerát načten jako „${parsed.kind}" — zkontrolujte předvyplněná pole.`);
      setImportUrl('');
    } catch (err: any) {
      console.error(err);
      toast.dismiss(toastId);
      setImportStage('');
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

    // Tyhle stavy sdílí detail nemovitosti — bez resetu by se do nové nemovitosti
    // propsala fotka, provize i kauce z naposledy otevřené karty.
    setPhotoUrl('');
    setPhotoPending(false);
    setPhotoWarning(false);
    setRentDeposit('');
    setRentFeesUtilities('');
    setRentDuration('');
    setRentAvailableFrom('');
    setRentEquipment('');
    setCommSubtype('');
    setCommFloorArea('');
    setCommCondition('');
    setCommParking('');
    setCommPenb('');
    setCommissionPct('');
    setCommissionVal('');
    setImportUrl('');
    setNewKind('byt');
    setNewTransaction('prodej');
    setNewOfferStatus('v nabídce');
    setShowOptional(false);
    setCreateMode('rozcestí');
    setWizardStep(0);
    setAddrSuggestions([]);
    setAddrOpen(false);
    setImportLines([]);
    setImportStage('');
    setCreatedSummary(null);

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

  const activeFilterCount =
    (transactionFilter !== 'vše' ? 1 : 0) +
    (kindFilter !== 'vše' ? 1 : 0) +
    (statusFilter !== 'vše' ? 1 : 0);

  // Filtry se nepoužijí hned při kliknutí. Makléř si je naklikne do konceptu
  // a teprve „Použít filtry" je pustí na seznam — jedno překreslení místo
  // jednoho na každé kliknutí.
  const [draftTransaction, setDraftTransaction] = useState(transactionFilter);
  const [draftKind, setDraftKind] = useState(kindFilter);
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [confirmReset, setConfirmReset] = useState(false);

  const draftFilterCount =
    (draftTransaction !== 'vše' ? 1 : 0) +
    (draftKind !== 'vše' ? 1 : 0) +
    (draftStatus !== 'vše' ? 1 : 0);

  const draftDiffers =
    draftTransaction !== transactionFilter ||
    draftKind !== kindFilter ||
    draftStatus !== statusFilter;

  /** Otevření panelu — koncept vždy začíná tím, co je právě použité. */
  const openFilters = (open: boolean) => {
    if (open) {
      setDraftTransaction(transactionFilter);
      setDraftKind(kindFilter);
      setDraftStatus(statusFilter);
    }
    setConfirmReset(false);
    return open;
  };

  const applyFilters = () => {
    setTransactionFilter(draftTransaction);
    setKindFilter(draftKind);
    setStatusFilter(draftStatus);
    setConfirmReset(false);
    setIsDesktopFiltersOpen(false);
    setIsMobileFiltersExpanded(false);
  };

  /** Reset jen v konceptu — na seznam se propíše až přes „Použít filtry". */
  const resetFilters = () => {
    setDraftTransaction('vše');
    setDraftKind('vše');
    setDraftStatus('vše');
    setConfirmReset(false);
  };

  // Shared filter sections (desktop panel + mobile drawer) — Sreality-like
  // structure: transakce on top, then property-kind tiles, then offer status
  // in lifecycle order.
  const filterSectionBorder = theme === 'light' ? 'rgba(11,31,26,0.1)' : 'rgba(255,255,255,0.08)';
  const kindTiles = [
    { id: 'byt', label: 'Byty', Icon: Building2 },
    { id: 'dům', label: 'Domy', Icon: Home },
    { id: 'pozemek', label: 'Pozemky', Icon: Trees },
    { id: 'komerční', label: 'Komerční', Icon: Store },
    { id: 'garáž/ostatní', label: 'Ostatní', Icon: Warehouse },
  ] as const;
  const statusChips = [
    { id: 'akvizice', label: 'Akvizice' },
    { id: 'v nabídce', label: 'V nabídce' },
    { id: 'rezervováno', label: 'Rezervováno' },
    { id: 'uzavřeno', label: 'Prodáno' },
  ] as const;

  const renderFilterSections = () => (
    <div className="flex flex-col gap-5">
      {/* Transakce */}
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.textMuted }}>
          Transakce
        </div>
        <div className="flex bg-[#ECEBE6] p-[3px] rounded-[10px] dark:bg-stone-850 h-9 items-center w-full sm:w-fit">
          {(['vše', 'prodej', 'pronájem'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDraftTransaction(t)}
              className={`px-4 h-[30px] flex-1 sm:flex-none flex items-center justify-center rounded-[8px] text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                draftTransaction === t
                  ? 'bg-white text-[#0B1F1A] shadow-xs dark:bg-stone-900 dark:text-white'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              {t === 'vše' ? 'Vše' : t === 'prodej' ? 'Prodej' : 'Pronájem'}
            </button>
          ))}
        </div>
      </div>

      {/* Typ nemovitosti */}
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.textMuted }}>
          Typ nemovitosti
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {kindTiles.map(({ id, label, Icon }) => {
            const active = draftKind === id;
            return (
              <button
                key={id}
                onClick={() => setDraftKind(active ? 'vše' : id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-[10px] border transition-all duration-150 cursor-pointer ${
                  active
                    ? 'border-transparent shadow-xs'
                    : 'bg-white border-stone-250/70 hover:border-stone-300 dark:bg-stone-900 dark:border-white/10'
                }`}
                style={{
                  backgroundColor: active ? colors.accent : undefined,
                  color: active ? '#00221F' : colors.textPrimary,
                }}
              >
                <Icon className="h-[18px] w-[18px]" style={{ color: active ? '#00221F' : colors.textMuted }} />
                <span className="text-[12px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stav nabídky */}
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.textMuted }}>
          Stav nabídky
        </div>
        <div className="flex flex-wrap gap-2">
          {statusChips.map((st) => {
            const active = draftStatus === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setDraftStatus(active ? 'vše' : st.id)}
                className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[10px] transition-all duration-150 border cursor-pointer ${
                  active
                    ? 'border-transparent shadow-xs'
                    : 'bg-white border-stone-250/70 hover:border-stone-300 dark:bg-stone-900 dark:border-white/10 dark:text-white'
                }`}
                style={{
                  backgroundColor: active ? colors.accent : undefined,
                  color: active ? '#00221F' : colors.textPrimary,
                }}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Potvrzení resetu a použití — filtry platí až odsud */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        {confirmReset ? (
          <span className="text-[12.5px]" style={{ color: colors.textSecondary }}>
            Zrušit všechny filtry?
          </span>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={draftFilterCount === 0}
            className="text-[12px] font-medium px-2.5 py-1 rounded-[8px] border border-stone-250/70 dark:border-white/10 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-default"
          >
            Resetovat filtry
          </button>
        )}

        {/* Jedno hlavní tlačítko, které mění roli — potvrzení nepřidává další. */}
        <div className="flex items-center gap-2">
          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="text-[12.5px] font-medium px-3 h-9 rounded-[10px] text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer"
            >
              Zpět
            </button>
          )}
          <button
            onClick={confirmReset ? resetFilters : applyFilters}
            className="font-semibold text-[13px] px-4 h-9 rounded-[10px] cursor-pointer transition-all duration-150 shadow-xs hover:opacity-90"
            style={{ backgroundColor: colors.accent, color: '#00221F' }}
          >
            {confirmReset ? 'Ano, zrušit' : draftDiffers ? 'Použít filtry' : 'Hotovo'}
          </button>
        </div>
      </div>
    </div>
  );

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
      <div className="hidden md:flex items-center gap-2 py-1">
        {/* Search */}
        <div 
          className="flex items-center gap-2 bg-white border border-stone-250/70 rounded-[10px] px-3.5 h-9 w-[340px] flex-none shadow-sm dark:bg-stone-900 dark:border-white/10"
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

        {/* Filters button + dropdown panel */}
        <div className="relative flex-none">
          <button
            onClick={() => setIsDesktopFiltersOpen(openFilters(!isDesktopFiltersOpen))}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-[10px] border border-stone-250/70 bg-white dark:bg-stone-900 dark:border-white/10 font-medium text-[12.5px] shadow-sm cursor-pointer transition-all duration-150"
            style={{ color: colors.textPrimary }}
          >
            <SlidersHorizontal
              className="h-3.5 w-3.5"
              style={{ color: activeFilterCount > 0 || isDesktopFiltersOpen ? colors.accent : colors.textMuted }}
            />
            <span>Filtry</span>
            {activeFilterCount > 0 && (
              <span
                className="min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-semibold flex items-center justify-center"
                style={{ backgroundColor: colors.accent, color: '#00221F' }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {isDesktopFiltersOpen && (
            <>
              {/* Click-away backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDesktopFiltersOpen(false)} />
              <div
                className="absolute left-0 top-[calc(100%+8px)] z-50 w-[620px] rounded-xl border p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
                style={{ backgroundColor: colors.cardBg, borderColor: filterSectionBorder }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
                    Filtry
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDesktopFiltersOpen(false)}
                      className="p-1.5 rounded-[8px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200 cursor-pointer transition-all duration-150"
                      aria-label="Zavřít filtry"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {renderFilterSections()}
              </div>
            </>
          )}
        </div>

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
            onClick={() => setIsMobileFiltersExpanded(openFilters(!isMobileFiltersExpanded))}
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
            className="flex flex-col gap-5 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-150 shadow-xs"
            style={{ backgroundColor: colors.cardBg, borderColor: filterSectionBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
                Filtry
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileFiltersExpanded(false)}
                  className="p-1.5 rounded-[8px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200 cursor-pointer transition-all duration-150"
                  aria-label="Zavřít filtry"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {renderFilterSections()}
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
              displayTitle = prop.land_type ? `Pozemek — ${prop.land_type}` : 'Pozemek';
            } else if (prop.kind === 'komerční') {
              displayTitle = prop.comm_subtype ? `Komerční — ${prop.comm_subtype}` : 'Komerční';
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
            } else if (prop.kind === 'pozemek' && (prop.land_size || prop.land_area)) {
              detailsStr += ` · ${prop.land_size || prop.land_area} m²`;
            } else if (prop.kind === 'komerční' && (prop.comm_floor_area || prop.flat_area)) {
              detailsStr += ` · ${prop.comm_floor_area || prop.flat_area} m²`;
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

        // Key parameters shown on the Přehled tab — driven by druh, so every kind
        // shows the fields it actually stores instead of falling back to dům columns.
        const keyParams: { label: string; value: string | number | null }[] = (() => {
          const p = selectedProperty;
          switch (p.kind) {
            case 'byt':
              return [
                { label: 'Dispozice', value: p.flat_layout },
                { label: 'Užitná plocha', value: p.flat_area ? `${p.flat_area} m²` : null },
                { label: 'Patro', value: p.floor },
                { label: 'Stav', value: p.flat_condition },
                { label: 'PENB', value: p.flat_penb },
                { label: 'Vlastnictví', value: p.ownership },
              ];
            case 'dům':
              return [
                { label: 'Dispozice', value: p.house_layout },
                { label: 'Užitná plocha', value: p.house_area ? `${p.house_area} m²` : null },
                { label: 'Pozemek', value: p.land_area ? `${p.land_area} m²` : null },
                { label: 'Typ domu', value: p.house_type },
                { label: 'Podlaží', value: p.floors_count },
                { label: 'Stav', value: p.house_condition },
                { label: 'PENB', value: p.house_penb },
              ];
            case 'pozemek':
              return [
                { label: 'Výměra', value: p.land_size ? `${p.land_size} m²` : null },
                { label: 'Druh pozemku', value: p.land_type },
                { label: 'Sítě', value: p.land_utilities?.length ? p.land_utilities.join(', ') : null },
                { label: 'Územní plán', value: p.zoning_plan },
                { label: 'Přístup', value: p.land_access },
                { label: 'Rozměry', value: p.land_dimensions },
              ];
            case 'garáž/ostatní':
              return [
                { label: 'Typ objektu', value: p.comm_subtype },
                { label: 'Plocha', value: p.comm_floor_area ? `${p.comm_floor_area} m²` : null },
                { label: 'Stav', value: p.comm_condition_equipment },
                { label: 'Vjezd / přístup', value: p.comm_parking_entrance },
              ];
            default:
              return [
                { label: 'Podtyp', value: p.comm_subtype },
                { label: 'Podlahová plocha', value: p.comm_floor_area ? `${p.comm_floor_area} m²` : null },
                { label: 'Stav / vybavenost', value: p.comm_condition_equipment },
                { label: 'Parkování / vjezd', value: p.comm_parking_entrance },
                { label: 'PENB', value: p.comm_penb },
              ];
          }
        })();
        const keyParamsFilled = keyParams.some((p) => p.value !== null && p.value !== '');

        // Druhy, pro které existuje editovatelný blok parametrů v záložce Informace.
        const hasSpecificsForm = true; // každý druh má teď svůj blok parametrů
        const specificsLabel =
          editKind === 'byt' ? 'bytu'
          : editKind === 'dům' ? 'domu'
          : editKind === 'pozemek' ? 'pozemku'
          : editKind === 'komerční' ? 'komerčního prostoru'
          : 'garáže';
        const specificsEmpty =
          editKind === 'byt' ? !(flatLayout && flatArea)
          : editKind === 'dům' ? !(houseLayout && houseArea)
          : editKind === 'pozemek' ? !(landSize || landType || landUtilities || zoningPlan || landAccess || landDimensions)
          : !(commSubtype || commFloorArea || commCondition || commParking);

        return (
          <Dialog open={isDetailOpen} onOpenChange={(open) => {
            setIsDetailOpen(open);
            if (!open) onClearFocusProperty?.();
          }}>
            <DialogContent showCloseButton={false} className="max-w-6xl lg:max-w-7xl w-[92vw] lg:w-full p-0 overflow-y-auto overflow-x-hidden sm:overflow-hidden border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 rounded-[14px] max-h-[92vh] !flex !flex-col gap-0 text-left font-sans shadow-2xl mobile-scrollbar-none">
              
              {/* HERO — nemovitost je vizuální věc, ne řádek tabulky. Titulek,
                  cena i adresa jsou přímo na fotce, takže hlavička pod ním
                  nese jen vlastníka a nic se neopakuje. */}
              <div className="relative flex-none h-[150px] sm:h-[176px] w-full overflow-hidden bg-[#E9E8E2] dark:bg-stone-800">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="rgba(11,31,26,0.18)" strokeWidth="1.2">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z" />
                    </svg>
                  </div>
                )}
                {/* Bez přechodu by byl bílý text na světlé fotce nečitelný. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />

                <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-6 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[11.5px] font-semibold bg-white/90 text-[#00221F] px-2 py-[2px] rounded-[6px]">
                      {selectedProperty.transaction === 'prodej' ? 'Prodej' : 'Pronájem'}
                    </span>
                    <span className="text-[11.5px] font-semibold bg-[#00D991] text-[#00221F] px-2 py-[2px] rounded-[6px]">
                      {selectedProperty.offer_status}
                    </span>
                    {(selectedProperty.attachments?.length || 0) > 0 && (
                      <span className="text-[11.5px] font-medium bg-black/45 text-white px-2 py-[2px] rounded-[6px]">
                        {selectedProperty.attachments!.length} fotek
                      </span>
                    )}
                  </div>

                  <div className="font-display font-light text-white text-[26px] sm:text-[30px] leading-tight drop-shadow-sm">
                    {describeProperty(selectedProperty)}
                  </div>

                  <div className="flex items-baseline gap-2.5 flex-wrap mt-1">
                    <span className="text-white text-[22px] sm:text-[25px] font-semibold tabular-nums drop-shadow-sm">
                      {selectedProperty.price.toLocaleString('cs-CZ')} Kč
                    </span>
                    {selectedPricePerM2 && (
                      <span className="text-white/75 text-[13px] tabular-nums">{selectedPricePerM2} Kč/m²</span>
                    )}
                    <span className="text-white/75 text-[13px]">· {selectedProperty.address}</span>
                  </div>
                </div>
              </div>

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

                {/* Details Panel */}
                <div className="flex-1 min-w-0 text-left font-sans mt-3.5 sm:mt-0">
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

              {/* CO TEĎ — jediný řádek, který odpovídá na otázku „proč jsem sem
                  přišel". Nic se neproklikává, všechno je spočítané z dat. */}
              {propertySignals.length > 0 && (
                <div className="flex items-center gap-x-6 gap-y-2 flex-wrap px-4 sm:px-6 py-3 border-b border-stone-200/60 dark:border-stone-800 bg-[#FAFAF8] dark:bg-stone-950 flex-none">
                  {propertySignals.map((sig) => (
                    <div key={sig.label} className="flex items-baseline gap-1.5 text-left">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">
                        {sig.label}
                      </span>
                      <span
                        className={cn(
                          'text-[13.5px] font-semibold tabular-nums',
                          sig.tone === 'accent' && 'text-[#0E8A5F] dark:text-[#00D991]',
                          sig.tone === 'warn' && 'text-amber-600 dark:text-amber-500',
                          !sig.tone && 'text-stone-800 dark:text-stone-200'
                        )}
                      >
                        {sig.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TABS SELECTOR */}
              <div className="flex gap-4 sm:gap-[26px] px-4 sm:px-6 border-b border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-x-auto scrollbar-none flex-none">
                {(['prehled', 'informace', 'zajemci', 'ekonomika'] as const).map((tab) => {
                  const label = 
                    tab === 'prehled' ? 'Přehled' :
                    tab === 'informace' ? 'Informace' :
                    tab === 'zajemci' ? `Zájemci · ${propertyDeals.length}` :
                    'Provize';

                  const active = activeDetailTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className="py-3 text-[14px] font-medium transition cursor-pointer border-b-2 text-left whitespace-nowrap"
                      style={{
                        color: active ? colors.textPrimary : colors.textMuted,
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
                        {keyParamsFilled ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-left">
                            {keyParams.map((param) => (
                              <div key={param.label}>
                                <span className="text-xs text-stone-400 dark:text-stone-500">{param.label}</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
                                  {param.value !== null && param.value !== '' ? param.value : '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveDetailTab('informace')}
                            className="w-full text-left rounded-lg border border-dashed border-stone-300 dark:border-stone-700 px-4 py-3.5 hover:border-[#0E8A5F] hover:bg-stone-50 dark:hover:bg-stone-900 transition cursor-pointer"
                          >
                            <div className="text-[13.5px] font-medium text-stone-900 dark:text-stone-100">
                              Parametry zatím nejsou vyplněné
                            </div>
                            <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                              Doplňte je v záložce Informace — AI z nich odpovídá zájemcům.
                            </div>
                          </button>
                        )}
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
                              <SelectTrigger className="w-full h-10 text-xs">
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
                              <SelectTrigger className="w-full h-10 text-xs">
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
                              <SelectTrigger className="w-full h-10 text-xs">
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
                              className="h-10 text-xs" 
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label>Adresa *</Label>
                            <Input 
                              value={editAddress} 
                              onChange={(e) => setEditAddress(e.target.value)} 
                              className="h-10 text-xs" 
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
                            ? `Parametry ${specificsLabel} — úprava`
                            : `Parametry ${specificsLabel}`}
                        </span>
                        {!isEditingSpecifics ? (
                          hasSpecificsForm && !specificsEmpty && (
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

                                  setLandSize(selectedProperty.land_size ? selectedProperty.land_size.toString() : '');
                                  setLandType(selectedProperty.land_type || '');
                                  setLandUtilities(selectedProperty.land_utilities ? selectedProperty.land_utilities.join(', ') : '');
                                  setZoningPlan(selectedProperty.zoning_plan || '');
                                  setLandAccess(selectedProperty.land_access || '');
                                  setLandDimensions(selectedProperty.land_dimensions || '');

                                  setCommSubtype(selectedProperty.comm_subtype || '');
                                  setCommFloorArea(selectedProperty.comm_floor_area ? selectedProperty.comm_floor_area.toString() : '');
                                  setCommCondition(selectedProperty.comm_condition_equipment || '');
                                  setCommParking(selectedProperty.comm_parking_entrance || '');
                                  setCommPenb(selectedProperty.comm_penb || '');
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

                      {/* Condition 0: Kind without its own parameter block — say so instead of
                          showing the dům form and silently discarding what the user types. */}
                      {!hasSpecificsForm ? (
                        <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 bg-white dark:bg-stone-950 text-left">
                          <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                            Pro druh „{editKind}" zatím nejsou samostatné parametry
                          </div>
                          <div className="text-xs text-stone-400 dark:text-stone-500 mt-1 leading-relaxed">
                            Plochu, podtyp, vybavenost a parkování zapište níže do pole Fakta pro odpovědi —
                            AI odpovídá zájemcům právě z něj.
                          </div>
                        </div>
                      ) : /* Condition 1: Empty state / Unset values */
                      !isEditingSpecifics && specificsEmpty ? (
                        <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 flex justify-between items-center bg-white dark:bg-stone-950">
                          <div className="text-left">
                            <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                              Doplňte parametry {specificsLabel}
                            </div>
                            <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                              AI z nich odpovídá zájemcům —{' '}
                              {editKind === 'byt' ? 'dispozice, plocha, patro, PENB'
                                : editKind === 'dům' ? 'dispozice, plocha, pozemek, PENB'
                                : editKind === 'pozemek' ? 'výměra, druh, sítě, územní plán'
                                : 'podtyp, plocha, vybavenost, parkování'}.
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
                          ) : editKind === 'pozemek' ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Výměra</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{landSize ? `${landSize} m²` : '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Druh pozemku</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{landType || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Zasíťování</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{landUtilities || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Územní plán</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{zoningPlan || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Přístup</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{landAccess || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Šířka / tvar / svažitost</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{landDimensions || '—'}</div>
                              </div>
                            </div>
                          ) : editKind === 'komerční' ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Podtyp</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{commSubtype || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Podlahová plocha</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{commFloorArea ? `${commFloorArea} m²` : '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Stav / vybavenost</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{commCondition || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">Parkování / vjezd</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{commParking || '—'}</div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs text-stone-400 dark:text-stone-500">PENB</span>
                                <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{commPenb || '—'}</div>
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

                          {/* Pronájem — read-only */}
                          {editTransaction === 'pronájem' && (
                            <div className="border-t border-dashed border-stone-200 dark:border-stone-800 pt-4">
                              <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Pronájem</span>
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-3">
                                <div className="min-w-0">
                                  <span className="text-xs text-stone-400 dark:text-stone-500">Vratná kauce</span>
                                  <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{rentDeposit ? `${parseInt(rentDeposit, 10).toLocaleString('cs-CZ')} Kč` : '—'}</div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs text-stone-400 dark:text-stone-500">Měsíční poplatky</span>
                                  <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">{rentFeesUtilities ? `${parseInt(rentFeesUtilities, 10).toLocaleString('cs-CZ')} Kč` : '—'}</div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs text-stone-400 dark:text-stone-500">Doba nájmu</span>
                                  <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5 break-words whitespace-normal">{rentDuration || '—'}</div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs text-stone-400 dark:text-stone-500">Dostupné od</span>
                                  <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{rentAvailableFrom ? new Date(rentAvailableFrom).toLocaleDateString('cs-CZ') : '—'}</div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs text-stone-400 dark:text-stone-500">Vybavení</span>
                                  <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{rentEquipment || '—'}</div>
                                </div>
                              </div>
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
                                  <Label htmlFor="ed_dispozice" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Dispozice *</Label>
                                  <OptionSelect id="ed_dispozice" value={flatLayout} onChange={setFlatLayout} options={FLAT_LAYOUT_OPTIONS} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_uzitna_plocha_m2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Užitná plocha (m²) *</Label>
                                  <Input id="ed_uzitna_plocha_m2" 
                                    type="number" 
                                    value={flatArea} 
                                    onChange={(e) => setFlatArea(e.target.value)} 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_patro_z_pater" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Patro / z pater</Label>
                                  <Input id="ed_patro_z_pater" 
                                    value={flatFloor} 
                                    onChange={(e) => setFlatFloor(e.target.value)} 
                                    placeholder="např. 6. ze 6" 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_vlastnictvi" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Vlastnictví</Label>
                                  <OptionSelect id="ed_vlastnictvi" value={flatOwnership} onChange={setFlatOwnership} options={OWNERSHIP_OPTIONS} />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_konstrukce" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Konstrukce</Label>
                                  <OptionSelect id="ed_konstrukce" value={flatConstruction} onChange={setFlatConstruction} options={CONSTRUCTION_OPTIONS} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_stav_bytu" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Stav bytu</Label>
                                  <OptionSelect id="ed_stav_bytu" value={flatCondition} onChange={setFlatCondition} options={FLAT_CONDITION_OPTIONS} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_penb" className="text-xs font-semibold text-stone-400 dark:text-stone-500">PENB</Label>
                                  <Select value={flatPenb} onValueChange={setFlatPenb}>
                                    <SelectTrigger id="ed_penb" className="h-10 text-xs">
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
                                  <Label htmlFor="ed_parkovani" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Parkování</Label>
                                  <Input id="ed_parkovani" 
                                    value={flatParking} 
                                    onChange={(e) => setFlatParking(e.target.value)} 
                                    placeholder="např. V domě, možnost garáže" 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 pt-1">
                                <ChipPicker field="flat_features" builtin={FLAT_FEATURE_OPTIONS} selected={flatFeatures || []} onChange={(v) => setFlatFeatures(v)} />
                              </div>
                            </>
                          ) : editKind === 'pozemek' ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_vymera_m2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Výměra (m²)</Label>
                                  <Input id="ed_vymera_m2"
                                    type="number"
                                    value={landSize}
                                    onChange={(e) => setLandSize(e.target.value)}
                                    placeholder="m²"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_druh_pozemku" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Druh pozemku</Label>
                                  <OptionSelect id="ed_druh_pozemku" value={landType} onChange={setLandType} options={LAND_TYPE_OPTIONS} className="w-full" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_uzemni_plan" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Územní plán</Label>
                                  <OptionSelect id="ed_uzemni_plan" value={zoningPlan} onChange={setZoningPlan} options={ZONING_PLAN_OPTIONS} className="w-full" />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_pristup" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Přístup</Label>
                                  <OptionSelect id="ed_pristup" value={landAccess} onChange={setLandAccess} options={LAND_ACCESS_OPTIONS} className="w-full" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_sirka_tvar_svazitost" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Šířka / tvar / svažitost</Label>
                                  <Input id="ed_sirka_tvar_svazitost"
                                    value={landDimensions}
                                    onChange={(e) => setLandDimensions(e.target.value)}
                                    placeholder="např. 20×40 m, rovina"
                                    className="h-10 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-stone-400 dark:text-stone-500">Zasíťování</Label>
                                <ChipPicker field="land_utilities" builtin={LAND_UTILITY_OPTIONS} selected={landUtilityList} onChange={(v) => setLandUtilities(v.join(', '))} />
                              </div>
                            </>
                          ) : editKind === 'garáž/ostatní' ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_typ_objektu" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Typ objektu</Label>
                                  <OptionSelect id="ed_typ_objektu" value={commSubtype} onChange={setCommSubtype} options={GARAGE_SUBTYPE_OPTIONS} className="w-full" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_garaz_plocha" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Plocha (m²)</Label>
                                  <Input id="ed_garaz_plocha"
                                    type="number"
                                    value={commFloorArea}
                                    onChange={(e) => setCommFloorArea(e.target.value)}
                                    placeholder="m²"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_garaz_stav" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Stav</Label>
                                  <OptionSelect id="ed_garaz_stav" value={commCondition} onChange={setCommCondition} options={GARAGE_CONDITION_OPTIONS} className="w-full" />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="ed_garaz_vjezd" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Vjezd / přístup</Label>
                                <Input id="ed_garaz_vjezd"
                                  value={commParking}
                                  onChange={(e) => setCommParking(e.target.value)}
                                  placeholder="např. vrata na dálkové ovládání"
                                  className="h-10 text-xs"
                                />
                              </div>
                            </>
                          ) : editKind === 'komerční' ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_podtyp" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Podtyp</Label>
                                  <OptionSelect id="ed_podtyp" value={commSubtype} onChange={setCommSubtype} options={COMM_SUBTYPE_OPTIONS} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_podlahova_plocha_m2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Podlahová plocha (m²)</Label>
                                  <Input id="ed_podlahova_plocha_m2"
                                    type="number"
                                    value={commFloorArea}
                                    onChange={(e) => setCommFloorArea(e.target.value)}
                                    placeholder="m²"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_penb_2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">PENB</Label>
                                  <Select value={commPenb} onValueChange={setCommPenb}>
                                    <SelectTrigger id="ed_penb_2" className="h-10 text-xs">
                                      <SelectValue placeholder="Vyberte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PENB_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_stav_vybavenost" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Stav / vybavenost</Label>
                                  <Input id="ed_stav_vybavenost"
                                    value={commCondition}
                                    onChange={(e) => setCommCondition(e.target.value)}
                                    placeholder="např. po rekonstrukci, klimatizace"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_parkovani_vjezd" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Parkování / vjezd</Label>
                                  <Input id="ed_parkovani_vjezd"
                                    value={commParking}
                                    onChange={(e) => setCommParking(e.target.value)}
                                    placeholder="např. 4 stání ve dvoře"
                                    className="h-10 text-xs"
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_dispozice_2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Dispozice *</Label>
                                  <OptionSelect id="ed_dispozice_2" value={houseLayout} onChange={setHouseLayout} options={HOUSE_LAYOUT_OPTIONS} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_uzitna_plocha_m2_2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Užitná plocha (m²) *</Label>
                                  <Input id="ed_uzitna_plocha_m2_2" 
                                    type="number" 
                                    value={houseArea} 
                                    onChange={(e) => setHouseArea(e.target.value)} 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_plocha_pozemku_m2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Plocha pozemku (m²) *</Label>
                                  <Input id="ed_plocha_pozemku_m2" 
                                    type="number" 
                                    value={landArea} 
                                    onChange={(e) => setLandArea(e.target.value)} 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_typ_domu" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Typ domu</Label>
                                  <OptionSelect id="ed_typ_domu" value={houseType} onChange={setHouseType} options={HOUSE_TYPE_OPTIONS} />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_pocet_podlazi" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Počet podlaží</Label>
                                  <Input id="ed_pocet_podlazi" 
                                    type="number" 
                                    value={houseFloors} 
                                    onChange={(e) => setHouseFloors(e.target.value)} 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_stav_domu" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Stav domu</Label>
                                  <OptionSelect id="ed_stav_domu" value={houseCondition} onChange={setHouseCondition} options={FLAT_CONDITION_OPTIONS} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_penb_3" className="text-xs font-semibold text-stone-400 dark:text-stone-500">PENB</Label>
                                  <Select value={housePenb} onValueChange={setHousePenb}>
                                    <SelectTrigger id="ed_penb_3" className="h-10 text-xs">
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
                                  <Label htmlFor="ed_parkovani_2" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Parkování</Label>
                                  <Input id="ed_parkovani_2" 
                                    value={flatParking} 
                                    onChange={(e) => setFlatParking(e.target.value)} 
                                    placeholder="např. V domě, možnost garáže" 
                                    className="h-10 text-xs" 
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 pt-1">
                                <ChipPicker field="house_features" builtin={HOUSE_FEATURE_OPTIONS} selected={houseFeatures || []} onChange={(v) => setHouseFeatures(v)} />
                              </div>
                            </>
                          )}

                          {/* Pronájem — edit */}
                          {editTransaction === 'pronájem' && (
                            <div className="border-t border-dashed border-stone-200 dark:border-stone-800 pt-4 space-y-4">
                              <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Pronájem</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_vratna_kauce_kc" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Vratná kauce (Kč)</Label>
                                  <Input id="ed_vratna_kauce_kc"
                                    type="number"
                                    value={rentDeposit}
                                    onChange={(e) => setRentDeposit(e.target.value)}
                                    placeholder="Kč"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_mesicni_poplatky_kc" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Měsíční poplatky (Kč)</Label>
                                  <Input id="ed_mesicni_poplatky_kc"
                                    type="number"
                                    value={rentFeesUtilities}
                                    onChange={(e) => setRentFeesUtilities(e.target.value)}
                                    placeholder="Kč"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_doba_najmu" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Doba nájmu</Label>
                                  <Input id="ed_doba_najmu"
                                    value={rentDuration}
                                    onChange={(e) => setRentDuration(e.target.value)}
                                    placeholder="např. 1 rok s prodloužením"
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_dostupne_od" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Dostupné od</Label>
                                  <Input id="ed_dostupne_od"
                                    type="date"
                                    value={rentAvailableFrom}
                                    onChange={(e) => setRentAvailableFrom(e.target.value)}
                                    className="h-10 text-xs"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="ed_vybaveni" className="text-xs font-semibold text-stone-400 dark:text-stone-500">Vybavení</Label>
                                  <OptionSelect id="ed_vybaveni" value={rentEquipment} onChange={setRentEquipment} options={RENT_EQUIPMENT_OPTIONS} />
                                </div>
                              </div>
                            </div>
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
                          editNote && (
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
                                setEditNote(selectedProperty.note || '');
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
                        !editNote ? (
                          <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 flex justify-between items-center bg-white dark:bg-stone-950">
                            <div className="text-left">
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                                Přidejte poznámku
                              </div>
                              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                                Jen pro vás — zájemcům se neposílá.
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
                            {editNote}
                          </div>
                        )
                      ) : (
                        <Textarea 
                          value={editNote} 
                          onChange={(e) => setEditNote(e.target.value)} 
                          placeholder="Na co si u téhle nemovitosti dát pozor…"
                          rows={4}
                          className="text-xs font-medium"
                        />
                      )}
                    </div>

                    {/* Section 4: Dokumenty a historie ceny */}
                    <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200/60 dark:border-stone-800 p-5">
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                          Dokumenty
                        </span>
                        <button
                          onClick={() => docInputRef.current?.click()}
                          disabled={uploadingDoc}
                          className="text-xs font-semibold text-[#0E8A5F] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {uploadingDoc ? 'Nahrávám…' : '+ Nahrát'}
                        </button>
                        <input
                          ref={docInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,image/*"
                          className="hidden"
                          onChange={(e) => { void handleUploadDocuments(e.target.files); e.target.value = ''; }}
                        />
                      </div>

                      <div className="space-y-4">
                        {documents.length === 0 ? (
                          <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-5 flex justify-between items-center gap-3 bg-white dark:bg-stone-950">
                            <div className="text-left">
                              <div className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                                Nahrajte dokumenty
                              </div>
                              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                                LV a PENB budou potřeba k rezervační smlouvě.
                              </div>
                            </div>
                            <button
                              onClick={() => docInputRef.current?.click()}
                              disabled={uploadingDoc}
                              className="text-xs font-bold text-[#0E8A5F] hover:underline cursor-pointer flex-none disabled:opacity-50"
                            >
                              {uploadingDoc ? 'Nahrávám…' : '+ Nahrát'}
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-stone-100 dark:divide-stone-850">
                            {documents.map((doc, idx) => (
                              <div key={doc.url} className="flex justify-between items-center py-2.5 text-xs min-w-0 gap-3">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 text-left min-w-0 hover:underline"
                                >
                                  <FileText className="w-3.5 h-3.5 text-stone-400 flex-none" />
                                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                                    {doc.name}
                                  </span>
                                  <span className="text-[11px] text-stone-400 dark:text-stone-500 flex-none">
                                    {formatDocMeta(doc)}
                                  </span>
                                </a>
                                <button
                                  onClick={() => void handleRemoveDocument(idx)}
                                  className="text-stone-400 hover:text-red-500 cursor-pointer flex-none"
                                  aria-label={`Odebrat ${doc.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {priceHistory.length > 0 && (
                          <div className="pt-3 border-t border-stone-100 dark:border-stone-850 space-y-1.5">
                            <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                              Historie ceny
                            </div>
                            {priceHistory.slice().reverse().map((change, i) => (
                              <div key={`${change.changed_at}-${i}`} className="flex items-center gap-2 text-[12.5px]">
                                <span className={cn('font-semibold', change.to < change.from ? 'text-[#0E8A5F]' : 'text-amber-600')}>
                                  {change.to < change.from ? '↓' : '↑'}
                                </span>
                                <span className="text-stone-700 dark:text-stone-300">
                                  {change.from.toLocaleString('cs-CZ')} → {change.to.toLocaleString('cs-CZ')} Kč
                                </span>
                                <span className="text-[11px] text-stone-400">
                                  {new Date(change.changed_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
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
                                        <SelectTrigger className="h-10 text-xs">
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
                                        <SelectTrigger className="h-10 text-xs">
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
                              <div className="text-stone-400 mt-1">Zadejte % nebo Kč — druhé dopočítám z ceny {propertyPrice.toLocaleString('cs-CZ')} Kč.</div>
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
                            Zadejte % nebo Kč — druhé se automaticky dopočítá z kupní ceny.
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
        <DialogContent className="max-w-2xl w-[94vw] sm:w-[90vw] max-h-[100dvh] sm:max-h-[92dvh] h-[100dvh] sm:h-auto overflow-hidden border-stone-200 p-0 flex flex-col">
          <DialogHeader className="shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-stone-200/80">
            <DialogTitle className="font-display text-xl sm:text-2xl font-normal text-left text-[#141414] dark:text-stone-100">Přidat nemovitost</DialogTitle>
            <DialogDescription className="text-xs text-left text-muted-foreground mt-0.5">
              Vložte odkaz na inzerát, nebo vyplňte údaje ručně.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="text-left flex flex-col min-h-0 flex-1">
            <div ref={createScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 sm:px-7 py-5 space-y-12 lg:space-y-7">

              {/* ───────── ROZCESTÍ ───────── */}
              {createMode === 'rozcestí' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-[19px] font-semibold text-stone-900 dark:text-stone-100">Jak budeme pokračovat?</h3>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1">
                      Máte odkaz na inzerát? Pak nevyplňujte nic — přečtu ho za vás.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCreateMode('import')}
                    className="w-full text-left rounded-xl border border-stone-200 dark:border-stone-800 p-5 hover:border-[#0E8A5F] hover:bg-[#0E8A5F]/[0.04] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#00D991] flex items-center justify-center flex-none">
                        <Sparkles className="w-5 h-5 text-[#00221F]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[15px] font-semibold text-stone-900 dark:text-stone-100">Mám odkaz na inzerát</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#00D991]/15 text-[#0E8A5F] px-1.5 py-0.5 rounded">Nejrychlejší</span>
                        </div>
                        <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          Sreality, Bezrealitky, RE/MAX… AI z něj vytáhne adresu, cenu i všechny parametry.
                          Vy jen zkontrolujete a uložíte.
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#0E8A5F] transition-colors mt-1 ml-auto flex-none" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCreateMode('kroky'); setWizardStep(0); }}
                    className="w-full text-left rounded-xl border border-stone-200 dark:border-stone-800 p-5 hover:border-[#0E8A5F] hover:bg-[#0E8A5F]/[0.04] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center flex-none">
                        <Edit className="w-4 h-4 text-stone-500" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-[15px] font-semibold text-stone-900 dark:text-stone-100">Zadám ručně</span>
                        <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          Krok za krokem, jedna otázka po druhé.
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#0E8A5F] transition-colors mt-1 ml-auto flex-none" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateMode('vse')}
                    className="text-[12.5px] text-stone-400 hover:text-[#0E8A5F] transition-colors cursor-pointer"
                  >
                    Radši vše na jedné stránce →
                  </button>
                </div>
              )}

              {/* ───────── IMPORT ───────── */}
              {createMode === 'import' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-[19px] font-semibold text-stone-900 dark:text-stone-100">Vložte odkaz na inzerát</h3>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1">
                      Zbytek nechte na mně.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="wizard_import_url"
                      type="url"
                      placeholder="https://www.sreality.cz/detail/…"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      disabled={isImporting}
                      className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950 w-full sm:flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleImportFromUrl}
                      disabled={isImporting || !importUrl}
                      className="h-10 text-xs shrink-0 font-medium"
                    >
                      {isImporting ? 'Načítám…' : 'Načíst inzerát'}
                    </Button>
                  </div>

                  {importStage && (
                    <div className="flex items-center gap-2.5 text-[13px] text-stone-500 dark:text-stone-400">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-[#0E8A5F] animate-spin" />
                      {importStage}
                    </div>
                  )}

                  {importLines.length > 0 && (
                    <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">
                        Načteno {importLines.length} údajů
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        {importLines.map((line) => (
                          <div key={line.label} className="flex items-start gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <span className="w-4 h-4 rounded-full bg-[#00D991] flex items-center justify-center flex-none mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-[#00221F]" strokeWidth={3} />
                            </span>
                            <span className="text-stone-500 dark:text-stone-400 min-w-0">
                              <span className="font-semibold text-stone-900 dark:text-stone-100">{line.label}</span>{' '}
                              {line.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isImporting && importLines.length > 0 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="wizard_owner">Vlastník *</Label>
                      <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                        <SelectTrigger id="wizard_owner" className="w-full border-stone-200 h-10 text-xs">
                          <span className={`text-xs ${newOwnerId ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {contacts.find((c) => c.id === newOwnerId)?.full_name || 'Vyberte vlastníka z kontaktů'}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* ───────── HOTOVO ───────── */}
              {createMode === 'hotovo' && createdSummary && (
                <div className="space-y-6 py-2">
                  <div className="w-12 h-12 rounded-full bg-[#00D991] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#00221F]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-[21px] font-semibold text-stone-900 dark:text-stone-100">
                      {describeProperty(createdSummary)} je v systému
                    </h3>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1">
                      {createdSummary.address} · {createdSummary.price.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Co dál</div>
                    {[
                      { label: 'Otevřít kartu nemovitosti', hint: 'doplnit fotky, poznámky, provizi' },
                      { label: 'Přiřadit zájemce', hint: `${getMatchingBuyersForProperty(createdSummary).length} kontaktů hledá něco podobného` },
                    ].map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        onClick={() => { setIsCreateOpen(false); setSelectedProperty(createdSummary); setIsDetailOpen(true); }}
                        className="w-full flex items-center justify-between gap-3 rounded-lg border border-stone-200 dark:border-stone-800 px-4 py-3 text-left hover:border-[#0E8A5F] hover:bg-[#0E8A5F]/[0.04] transition-colors cursor-pointer"
                      >
                        <span className="min-w-0">
                          <span className="block text-[14px] font-medium text-stone-900 dark:text-stone-100">{a.label}</span>
                          <span className="block text-[12px] text-stone-400">{a.hint}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#0E8A5F] flex-none" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="text-[12.5px] text-stone-400 hover:text-[#0E8A5F] transition-colors cursor-pointer"
                  >
                    + Přidat další nemovitost
                  </button>
                </div>
              )}

              {/* ───────── KROKY ───────── */}
              {createMode === 'kroky' && (
                <div className="space-y-5">
                  {/* postup */}
                  <div className="flex items-center gap-1.5">
                    {WIZARD_STEPS.map((s, i) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => i < wizardStep && setWizardStep(i)}
                        title={s.label}
                        className={cn(
                          'h-1.5 rounded-full transition-all cursor-pointer',
                          i === wizardStep ? 'bg-[#0E8A5F] w-8' : i < wizardStep ? 'bg-[#00D991] w-5' : 'bg-stone-200 dark:bg-stone-800 w-5'
                        )}
                      />
                    ))}
                    <span className="ml-auto text-[11px] font-medium text-stone-400 tabular-nums">
                      {wizardStep + 1}/{WIZARD_STEPS.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-[19px] font-semibold text-stone-900 dark:text-stone-100">
                      {WIZARD_STEPS[wizardStep].question}
                    </h3>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1">
                      {WIZARD_STEPS[wizardStep].hint}
                    </p>
                  </div>

                  {/* 1. Druh + transakce */}
                  {WIZARD_STEPS[wizardStep].key === 'druh' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {KIND_OPTIONS.map((opt) => {
                          const active = newKind === opt.id;
                          const Icon = KIND_ICONS[opt.id];
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setNewKind(opt.id as Property['kind'])}
                              className={cn(
                                'flex flex-col gap-2 rounded-lg border p-3.5 text-left transition-colors cursor-pointer',
                                active
                                  ? 'border-[#0E8A5F] bg-[#0E8A5F]/[0.06]'
                                  : 'border-stone-200 dark:border-stone-800 hover:border-[#0E8A5F]/60'
                              )}
                            >
                              <Icon className={cn('w-5 h-5', active ? 'text-[#0E8A5F]' : 'text-stone-400')} />
                              <span className="text-[13.5px] font-medium text-stone-900 dark:text-stone-100 capitalize">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        {TRANSACTION_OPTIONS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewTransaction(t as Property['transaction'])}
                            className={cn(
                              'px-4 h-9 rounded-full border text-[13px] font-medium transition-colors cursor-pointer capitalize',
                              newTransaction === t
                                ? 'border-[#0E8A5F] bg-[#0E8A5F] text-white'
                                : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-[#0E8A5F]/60'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Adresa */}
                  {WIZARD_STEPS[wizardStep].key === 'adresa' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="wizard_address">Adresa *</Label>
                      <Input
                        id="wizard_address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        onFocus={() => addrSuggestions.length > 0 && setAddrOpen(true)}
                        placeholder="Začněte psát ulici, např. Poděbradská"
                        className="border-stone-200 h-10 text-xs"
                        autoComplete="off"
                        autoFocus
                      />

                      {addrLoading && (
                        <div className="flex items-center gap-2 text-[12px] text-stone-400 pt-1">
                          <span className="w-3 h-3 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-[#0E8A5F] animate-spin" />
                          Hledám adresy…
                        </div>
                      )}

                      {addrOpen && addrSuggestions.length > 0 && (
                        <div ref={addrListRef} className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden mt-2">
                          <div className="px-3.5 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                            Nalezené adresy — vyberte
                          </div>
                          {addrSuggestions.map((sug) => (
                            <button
                              key={sug.label + sug.detail}
                              type="button"
                              onClick={() => pickAddress(sug.label)}
                              className="w-full text-left px-3.5 py-3 hover:bg-[#0E8A5F]/[0.06] transition-colors cursor-pointer flex items-center gap-3 border-b border-stone-100 dark:border-stone-850 last:border-b-0"
                            >
                              <span className="w-7 h-7 rounded-md bg-[#0E8A5F]/10 flex items-center justify-center flex-none">
                                <MapPin className="w-3.5 h-3.5 text-[#0E8A5F]" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[14px] font-medium text-stone-900 dark:text-stone-100">{sug.label}</span>
                                {sug.detail && <span className="block text-[12px] text-stone-400">{sug.detail}</span>}
                              </span>
                              <ChevronRight className="w-4 h-4 text-stone-300 ml-auto flex-none" />
                            </button>
                          ))}
                        </div>
                      )}

                      {!addrLoading && !addrOpen && (
                        <p className="text-[11.5px] text-stone-400 pt-0.5">
                          Vyberte ze seznamu, nebo dopište adresu ručně.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Parametry podle druhu */}
                  {WIZARD_STEPS[wizardStep].key === 'parametry' && (
                    <div className="space-y-4">
                      {newKind === 'byt' && (
                        <>
                          <div className="space-y-1.5">
                            <Label>Dispozice *</Label>
                            <div className="flex flex-wrap gap-2">
                              {FLAT_LAYOUT_OPTIONS.map((l) => (
                                <button
                                  key={l}
                                  type="button"
                                  onClick={() => setFlatLayout(l)}
                                  className={cn(
                                    'px-3.5 h-9 rounded-full border text-[13px] font-medium transition-colors cursor-pointer',
                                    flatLayout === l
                                      ? 'border-[#0E8A5F] bg-[#0E8A5F] text-white'
                                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-[#0E8A5F]/60'
                                  )}
                                >
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_flat_area">Užitná plocha (m²) *</Label>
                            <Input id="wizard_flat_area" type="number" value={flatArea}
                              onChange={(e) => setFlatArea(e.target.value)} placeholder="m²"
                              className="border-stone-200 h-10 text-xs" />
                          </div>
                        </>
                      )}
                      {newKind === 'dům' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_house_layout">Dispozice *</Label>
                            <OptionSelect id="wizard_house_layout" value={houseLayout} onChange={setHouseLayout} options={HOUSE_LAYOUT_OPTIONS} className="border-stone-200 w-full" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_house_area">Plocha (m²) *</Label>
                            <Input id="wizard_house_area" type="number" value={houseArea}
                              onChange={(e) => setHouseArea(e.target.value)} placeholder="m²" className="border-stone-200 h-10 text-xs" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_land_area">Pozemek (m²) *</Label>
                            <Input id="wizard_land_area" type="number" value={landArea}
                              onChange={(e) => setLandArea(e.target.value)} placeholder="m²" className="border-stone-200 h-10 text-xs" />
                          </div>
                        </div>
                      )}
                      {newKind === 'pozemek' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_land_size">Výměra (m²) *</Label>
                            <Input id="wizard_land_size" type="number" value={landSize}
                              onChange={(e) => setLandSize(e.target.value)} placeholder="m²" className="border-stone-200 h-10 text-xs" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_land_type">Druh pozemku</Label>
                            <OptionSelect id="wizard_land_type" value={landType} onChange={setLandType} options={LAND_TYPE_OPTIONS} className="border-stone-200 w-full" />
                          </div>
                        </div>
                      )}
                      {(newKind === 'komerční' || newKind === 'garáž/ostatní') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_comm_subtype">{newKind === 'komerční' ? 'Podtyp' : 'Typ objektu'}</Label>
                            <Select value={commSubtype} onValueChange={setCommSubtype}>
                              <SelectTrigger id="wizard_comm_subtype" className="border-stone-200 h-10 text-xs w-full">
                                <SelectValue placeholder="Vyberte" />
                              </SelectTrigger>
                              <SelectContent>
                                {(newKind === 'komerční' ? COMM_SUBTYPE_OPTIONS : GARAGE_SUBTYPE_OPTIONS).map((o) => (
                                  <SelectItem key={o} value={o}>{o}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_comm_area">Plocha (m²)</Label>
                            <Input id="wizard_comm_area" type="number" value={commFloorArea}
                              onChange={(e) => setCommFloorArea(e.target.value)} placeholder="m²" className="border-stone-200 h-10 text-xs" />
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowMoreParams(!showMoreParams)}
                        aria-expanded={showMoreParams}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors cursor-pointer',
                          showMoreParams
                            ? 'border-[#0E8A5F] bg-[#0E8A5F]/[0.06]'
                            : 'border-[#0E8A5F]/45 bg-[#0E8A5F]/[0.06] hover:border-[#0E8A5F] hover:bg-[#0E8A5F]/[0.11]'
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-lg bg-[#00D991] flex items-center justify-center flex-none">
                            <SlidersHorizontal className="w-4 h-4 text-[#00221F]" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="text-[14.5px] font-semibold text-stone-900 dark:text-stone-100">
                                {showMoreParams ? 'Skrýt ostatní parametry' : 'Vyplnit i ostatní parametry'}
                              </span>
                              {!showMoreParams && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#00D991]/20 text-[#0E8A5F] px-1.5 py-0.5 rounded">
                                  Nepovinné
                                </span>
                              )}
                            </span>
                            <span className="block text-[12px] text-stone-500 dark:text-stone-400 mt-0.5">{MORE_PARAMS_HINT[newKind]}</span>
                          </span>
                        </span>
                        <ChevronRight className={cn('w-5 h-5 text-[#0E8A5F] flex-none transition-transform', showMoreParams && 'rotate-90')} />
                      </button>

                      {showMoreParams && (
                        <div className="space-y-4 rounded-lg border border-[#0E8A5F]/30 bg-[#0E8A5F]/[0.03] p-4">
                          {newKind === 'byt' && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_floor">Patro / z pater</Label>
                                  <Input id="w2_floor" value={flatFloor} onChange={(e) => setFlatFloor(e.target.value)}
                                    placeholder="např. 3. ze 5" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_own">Vlastnictví</Label>
                                  <OptionSelect id="w2_own" value={flatOwnership} onChange={setFlatOwnership} options={OWNERSHIP_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_const">Konstrukce</Label>
                                  <OptionSelect id="w2_const" value={flatConstruction} onChange={setFlatConstruction} options={CONSTRUCTION_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_cond">Stav bytu</Label>
                                  <OptionSelect id="w2_cond" value={flatCondition} onChange={setFlatCondition} options={FLAT_CONDITION_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_penb">PENB</Label>
                                  <Select value={flatPenb} onValueChange={setFlatPenb}>
                                    <SelectTrigger id="w2_penb" className="border-stone-200 h-10 text-xs w-full bg-white dark:bg-stone-950"><SelectValue placeholder="Třída" /></SelectTrigger>
                                    <SelectContent>{PENB_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_park">Parkování</Label>
                                  <Input id="w2_park" value={flatParking} onChange={(e) => setFlatParking(e.target.value)}
                                    placeholder="např. garážové stání" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Vybavení bytu</Label>
                                <ChipPicker field="flat_features" builtin={FLAT_FEATURE_OPTIONS} selected={flatFeatures || []} onChange={(v) => setFlatFeatures(v)} />
                              </div>
                            </>
                          )}

                          {newKind === 'dům' && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_htype">Typ domu</Label>
                                  <OptionSelect id="w2_htype" value={houseType} onChange={setHouseType} options={HOUSE_TYPE_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_floors">Počet podlaží</Label>
                                  <Input id="w2_floors" type="number" value={houseFloors} onChange={(e) => setHouseFloors(e.target.value)}
                                    className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_hcond">Stav domu</Label>
                                  <OptionSelect id="w2_hcond" value={houseCondition} onChange={setHouseCondition} options={FLAT_CONDITION_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_hpenb">PENB</Label>
                                  <Select value={housePenb} onValueChange={setHousePenb}>
                                    <SelectTrigger id="w2_hpenb" className="border-stone-200 h-10 text-xs w-full bg-white dark:bg-stone-950"><SelectValue placeholder="Třída" /></SelectTrigger>
                                    <SelectContent>{PENB_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Vybavení a příslušenství</Label>
                                <ChipPicker field="house_features" builtin={HOUSE_FEATURE_OPTIONS} selected={houseFeatures || []} onChange={(v) => setHouseFeatures(v)} />
                              </div>
                            </>
                          )}

                          {newKind === 'pozemek' && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_zoning">Územní plán</Label>
                                  <OptionSelect id="w2_zoning" value={zoningPlan} onChange={setZoningPlan} options={ZONING_PLAN_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_access">Přístup</Label>
                                  <OptionSelect id="w2_access" value={landAccess} onChange={setLandAccess} options={LAND_ACCESS_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                  <Label htmlFor="w2_dims">Šířka / tvar / svažitost</Label>
                                  <Input id="w2_dims" value={landDimensions} onChange={(e) => setLandDimensions(e.target.value)}
                                    placeholder="např. 20×40 m, rovina" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Zasíťování</Label>
                                <ChipPicker field="land_utilities" builtin={LAND_UTILITY_OPTIONS} selected={landUtilityList} onChange={(v) => setLandUtilities(v.join(', '))} />
                              </div>
                            </>
                          )}

                          {(newKind === 'komerční' || newKind === 'garáž/ostatní') && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="w2_ccond">{newKind === 'komerční' ? 'Stav / vybavenost' : 'Stav'}</Label>
                                {newKind === 'komerční' ? (
                                  <Input id="w2_ccond" value={commCondition} onChange={(e) => setCommCondition(e.target.value)}
                                    placeholder="např. po rekonstrukci, klimatizace" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                ) : (
                                  <OptionSelect id="w2_ccond" value={commCondition} onChange={setCommCondition} options={GARAGE_CONDITION_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="w2_cpark">{newKind === 'komerční' ? 'Parkování / vjezd' : 'Vjezd / přístup'}</Label>
                                <Input id="w2_cpark" value={commParking} onChange={(e) => setCommParking(e.target.value)}
                                  placeholder="např. 4 stání ve dvoře" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                              </div>
                              {newKind === 'komerční' && (
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_cpenb">PENB</Label>
                                  <Select value={commPenb} onValueChange={setCommPenb}>
                                    <SelectTrigger id="w2_cpenb" className="border-stone-200 h-10 text-xs w-full bg-white dark:bg-stone-950"><SelectValue placeholder="Třída" /></SelectTrigger>
                                    <SelectContent>{PENB_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pronájem — jen když jde o nájem */}
                          {newTransaction === 'pronájem' && (
                            <div className="space-y-4 border-t border-[#0E8A5F]/20 pt-4">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Pronájem</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_deposit">Vratná kauce (Kč)</Label>
                                  <Input id="w2_deposit" type="number" value={rentDeposit} onChange={(e) => setRentDeposit(e.target.value)}
                                    placeholder="Kč" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_fees">Měsíční poplatky (Kč)</Label>
                                  <Input id="w2_fees" type="number" value={rentFeesUtilities} onChange={(e) => setRentFeesUtilities(e.target.value)}
                                    placeholder="Kč" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_rdur">Doba nájmu</Label>
                                  <Input id="w2_rdur" value={rentDuration} onChange={(e) => setRentDuration(e.target.value)}
                                    placeholder="např. 1 rok s prodloužením" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="w2_rfrom">Dostupné od</Label>
                                  <Input id="w2_rfrom" type="date" value={rentAvailableFrom} onChange={(e) => setRentAvailableFrom(e.target.value)}
                                    className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                  <Label htmlFor="w2_requip">Vybavení</Label>
                                  <OptionSelect id="w2_requip" value={rentEquipment} onChange={setRentEquipment} options={RENT_EQUIPMENT_OPTIONS} className="border-stone-200 w-full bg-white dark:bg-stone-950" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Popis a předání */}
                          <div className="space-y-4 border-t border-[#0E8A5F]/20 pt-4">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Popis a předání</div>
                            <div className="space-y-1.5">
                              <Label htmlFor="w2_facts">Co je v ceně / fakta pro odpovědi</Label>
                              <Textarea id="w2_facts" rows={3} value={newFacts} onChange={(e) => setNewFacts(e.target.value)}
                                placeholder="Co je v ceně, stav, zvláštnosti… AI z toho odpovídá zájemcům."
                                className="border-stone-200 text-xs bg-white dark:bg-stone-950" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="w2_handover">Možný termín předání</Label>
                              <Input id="w2_handover" value={newHandover} onChange={(e) => setNewHandover(e.target.value)}
                                placeholder="např. ihned, po dohodě, 3/2026"
                                className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                            </div>
                          </div>

                          {/* Provize */}
                          <div className="space-y-4 border-t border-[#0E8A5F]/20 pt-4">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Provize</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="w2_cpct">Provize (%)</Label>
                                <Input id="w2_cpct" type="number" value={commissionPct} onChange={(e) => setCommissionPct(e.target.value)}
                                  placeholder="%" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="w2_cval">Provize (Kč)</Label>
                                <Input id="w2_cval" type="number" value={commissionVal} onChange={(e) => setCommissionVal(e.target.value)}
                                  placeholder="Kč" className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Fotky — nepovinný krok */}
                  {WIZARD_STEPS[wizardStep].key === 'fotky' && (
                    <div className="space-y-3">
                      {photoWarning && photoPending && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30 px-3.5 py-3 flex gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
                          <div className="text-[12.5px] leading-relaxed text-amber-900 dark:text-amber-200">
                            <span className="font-semibold">Fotka zatím není přidaná.</span>{' '}
                            Potvrďte ořez tlačítkem <span className="font-semibold">Použít výřez</span>,
                            jinak se neuloží. Dalším kliknutím na Pokračovat půjdete dál bez ní.
                          </div>
                        </div>
                      )}

                      <PhotoUploader
                        photos={photoUrls}
                        onChange={setPhotoUrls}
                        onPendingChange={setPhotoPending}
                      />

                      <p className="text-[11.5px] text-stone-400">
                        Fotky jsou nepovinné — dají se doplnit kdykoli později na kartě nemovitosti.
                        Všechny se ořezávají na stejný formát 3:2, aby karty vypadaly jednotně.
                        První fotka je hlavní. Při importu z inzerátu se doplní sama.
                      </p>
                    </div>
                  )}

                  {WIZARD_STEPS[wizardStep].key === 'cena' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="wizard_price">{newTransaction === 'pronájem' ? 'Nájem (Kč / měsíc) *' : 'Cena (Kč) *'}</Label>
                        <Input id="wizard_price" type="number" value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)} placeholder="Kč"
                          className="border-stone-200 h-10 text-xs" autoFocus />
                      </div>
                      {pricePerM2 && (
                        <div className="text-[13px] text-stone-500 dark:text-stone-400 tabular-nums">
                          {pricePerM2} Kč/m²
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label htmlFor="wizard_status">Stav nabídky</Label>
                        <Select value={newOfferStatus} onValueChange={(v: Property['offer_status']) => setNewOfferStatus(v)}>
                          <SelectTrigger id="wizard_status" className="border-stone-200 h-10 text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OFFER_STATUS_OPTIONS.filter((o) => o !== 'prodá později').map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* 5. Vlastník */}
                  {WIZARD_STEPS[wizardStep].key === 'vlastnik' && (
                    <div className="space-y-4">
                      <div className="flex bg-stone-100 dark:bg-stone-850 p-0.5 rounded-md border border-stone-200 dark:border-stone-800">
                        {(['select', 'new'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setOwnerMode(m)}
                            className={cn(
                              'flex-1 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer',
                              ownerMode === m ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500'
                            )}
                          >
                            {m === 'select' ? 'Vybrat z kontaktů' : 'Nový vlastník'}
                          </button>
                        ))}
                      </div>

                      {ownerMode === 'select' ? (
                        <div className="space-y-1.5">
                          <Label htmlFor="wizard_owner_sel">Vlastník *</Label>
                          <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                            <SelectTrigger id="wizard_owner_sel" className="w-full border-stone-200 h-10 text-xs">
                              <span className={`text-xs ${newOwnerId ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {contacts.find((c) => c.id === newOwnerId)?.full_name || 'Vyberte vlastníka z kontaktů'}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {contacts.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.roles.join(', ')})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="wizard_owner_name">Jméno a příjmení *</Label>
                            <Input id="wizard_owner_name" value={newOwnerFullName}
                              onChange={(e) => setNewOwnerFullName(e.target.value)}
                              placeholder="např. Jan Novák" className="border-stone-200 h-10 text-xs" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="wizard_owner_phone">Telefon *</Label>
                              <Input id="wizard_owner_phone" value={newOwnerPhone}
                                onChange={(e) => setNewOwnerPhone(e.target.value)}
                                placeholder="+420 777 888 999" className="border-stone-200 h-10 text-xs" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="wizard_owner_email">E-mail</Label>
                              <Input id="wizard_owner_email" type="email" value={newOwnerEmail}
                                onChange={(e) => setNewOwnerEmail(e.target.value)}
                                placeholder="novak@seznam.cz" className="border-stone-200 h-10 text-xs" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {createMode === 'vse' && (
              <div className="space-y-12 lg:space-y-7">
              {/* AI Import — the fast path, first thing on screen */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3.5 rounded-lg space-y-2 text-left">
                <Label htmlFor="import_url" className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                  Bleskový import inzerátu pomocí AI
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="import_url"
                    type="url"
                    placeholder="Vložte odkaz (Sreality, Bezrealitky…)"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    disabled={isImporting}
                    className="border-stone-200 h-10 text-xs bg-white dark:bg-stone-950 w-full sm:flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleImportFromUrl}
                    disabled={isImporting || !importUrl}
                    size="sm"
                    className="h-10 text-xs shrink-0 font-medium"
                  >
                    {isImporting ? 'Načítám…' : 'Importovat'}
                  </Button>
                </div>
                <p className="text-[10px] text-stone-400">
                  Stáhne inzerát a předvyplní všechna pole níže.
                </p>
              </div>

              {/* Section 1: Vlastník */}
              <section className="space-y-4">
                <h3 className="font-display text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800 pb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">1</span>
                  Vlastník
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
                      <SelectTrigger id="new_owner" className="w-full border-stone-200 h-10 text-xs">
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
                        className="border-stone-200 h-10 text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="owner_phone">Telefon *</Label>
                      <Input
                        id="owner_phone"
                        value={newOwnerPhone}
                        onChange={(e) => setNewOwnerPhone(e.target.value)}
                        placeholder="např. +420 777 888 999"
                        className="border-stone-200 h-10 text-xs"
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
                        className="border-stone-200 h-10 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="owner_source">Odkud přišel *</Label>
                        <Select value={newOwnerSource} onValueChange={setNewOwnerSource}>
                          <SelectTrigger id="owner_source" className="border-stone-200 h-10 text-xs w-full">
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
                          <SelectTrigger id="owner_status" className="border-stone-200 h-10 text-xs w-full">
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
              </section>

              {/* Section 2: Nemovitost */}
              <section className="space-y-4">
                <h3 className="font-display text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800 pb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">2</span>
                  Nemovitost
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="new_address">Přesná adresa nemovitosti *</Label>
                  <Input
                    id="new_address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="např. Bory, Plzeň"
                    required
                    className="border-stone-200 h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new_kind">Druh nemovitosti *</Label>
                    <Select value={newKind} onValueChange={(val: Property['kind']) => setNewKind(val)} required>
                      <SelectTrigger id="new_kind" className="border-stone-200 h-10 text-xs w-full">
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
                      <SelectTrigger id="new_trans" className="border-stone-200 h-10 text-xs w-full">
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
                      className="border-stone-200 h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new_status">Stav nabídky *</Label>
                    <Select value={newOfferStatus} onValueChange={(val: Property['offer_status']) => setNewOfferStatus(val)} required>
                      <SelectTrigger id="new_status" className="border-stone-200 h-10 text-xs w-full">
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
                        className="border-stone-200 h-10 text-xs"
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
                        className="border-stone-200 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new_rent_duration">Doba nájmu</Label>
                      <Input
                        id="new_rent_duration"
                        value={rentDuration}
                        onChange={(e) => setRentDuration(e.target.value)}
                        placeholder="např. 1 rok s prodloužením"
                        className="border-stone-200 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new_rent_from">Dostupné od</Label>
                      <Input
                        id="new_rent_from"
                        type="date"
                        value={rentAvailableFrom}
                        onChange={(e) => setRentAvailableFrom(e.target.value)}
                        className="border-stone-200 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new_rent_equipment">Vybavení</Label>
                      <OptionSelect id="new_rent_equipment" value={rentEquipment} onChange={(v) => setRentEquipment(v as string)} options={RENT_EQUIPMENT_OPTIONS} className="border-stone-200   w-full" />
                    </div>
                  </div>
                )}

              </section>

              {/* Section 3: Parametry podle druhu */}
              <section className="space-y-4">
                <h3 className="font-display text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800 pb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">3</span>
                  Parametry — {newKind}
                </h3>

                {newKind === 'byt' && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flat_layout">Dispozice *</Label>
                        <OptionSelect id="flat_layout" value={flatLayout} onChange={setFlatLayout} options={FLAT_LAYOUT_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flat_area">Užitná plocha (m²) *</Label>
                        <Input
                          id="flat_area"
                          type="number"
                          value={flatArea}
                          onChange={(e) => setFlatArea(e.target.value)}
                          className="border-stone-200 h-10 text-xs"
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
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flat_ownership">Vlastnictví</Label>
                        <OptionSelect id="flat_ownership" value={flatOwnership} onChange={setFlatOwnership} options={OWNERSHIP_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flat_const">Konstrukce</Label>
                        <OptionSelect id="flat_const" value={flatConstruction} onChange={setFlatConstruction} options={CONSTRUCTION_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flat_cond">Stav bytu</Label>
                        <OptionSelect id="flat_cond" value={flatCondition} onChange={setFlatCondition} options={FLAT_CONDITION_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flat_penb">PENB</Label>
                        <Select value={flatPenb} onValueChange={setFlatPenb}>
                          <SelectTrigger id="flat_penb" className="border-stone-200 h-10 text-xs w-full">
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
                      <ChipPicker field="flat_features" builtin={FLAT_FEATURE_OPTIONS} selected={flatFeatures || []} onChange={(v) => setFlatFeatures(v)} />
                    </div>
                  </div>
                )}

                {newKind === 'dům' && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="house_layout">Dispozice / místnosti *</Label>
                        <OptionSelect id="house_layout" value={houseLayout} onChange={setHouseLayout} options={HOUSE_LAYOUT_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="house_area">Užitná plocha (m²) *</Label>
                        <Input
                          id="house_area"
                          type="number"
                          value={houseArea}
                          onChange={(e) => setHouseArea(e.target.value)}
                          className="border-stone-200 h-10 text-xs"
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
                          className="border-stone-200 h-10 text-xs"
                          placeholder="m²"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="house_type">Typ domu</Label>
                        <OptionSelect id="house_type" value={houseType} onChange={setHouseType} options={HOUSE_TYPE_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="house_floors">Počet podlaží</Label>
                        <Input
                          id="house_floors"
                          type="number"
                          value={houseFloors}
                          onChange={(e) => setHouseFloors(e.target.value)}
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="house_cond">Stav domu</Label>
                        <OptionSelect id="house_cond" value={houseCondition} onChange={setHouseCondition} options={FLAT_CONDITION_OPTIONS} className="border-stone-200 w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="house_penb">PENB</Label>
                        <Select value={housePenb} onValueChange={setHousePenb}>
                          <SelectTrigger id="house_penb" className="border-stone-200 h-10 text-xs w-full">
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
                      <ChipPicker field="house_features" builtin={HOUSE_FEATURE_OPTIONS} selected={houseFeatures || []} onChange={(v) => setHouseFeatures(v)} />
                    </div>
                  </div>
                )}

                {newKind === 'pozemek' && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="land_size">Výměra (m²) *</Label>
                        <Input
                          id="land_size"
                          type="number"
                          value={landSize}
                          onChange={(e) => setLandSize(e.target.value)}
                          placeholder="např. 800"
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_type">Druh pozemku</Label>
                        <OptionSelect id="land_type" value={landType} onChange={setLandType} options={LAND_TYPE_OPTIONS} className="border-stone-200   w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="zoning_plan">Územní plán</Label>
                        <OptionSelect id="zoning_plan" value={zoningPlan} onChange={setZoningPlan} options={ZONING_PLAN_OPTIONS} className="border-stone-200   w-full" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="land_access">Přístup</Label>
                        <OptionSelect id="land_access" value={landAccess} onChange={setLandAccess} options={LAND_ACCESS_OPTIONS} className="border-stone-200   w-full" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="land_dimensions">Šířka / tvar / svažitost</Label>
                        <Input
                          id="land_dimensions"
                          value={landDimensions}
                          onChange={(e) => setLandDimensions(e.target.value)}
                          placeholder="např. 20×40 m, rovina"
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Zasíťování</Label>
                      <ChipPicker field="land_utilities" builtin={LAND_UTILITY_OPTIONS} selected={landUtilityList} onChange={(v) => setLandUtilities(v.join(', '))} />
                    </div>
                  </div>
                )}

                {newKind === 'komerční' && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="comm_subtype">Podtyp</Label>
                        <OptionSelect id="comm_subtype" value={commSubtype} onChange={(v) => setCommSubtype(v as string)} options={COMM_SUBTYPE_OPTIONS} className="border-stone-200   w-full" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="comm_floor_area">Podlahová plocha (m²)</Label>
                        <Input
                          id="comm_floor_area"
                          type="number"
                          value={commFloorArea}
                          onChange={(e) => setCommFloorArea(e.target.value)}
                          placeholder="m²"
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="comm_penb">PENB</Label>
                        <Select value={commPenb} onValueChange={(v) => setCommPenb(v as string)}>
                          <SelectTrigger id="comm_penb" className="border-stone-200 h-10 text-xs w-full">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {PENB_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="comm_condition">Stav / vybavenost</Label>
                        <Input
                          id="comm_condition"
                          value={commCondition}
                          onChange={(e) => setCommCondition(e.target.value)}
                          placeholder="např. po rekonstrukci, klimatizace"
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="comm_parking">Parkování / vjezd</Label>
                        <Input
                          id="comm_parking"
                          value={commParking}
                          onChange={(e) => setCommParking(e.target.value)}
                          placeholder="např. 4 stání ve dvoře"
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {newKind === 'garáž/ostatní' && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="garage_subtype">Typ objektu</Label>
                        <OptionSelect id="garage_subtype" value={commSubtype} onChange={setCommSubtype} options={GARAGE_SUBTYPE_OPTIONS} className="border-stone-200   w-full" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="garage_area">Plocha (m²)</Label>
                        <Input
                          id="garage_area"
                          type="number"
                          value={commFloorArea}
                          onChange={(e) => setCommFloorArea(e.target.value)}
                          placeholder="m²"
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="garage_condition">Stav</Label>
                        <OptionSelect id="garage_condition" value={commCondition} onChange={setCommCondition} options={GARAGE_CONDITION_OPTIONS} className="border-stone-200   w-full" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="garage_access">Vjezd / přístup</Label>
                      <Input
                        id="garage_access"
                        value={commParking}
                        onChange={(e) => setCommParking(e.target.value)}
                        placeholder="např. vrata na dálkové ovládání, vjezd z ulice"
                        className="border-stone-200 h-10 text-xs"
                      />
                    </div>
                  </div>
                )}

              </section>

              {/* Volitelné detaily — collapsed by default so the core flow stays short */}
              <section ref={optionalSectionRef} className="scroll-mt-2">
                <button
                  type="button"
                  onClick={toggleOptional}
                  aria-expanded={showOptional}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors cursor-pointer',
                    'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800',
                    'hover:border-[#0E8A5F]/50 hover:bg-stone-100/70 dark:hover:bg-stone-850'
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">4</span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider">
                        Foto, provize a poznámka
                      </span>
                      <span className="block text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                        Volitelné — {showOptional ? 'sbalit' : 'rozbalit a doplnit'}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className={cn('w-4 h-4 shrink-0 text-stone-400 transition-transform duration-200', showOptional && 'rotate-90')} />
                </button>

                {showOptional && (
                  <div className="space-y-4 pt-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="new_photo">Hlavní fotografie (URL)</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="new_photo"
                          type="text"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://…"
                          className="border-stone-200 h-10 text-xs flex-1"
                        />
                        {photoUrl && /^https?:\/\//i.test(photoUrl) && (
                          <img src={photoUrl} alt="Náhled" className="h-10 w-10 rounded object-cover border border-stone-200 shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="new_commission_pct">Provize makléře (%)</Label>
                        <Input
                          id="new_commission_pct"
                          type="number"
                          value={commissionPct}
                          onChange={(e) => setCommissionPct(e.target.value)}
                          placeholder="%"
                          className="border-stone-200 h-10 text-xs"
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
                          className="border-stone-200 h-10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="new_facts">Poznámka</Label>
                      <Textarea
                        id="new_facts"
                        rows={3}
                        value={newFacts}
                        onChange={(e) => setNewFacts(e.target.value)}
                        placeholder="Poznámka k nemovitosti…"
                        className="border-stone-200 text-xs"
                      />
                    </div>
                  </div>
                )}
              </section>
              </div>
              )}
            </div>

            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-none sm:rounded-b-xl bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 px-5 sm:px-7 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] flex flex-row items-center justify-between gap-3">
              {createMode === 'kroky' ? (
                <>
                  <button
                    type="button"
                    onClick={() => (wizardStep === 0 ? setCreateMode('rozcestí') : setWizardStep(wizardStep - 1))}
                    className="text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                  >
                    ← Zpět
                  </button>
                  {wizardStep < WIZARD_STEPS.length - 1 ? (
                    <Button type="button" disabled={!wizardStepValid} onClick={goToNextStep}>
                      {onPhotoStep && photoUrls.length === 0 && !photoPending
                        ? 'Pokračovat bez fotek'
                        : 'Pokračovat'}
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!wizardStepValid}>Uložit nemovitost</Button>
                  )}
                </>
              ) : createMode === 'vse' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCreateMode('rozcestí')}
                    className="text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                  >
                    ← Zpět na rozcestí
                  </button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Zrušit
                    </Button>
                    <Button type="submit">Vytvořit nemovitost</Button>
                  </div>
                </>
              ) : createMode === 'import' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCreateMode('rozcestí')}
                    className="text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                  >
                    ← Zpět
                  </button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setCreateMode('vse')} disabled={isImporting}>
                      Zkontrolovat vše
                    </Button>
                    <Button type="submit" disabled={isImporting || !newAddress}>Uložit nemovitost</Button>
                  </div>
                </>
              ) : createMode === 'hotovo' ? (
                <>
                  <span className="text-xs text-stone-400">Uloženo do databáze</span>
                  <Button type="button" onClick={() => setIsCreateOpen(false)}>Zavřít</Button>
                </>
              ) : (
                <>
                  <span className="text-xs text-stone-400">Vyberte, jak chcete pokračovat</span>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Zrušit
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
