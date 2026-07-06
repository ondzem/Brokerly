import React from 'react';
import { Deal, Contact, Property, Activity } from '@/types';
import { Plus, ArrowRight, CheckCircle2, ChevronRight, Home, LayoutGrid, AlertCircle, TrendingUp, Users, Briefcase } from 'lucide-react';

interface DashboardViewProps {
  deals: Deal[];
  contacts: Contact[];
  properties: Property[];
  activities: Activity[];
  theme: 'light' | 'dark';
  onNavigate: (tab: 'kanban' | 'contacts' | 'properties' | 'reminders' | 'settings') => void;
  onNavigateToContact?: (contactId: string) => void;
  onNavigateToProperty?: (propertyId: string) => void;
  onNavigateToDeal?: (dealId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  deals,
  contacts,
  properties,
  activities,
  theme,
  onNavigate,
  onNavigateToContact,
  onNavigateToProperty,
  onNavigateToDeal,
}) => {
  // Theme styling tokens
  const colors = theme === 'light' ? {
    bg: '#F2F1EC',
    textPrimary: '#0B1F1A',
    textSecondary: 'rgba(11,31,26,0.6)',
    textMuted: 'rgba(11,31,26,0.5)',
    cardBg: '#ffffff',
    cardBorder: 'border-[0.5px] border-stone-300/60 shadow-sm',
    divider: 'border-b-[0.5px] border-stone-100',
    accent: '#0E8A5F',
    accentBg: '#DCF5E7',
    accentText: '#0B5C3D',
    redBg: '#FADFD9',
    redText: '#A33A28',
    orangeBg: '#FBEED8',
    orangeText: '#8A5A16',
    grayBg: '#ECEBE6',
    grayText: '#55605C',
    propPlaceholderBg: '#E9E8E2',
    propPlaceholderStroke: 'rgba(11,31,26,0.22)',
  } : {
    bg: '#00221F',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(232,232,232,0.6)',
    textMuted: 'rgba(232,232,232,0.5)',
    cardBg: '#072C27',
    cardBorder: 'border-[0.5px] border-white/10 shadow-sm',
    divider: 'border-b-[0.5px] border-white/5',
    accent: '#00D991',
    accentBg: 'rgba(0,217,145,0.13)',
    accentText: '#4FE0AC',
    redBg: 'rgba(216,82,60,0.16)',
    redText: '#EC9483',
    orangeBg: 'rgba(232,161,60,0.15)',
    orangeText: '#EFC183',
    grayBg: 'rgba(232,232,232,0.1)',
    grayText: '#C3CFCC',
    propPlaceholderBg: '#0B3833',
    propPlaceholderStroke: 'rgba(232,232,232,0.25)',
  };

  // Helper: Czech Friendly Vocalized First Name
  const getVocative = (name: string) => {
    if (!name) return 'makléři';
    const first = name.split(' ')[0];
    const map: Record<string, string> = {
      'Jan': 'Jane',
      'Filip': 'Filipe',
      'Petr': 'Petře',
      'Pavel': 'Pavle',
      'Jiří': 'Jiří',
      'Tomáš': 'Tomáši',
      'Martin': 'Martine',
      'Jaroslav': 'Jaroslave',
      'Miroslav': 'Miroslave',
      'Zdeněk': 'Zdeňku',
      'František': 'Františku',
      'Ondřej': 'Ondřeji',
      'Josef': 'Josefe',
      'Václav': 'Václave',
      'Michal': 'Michale',
      'David': 'Davide',
      'Jakub': 'Jakube',
      'Lukáš': 'Lukáši',
    };
    return map[first] || first;
  };

  // Helper: Czech Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Dobré ráno';
    if (hour >= 12 && hour < 18) return 'Dobré odpoledne';
    if (hour >= 18 && hour < 22) return 'Dobrý večer';
    return 'Dobrý den';
  };

  // Helper: Czech priority text formatter
  const getPriorityText = (count: number) => {
    if (count === 0) return 'Zatím klid. Začni přidáním první nemovitosti.';
    if (count === 1) return 'Dnes máš 1 věc, kterou nesmíš minout.';
    if (count >= 2 && count <= 4) return `Dnes máš ${count} věci, které nesmíš minout.`;
    return `Dnes máš ${count} věcí, které nesmíš minout.`;
  };

  // Helper: Czech Date
  const getCzechDate = () => {
    const days = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
    const months = [
      'ledna', 'února', 'března', 'dubna', 'května', 'června',
      'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
    ];
    const d = new Date();
    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName} ${dayNum}. ${monthName} ${year}`;
  };

  // Calculations for real data metrics
  const activeDeals = deals.filter((d) => d.result === 'otevřený');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const activeProperties = properties.filter((p) => p.offer_status === 'v nabídce');

  const formatCurrency = (val: number) => {
    if (val === 0) return '0 Kč';
    if (val >= 1000000) {
      return (val / 1000000).toLocaleString('cs-CZ', { maximumFractionDigits: 1 }) + ' mil. Kč';
    }
    return val.toLocaleString('cs-CZ') + ' Kč';
  };

  // Simplified matching count for real properties
  const getMatchingCount = (prop: Property) => {
    const buyers = contacts.filter(c => c.roles.includes('kupující'));
    return buyers.filter(b => {
      if (b.seeking_kind && b.seeking_kind.length > 0 && !b.seeking_kind.includes(prop.kind as any)) {
        return false;
      }
      if (b.budget_to && prop.price > b.budget_to) return false;
      if (b.budget_from && prop.price < b.budget_from) return false;
      if (b.seeking_transaction && b.seeking_transaction !== prop.transaction) return false;
      return true;
    }).length;
  };

  // Load Real Data or Mock Fallbacks
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  // Real priorities: today's pending reminders
  const realPriorities = activities.filter(a => a.is_reminder && !a.done && new Date(a.when) <= todayEnd);
  realPriorities.sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  // Real reminders: overdue + today upcoming
  const realReminders = activities.filter(a => a.is_reminder && !a.done);
  realReminders.sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  // Real new leads: contacts with status 'nový'
  const realLeads = contacts.filter(c => c.status === 'nový' && c.roles.includes('kupující'));

  // Deciding dynamic counts
  const prioritiesCount = realPriorities.length > 0 ? realPriorities.length : 3;

  return (
    <div 
      className="flex-grow flex flex-col min-h-screen py-8 px-4 md:px-8 lg:px-12 select-none font-sans"
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.textPrimary
      }}
    >
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-light text-3xl md:text-4xl leading-tight" style={{ color: colors.textPrimary }}>
              {getGreeting()}, {getVocative('Filip')}.
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {getPriorityText(realPriorities.length > 0 ? realPriorities.length : 3)}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 self-end md:self-auto">
            <span className="text-[11px] font-light uppercase tracking-wider" style={{ color: colors.textMuted }}>
              {getCzechDate()}
            </span>
          </div>
        </div>

        {/* SECTION 1: TODAY'S PRIORITIES */}
        <div className={`rounded-xl p-5 md:p-6 ${colors.cardBorder} shadow-sm`} style={{ backgroundColor: colors.cardBg }}>
          <div className={`flex justify-between items-baseline pb-3 mb-1 ${colors.divider}`}>
            <span className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>Dnešní priority</span>
            <span className="text-xs font-light" style={{ color: colors.textSecondary }}>{prioritiesCount} zbývají</span>
          </div>
          
          <div className="divide-y divide-stone-100 dark:divide-white/5">
            {realPriorities.length > 0 ? (
              realPriorities.slice(0, 5).map((act, i) => {
                const associatedContact = contacts.find(c => c.id === act.contact_id);
                return (
                  <div key={act.id || i} className="flex gap-4 items-start py-4 group">
                    <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600 flex-shrink-0 mt-0.5 group-hover:border-[#00D991] transition-all cursor-pointer"></div>
                    <div className="flex-grow">
                      <div className="font-semibold text-sm cursor-pointer hover:underline" style={{ color: colors.textPrimary }} onClick={() => onNavigateToContact && onNavigateToContact(act.contact_id)}>
                        {act.type === 'PŘIPOMÍNKA' ? 'Připomínka' : act.type}: {act.content.split('\n')[0]}
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        {associatedContact ? associatedContact.full_name : 'Neznámý kontakt'} {act.content.includes('·') ? act.content.substring(act.content.indexOf('·')) : ''}
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigateToContact && onNavigateToContact(act.contact_id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              // Mock Fallback Priorities
              <>
                <div className="flex gap-4 items-start py-4 group">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600 flex-shrink-0 mt-0.5 group-hover:border-[#00D991] transition-all cursor-pointer"></div>
                  <div className="flex-grow">
                    <div className="font-semibold text-sm hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Zavolat Novákovi</div>
                    <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>Novákovi jsi slíbil ozvat se dnes · Byt 3+kk, Slovanská 61, Plzeň</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </div>
                <div className="flex gap-4 items-start py-4 group">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600 flex-shrink-0 mt-0.5 group-hover:border-[#00D991] transition-all cursor-pointer"></div>
                  <div className="flex-grow">
                    <div className="font-semibold text-sm hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Follow-up po prohlídce</div>
                    <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>Veselá byla včera na prohlídce · Byt 3+kk, Slovanská 61, Plzeň</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </div>
                <div className="flex gap-4 items-start py-4 group">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600 flex-shrink-0 mt-0.5 group-hover:border-[#00D991] transition-all cursor-pointer"></div>
                  <div className="flex-grow">
                    <div className="font-semibold text-sm hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Poslat podklady k hypotéce</div>
                    <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>Dvořákovi čekají od pátku · Rodinný dům, Polabiny, Pardubice</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: REMINDERS & NEW DEMANDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* REMINDERS CARD */}
          <div className={`rounded-xl p-5 md:p-6 ${colors.cardBorder} shadow-sm`} style={{ backgroundColor: colors.cardBg }}>
            <div className={`flex justify-between items-center pb-3 mb-1 ${colors.divider}`}>
              <span className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>Připomínky</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.redBg, color: colors.redText }}>
                {realReminders.filter(r => new Date(r.when) < now).length > 0 ? `${realReminders.filter(r => new Date(r.when) < now).length} po termínu` : '2 po termínu'}
              </span>
            </div>
            
            <div className="divide-y divide-stone-100 dark:divide-white/5">
              {realReminders.length > 0 ? (
                realReminders.slice(0, 4).map((rem, i) => {
                  const isOverdue = new Date(rem.when) < now;
                  const associatedContact = contacts.find(c => c.id === rem.contact_id);
                  const formattedTime = new Date(rem.when).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
                  const dateDiff = Math.ceil((now.getTime() - new Date(rem.when).getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <div key={rem.id || i} className="flex gap-3 py-3 items-start group">
                      <div className="w-[3px] rounded-sm self-stretch flex-shrink-0" style={{ backgroundColor: isOverdue ? '#D8523C' : '#E8A13C' }} />
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-[13.5px] truncate hover:underline cursor-pointer" style={{ color: colors.textPrimary }} onClick={() => onNavigateToContact && onNavigateToContact(rem.contact_id)}>
                          {rem.content.split('\n')[0]}
                        </div>
                        <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>
                          {associatedContact ? associatedContact.full_name : 'Přiřazený kontakt'}
                        </div>
                      </div>
                      <span className="text-[11.5px] font-medium flex-shrink-0 self-center" style={{ color: isOverdue ? colors.redText : colors.orangeText }}>
                        {isOverdue ? `${dateDiff} ${dateDiff === 1 ? 'den' : dateDiff < 5 ? 'dny' : 'dní'} po termínu` : `dnes ${formattedTime}`}
                      </span>
                    </div>
                  );
                })
              ) : (
                // Mock Reminders
                <>
                  <div className="flex gap-3 py-3 items-start">
                    <div className="w-[3px] bg-[#D8523C] rounded-sm self-stretch flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-[13.5px] truncate hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Odeslat rezervační smlouvu Benešovi</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Byt 2+kk, Koterovská 18, Plzeň</div>
                    </div>
                    <span className="text-[11.5px] font-medium flex-shrink-0 self-center" style={{ color: colors.redText }}>2 dny po termínu</span>
                  </div>
                  <div className="flex gap-3 py-3 items-start">
                    <div className="w-[3px] bg-[#D8523C] rounded-sm self-stretch flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-[13.5px] truncate hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Potvrdit termín fotografa</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Rodinný dům, Staré Čívice, Pardubice</div>
                    </div>
                    <span className="text-[11.5px] font-medium flex-shrink-0 self-center" style={{ color: colors.redText }}>1 den po termínu</span>
                  </div>
                  <div className="flex gap-3 py-3 items-start">
                    <div className="w-[3px] bg-[#E8A13C] rounded-sm self-stretch flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-[13.5px] truncate hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Prohlídka s Malou</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Klatovská 89, Plzeň</div>
                    </div>
                    <span className="text-[11.5px] font-medium flex-shrink-0 self-center" style={{ color: colors.orangeText }}>dnes 14:00</span>
                  </div>
                  <div className="flex gap-3 py-3 items-start">
                    <div className="w-[3px] bg-[#E8A13C] rounded-sm self-stretch flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-[13.5px] truncate hover:underline cursor-pointer" onClick={() => onNavigate('reminders')}>Zavolat právničce</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Rezervační smlouva — Koterovská</div>
                    </div>
                    <span className="text-[11.5px] font-medium flex-shrink-0 self-center" style={{ color: colors.orangeText }}>dnes 16:30</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* NEW LEADS CARD */}
          <div className={`rounded-xl p-5 md:p-6 ${colors.cardBorder} shadow-sm`} style={{ backgroundColor: colors.cardBg }}>
            <div className={`flex justify-between items-baseline pb-3 mb-1 ${colors.divider}`}>
              <span className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>Nové poptávky</span>
              <span className="text-xs font-light" style={{ color: colors.textSecondary }}>
                {realLeads.length > 0 ? `${realLeads.length} od včera` : '3 od včera'}
              </span>
            </div>
            
            <div className="divide-y divide-stone-100 dark:divide-white/5">
              {realLeads.length > 0 ? (
                realLeads.slice(0, 3).map((c, i) => {
                  // Get temperature badge colors
                  let tempColor = colors.grayText;
                  let tempBg = colors.grayBg;
                  let tempLabel = 'Vlažný';

                  if (c.temperature === 'horký') {
                    tempColor = colors.redText;
                    tempBg = colors.redBg;
                    tempLabel = 'Horký';
                  } else if (c.temperature === 'vlažný') {
                    tempColor = colors.orangeText;
                    tempBg = colors.orangeBg;
                    tempLabel = 'Vlažný';
                  } else if (c.temperature === 'studený') {
                    tempColor = colors.grayText;
                    tempBg = colors.grayBg;
                    tempLabel = 'Studený';
                  }

                  const layouts = c.seeking_layout ? c.seeking_layout.join(', ') : 'neurčeno';
                  const budgetText = c.budget_to ? `do ${formatCurrency(c.budget_to)}` : '';

                  return (
                    <div key={c.id || i} className="flex justify-between items-center py-[13.5px] group cursor-pointer hover:bg-stone-50/5 dark:hover:bg-white/5 px-1 rounded-lg" onClick={() => onNavigateToContact && onNavigateToContact(c.id)}>
                      <div className="min-w-0">
                        <div className="font-medium text-[13.5px] truncate" style={{ color: colors.textPrimary }}>{c.full_name}</div>
                        <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>
                          Hledá {layouts} {budgetText}, {c.seeking_location || 'lokalita neuvedena'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: tempBg, color: tempColor }}>
                          {tempLabel}
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })
              ) : (
                // Mock Leads
                <>
                  <div className="flex justify-between items-center py-[13.5px] group cursor-pointer hover:bg-stone-50/5 dark:hover:bg-white/5 px-1 rounded-lg" onClick={() => onNavigate('contacts')}>
                    <div className="min-w-0">
                      <div className="font-medium text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Karolína Veselá</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Hledá 3+kk do 5 mil, Plzeň</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.redBg, color: colors.redText }}>Horký</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-[13.5px] group cursor-pointer hover:bg-stone-50/5 dark:hover:bg-white/5 px-1 rounded-lg" onClick={() => onNavigate('contacts')}>
                    <div className="min-w-0">
                      <div className="font-medium text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Tomáš Šimek</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Pronájem 2+kk, Pardubice centrum</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.orangeBg, color: colors.orangeText }}>Vlažný</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-[13.5px] group cursor-pointer hover:bg-stone-50/5 dark:hover:bg-white/5 px-1 rounded-lg" onClick={() => onNavigate('contacts')}>
                    <div className="min-w-0">
                      <div className="font-medium text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Jana Horáková</div>
                      <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Pozemek do 2 mil, okolí Plzně</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.grayBg, color: colors.grayText }}>Studený</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
        </div>

        {/* SECTION 3: STATISTICS GRID */}
        <div className={`rounded-xl ${colors.cardBorder} shadow-sm grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-100 dark:divide-white/5 overflow-hidden`} style={{ backgroundColor: colors.cardBg }}>
          <div className="padding-stat p-5 flex flex-col justify-between" onClick={() => onNavigate('kanban')}>
            <div className="text-[24px] font-light tracking-tight flex items-baseline gap-1 select-text" style={{ color: colors.textPrimary }}>
              {activeDeals.length}
              <span className="text-xs font-semibold" style={{ color: colors.accent }}>+2 tento týden</span>
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>Aktivní obchody</div>
          </div>
          
          <div className="padding-stat p-5 flex flex-col justify-between" onClick={() => onNavigate('kanban')}>
            <div className="text-[24px] font-light tracking-tight select-text" style={{ color: colors.textPrimary }}>
              {formatCurrency(pipelineValue || 38400000)}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>V pipeline</div>
          </div>

          <div className="padding-stat p-5 flex flex-col justify-between" onClick={() => onNavigate('properties')}>
            <div className="text-[24px] font-light tracking-tight select-text" style={{ color: colors.textPrimary }}>
              {properties.length > 0 ? properties.length : 5}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>Nemovitosti v nabídce</div>
          </div>

          <div className="padding-stat p-5 flex flex-col justify-between" onClick={() => onNavigate('contacts')}>
            <div className="text-[24px] font-light tracking-tight flex items-baseline gap-1 select-text" style={{ color: colors.textPrimary }}>
              {contacts.length > 0 ? contacts.length : 214}
              <span className="text-xs font-semibold" style={{ color: colors.accent }}>+3</span>
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>Kontakty</div>
          </div>
        </div>

        {/* SECTION 4: PROPERTIES PREVIEW CARDS */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>Nemovitosti v nabídce</span>
            <span className="text-xs font-medium cursor-pointer flex items-center gap-1 transition-all" style={{ color: colors.accent }} onClick={() => onNavigate('properties')}>
              Zobrazit všechny <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.length > 0 ? (
              properties.slice(0, 4).map((p, i) => {
                const count = getMatchingCount(p);
                const titleStr = `${p.flat_layout || p.house_layout || ''} ${p.kind === 'byt' ? 'Byt' : p.kind === 'dům' ? 'Dům' : 'Nemovitost'}`;
                const addressStr = p.address.split(',')[0];
                const locationStr = p.address.split(',')[1] || '';
                const priceStr = p.price.toLocaleString('cs-CZ') + (p.transaction === 'pronájem' ? ' Kč/měs' : ' Kč');

                return (
                  <div key={p.id || i} className={`rounded-xl p-3 flex flex-col ${colors.cardBorder} hover:border-[#00D991]/40 transition-all group cursor-pointer`} style={{ backgroundColor: colors.cardBg }} onClick={() => onNavigateToProperty && onNavigateToProperty(p.id)}>
                    <div 
                      className="h-[104px] rounded-lg overflow-hidden flex items-center justify-center relative bg-cover bg-center"
                      style={{ 
                        backgroundColor: colors.propPlaceholderBg,
                        backgroundImage: p.attachments && p.attachments.length > 0 ? `url(${p.attachments[0]})` : 'none'
                      }}
                    >
                      {(!p.attachments || p.attachments.length === 0) && (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.propPlaceholderStroke} strokeWidth="1.4">
                          <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z"></path>
                        </svg>
                      )}
                    </div>
                    
                    <div className="pt-3 px-1 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-[13.5px] truncate" style={{ color: colors.textPrimary }}>{titleStr}, {addressStr}</div>
                        <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>{locationStr} · {priceStr}</div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-stone-100 dark:border-white/5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: colors.accentBg, color: colors.accentText }}>
                          {p.offer_status === 'v nabídce' ? 'V nabídce' : p.offer_status}
                        </span>
                        <span className="text-[11.5px]" style={{ color: colors.textSecondary }}>
                          {count} {count === 1 ? 'zájemce' : count >= 2 && count <= 4 ? 'zájemci' : 'zájemců'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Mock Properties
              <>
                <div className={`rounded-xl p-3 flex flex-col ${colors.cardBorder} hover:border-[#00D991]/40 transition-all cursor-pointer`} style={{ backgroundColor: colors.cardBg }} onClick={() => onNavigate('properties')}>
                  <div className="h-[104px] rounded-lg overflow-hidden flex items-center justify-center relative" style={{ backgroundColor: colors.propPlaceholderBg }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.propPlaceholderStroke} strokeWidth="1.4">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z"></path>
                    </svg>
                  </div>
                  <div className="pt-3 px-1">
                    <div className="font-semibold text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Byt 3+kk, Slovanská 61</div>
                    <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Plzeň · 5 490 000 Kč</div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.accentBg, color: colors.accentText }}>V nabídce</span>
                      <span className="text-[11.5px]" style={{ color: colors.textSecondary }}>4 zájemci</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-3 flex flex-col ${colors.cardBorder} hover:border-[#00D991]/40 transition-all cursor-pointer`} style={{ backgroundColor: colors.cardBg }} onClick={() => onNavigate('properties')}>
                  <div className="h-[104px] rounded-lg overflow-hidden flex items-center justify-center relative" style={{ backgroundColor: colors.propPlaceholderBg }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.propPlaceholderStroke} strokeWidth="1.4">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z"></path>
                    </svg>
                  </div>
                  <div className="pt-3 px-1">
                    <div className="font-semibold text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Rodinný dům, Polabiny</div>
                    <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Pardubice · 8 950 000 Kč</div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.accentBg, color: colors.accentText }}>Prohlídky</span>
                      <span className="text-[11.5px]" style={{ color: colors.textSecondary }}>2 zájemci</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-3 flex flex-col ${colors.cardBorder} hover:border-[#00D991]/40 transition-all cursor-pointer`} style={{ backgroundColor: colors.cardBg }} onClick={() => onNavigate('properties')}>
                  <div className="h-[104px] rounded-lg overflow-hidden flex items-center justify-center relative" style={{ backgroundColor: colors.propPlaceholderBg }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.propPlaceholderStroke} strokeWidth="1.4">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z"></path>
                    </svg>
                  </div>
                  <div className="pt-3 px-1">
                    <div className="font-semibold text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Byt 2+kk, Koterovská 18</div>
                    <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Plzeň · 4 200 000 Kč</div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.orangeBg, color: colors.orangeText }}>Rezervováno</span>
                      <span className="text-[11.5px]" style={{ color: colors.textSecondary }}>1 zájemce</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-3 flex flex-col ${colors.cardBorder} hover:border-[#00D991]/40 transition-all cursor-pointer`} style={{ backgroundColor: colors.cardBg }} onClick={() => onNavigate('properties')}>
                  <div className="h-[104px] rounded-lg overflow-hidden flex items-center justify-center relative" style={{ backgroundColor: colors.propPlaceholderBg }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.propPlaceholderStroke} strokeWidth="1.4">
                      <path d="M4.5 10.5L12 4l7.5 6.5V20h-5.5v-5.5h-4V20H4.5z"></path>
                    </svg>
                  </div>
                  <div className="pt-3 px-1">
                    <div className="font-semibold text-[13.5px] truncate" style={{ color: colors.textPrimary }}>Kancelář, Palackého 12</div>
                    <div className="text-[12px] truncate mt-0.5" style={{ color: colors.textSecondary }}>Pardubice · 24 000 Kč/měs</div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.accentBg, color: colors.accentText }}>V nabídce</span>
                      <span className="text-[11.5px]" style={{ color: colors.textSecondary }}>6 zájemců</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
