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
  onClearFocusProperty?: () => void;
  onRefresh: () => void;
  onNavigateToContact: (contactId: string) => void;
  onNavigateToDeal: (dealId: string) => void;
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

        // Pozemek details
        land_size: editKind === 'pozemek' && landSize ? Number(landSize) : null,
        land_type: editKind === 'pozemek' ? landType || null : null,
        land_utilities: editKind === 'pozemek' && landUtilities ? landUtilities.split(',').map((s) => s.trim()).filter(Boolean) : null,
        zoning_plan: editKind === 'pozemek' ? zoningPlan || null : null,
        land_access: editKind === 'pozemek' ? landAccess || null : null,
        land_dimensions: editKind === 'pozemek' ? landDimensions || null : null,
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
        
        // Byt details
        flat_layout: newKind === 'byt' ? (flatLayout as Property['flat_layout']) : null,
        flat_area: newKind === 'byt' && flatArea ? Number(flatArea) : null,
        floor: newKind === 'byt' ? flatFloor || null : null,
        ownership: newKind === 'byt' ? (flatOwnership as Property['ownership']) || null : null,
        construction: newKind === 'byt' ? (flatConstruction as Property['construction']) || null : null,
        flat_condition: newKind === 'byt' ? (flatCondition as Property['flat_condition']) || null : null,
        flat_features: newKind === 'byt' ? flatFeatures : null,
        flat_penb: newKind === 'byt' ? (flatPenb as Property['flat_penb']) || null : null,

        // Dům details
        house_layout: newKind === 'dům' ? (houseLayout as Property['house_layout']) : null,
        house_area: newKind === 'dům' && houseArea ? Number(houseArea) : null,
        land_area: newKind === 'dům' && landArea ? Number(landArea) : null,
        house_type: newKind === 'dům' ? (houseType as Property['house_type']) || null : null,
        floors_count: newKind === 'dům' && houseFloors ? Number(houseFloors) : null,
        house_features: newKind === 'dům' ? houseFeatures : null,
        house_condition: newKind === 'dům' ? (houseCondition as Property['house_condition']) || null : null,
        house_penb: newKind === 'dům' ? (housePenb as Property['house_penb']) || null : null,

        // Pozemek details
        land_size: newKind === 'pozemek' && landSize ? Number(landSize) : null,
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
    } catch (error) {
      toast.error('Chyba při zakládání nemovitosti.');
    }
  };

  const handleImportFromUrl = async () => {
    if (!importUrl) {
      toast.error('Zadejte prosím platný odkaz na inzerát.');
      return;
    }

    const geminiKey = import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const scraperKey = import.meta.env.NEXT_PUBLIC_SCRAPER_API_KEY || '';

    if (!geminiKey || !scraperKey) {
      toast.error('Chybí API klíče. Nastavte NEXT_PUBLIC_GEMINI_API_KEY a NEXT_PUBLIC_SCRAPER_API_KEY v .env.local a restartujte aplikaci.');
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading('Stahuji obsah inzerátu přes proxy...');

    try {
      // 1. Download via local Vite development proxy (bypasses CORS completely and forwards consent cookies)
      const scraperUrl = `/api-scraper?api_key=${encodeURIComponent(scraperKey)}&url=${encodeURIComponent(importUrl)}&keep_headers=true`;
      const response = await fetch(scraperUrl);
      if (!response.ok) {
        throw new Error('Chyba při stahování stránky přes proxy. Zkontrolujte prosím Váš API klíč.');
      }
      const html = await response.text();

      // 2. Parse HTML and clean up to plain text to save tokens
      toast.loading('Analyzuji text inzerátu pomocí AI...', { id: toastId });
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('script, style, header, footer, nav, noscript, iframe, svg').forEach((el) => el.remove());
      const text = doc.body.innerText || doc.body.textContent || '';
      const cleanText = text.replace(/\s+/g, ' ').substring(0, 15000).trim();

      if (cleanText.length < 100) {
        throw new Error('Inzerát neobsahuje dostatek čitelného textu.');
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
              facts_for_answers: { type: "STRING", description: "Jakékoli další důležité poznámky k nemovitosti" }
            }
          }
        }
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiPayload)
      });

      if (!geminiRes.ok) {
        throw new Error('Chyba při komunikaci s Gemini API.');
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

      toast.success('Inzerát byl úspěšně načten a data byla doplněna!', { id: toastId });
      setImportUrl('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Nepodařilo se importovat data.', { id: toastId });
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
          onClick={handleOpenCreate}
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
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) onClearFocusProperty?.();
        }}>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-stone-200 p-6 md:p-8">
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

                    <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

                {/* Specific layouts based on kind selection */}
                {newKind === 'byt' && (
                  <div className="border-t border-stone-200 pt-4 space-y-4 text-left">
                    <h4 className="font-display text-xs font-semibold text-stone-700 uppercase tracking-wider">Specifické parametry pro BYT</h4>
                    <div className="grid grid-cols-3 gap-4">
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

                    <div className="grid grid-cols-4 gap-4">
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
                    <div className="grid grid-cols-3 gap-4">
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

                    <div className="grid grid-cols-4 gap-4">
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
                    <div className="grid grid-cols-3 gap-4">
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

                    <div className="grid grid-cols-3 gap-4">
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
