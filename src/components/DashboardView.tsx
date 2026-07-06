import React from 'react';
import { Deal, Contact, Property, Activity } from '@/types';
import { Briefcase, Users, Home, Clock, Settings, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  deals: Deal[];
  contacts: Contact[];
  properties: Property[];
  activities: Activity[];
  onNavigate: (tab: 'kanban' | 'contacts' | 'properties' | 'reminders' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  deals,
  contacts,
  properties,
  activities,
  onNavigate,
}) => {
  // Calculations for metrics
  const activeDeals = deals.filter((d) => d.result === 'otevřený');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  const activeProperties = properties.filter((p) => p.offer_status === 'v nabídce');
  const totalPropertiesCount = properties.length;

  const totalContactsCount = contacts.length;
  const buyerContactsCount = contacts.filter((c) => c.roles.includes('kupující')).length;
  const ownerContactsCount = contacts.filter((c) => c.roles.includes('vlastník')).length;

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const pendingRemindersCount = activities.filter(
    (act) => act.is_reminder && !act.done && new Date(act.when) <= todayEnd
  ).length;

  const formatCurrency = (val: number) => {
    if (val === 0) return '0 Kč';
    if (val >= 1000000) {
      return (val / 1000000).toLocaleString('cs-CZ', { maximumFractionDigits: 1 }) + ' mil. Kč';
    }
    return val.toLocaleString('cs-CZ') + ' Kč';
  };

  return (
    <div className="min-h-screen w-full bg-[#00221F] text-white flex flex-col items-center justify-center px-6 py-12 md:py-20 select-none">
      {/* Brand logo & greeting */}
      <div className="text-center mb-10 md:mb-14 space-y-4">
        <div className="flex justify-center">
          <img
            src="/White Logo - Brokerly.webp"
            alt="Brokerly"
            className="w-16 h-16 md:w-20 md:h-20 object-contain"
          />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-light tracking-wide text-white/95">
          Co nás dnes čeká?
        </h2>
        <p className="text-xs text-white/40 font-mono tracking-wider uppercase">
          Vítejte zpět v Brokerly CRM
        </p>
      </div>

      {/* Grid of cards - Bento style layout */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-6 gap-4">
        
        {/* CARD 1: Dnešní úlohy (Obchody) - Span 3 */}
        <div
          onClick={() => onNavigate('kanban')}
          className="md:col-span-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#00D991] hover:bg-white/[0.05] cursor-pointer transition-all duration-200 flex flex-col justify-between group h-44 text-left"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-[#00D991]/10 transition-colors">
              <Briefcase className="h-5 w-5 text-white/70 group-hover:text-[#00D991] transition-colors" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#00D991] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Nástěnka obchodů
            </div>
            <h3 className="text-lg font-semibold mt-1">Dnešní úlohy</h3>
            <p className="text-xs text-white/60 mt-1 font-mono">
              {activeDeals.length} aktivních obchodu • {formatCurrency(pipelineValue)} v pipeline
            </p>
          </div>
        </div>

        {/* CARD 2: Nemovitosti - Span 3 */}
        <div
          onClick={() => onNavigate('properties')}
          className="md:col-span-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#00D991] hover:bg-white/[0.05] cursor-pointer transition-all duration-200 flex flex-col justify-between group h-44 text-left"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-[#00D991]/10 transition-colors">
              <Home className="h-5 w-5 text-white/70 group-hover:text-[#00D991] transition-colors" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#00D991] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Správa nemovitostí
            </div>
            <h3 className="text-lg font-semibold mt-1">Nemovitosti</h3>
            <p className="text-xs text-white/60 mt-1 font-mono">
              {activeProperties.length} v aktivní nabídce • {totalPropertiesCount} celkem
            </p>
          </div>
        </div>

        {/* CARD 3: Databáze klientů - Span 2 */}
        <div
          onClick={() => onNavigate('contacts')}
          className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#00D991] hover:bg-white/[0.05] cursor-pointer transition-all duration-200 flex flex-col justify-between group h-44 text-left"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-[#00D991]/10 transition-colors">
              <Users className="h-5 w-5 text-white/70 group-hover:text-[#00D991] transition-colors" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#00D991] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Adresář kontaktů
            </div>
            <h3 className="text-lg font-semibold mt-1">Databáze klientů</h3>
            <p className="text-xs text-white/60 mt-1 font-mono">
              {totalContactsCount} kontaktů ({buyerContactsCount} kup. / {ownerContactsCount} vlast.)
            </p>
          </div>
        </div>

        {/* CARD 4: Připomínky - Span 2 */}
        <div
          onClick={() => onNavigate('reminders')}
          className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#00D991] hover:bg-white/[0.05] cursor-pointer transition-all duration-200 flex flex-col justify-between group h-44 text-left"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-[#00D991]/10 transition-colors">
              <Clock className="h-5 w-5 text-white/70 group-hover:text-[#00D991] transition-colors" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#00D991] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Denní to-do list
            </div>
            <h3 className="text-lg font-semibold mt-1">Připomínky</h3>
            <p className="text-xs text-white/60 mt-1 font-mono">
              {pendingRemindersCount > 0 ? (
                <span className="text-[#00D991] font-semibold">{pendingRemindersCount} k vyřízení na dnes</span>
              ) : (
                <span>Všechny připomínky vyřízeny</span>
              )}
            </p>
          </div>
        </div>

        {/* CARD 5: Nastavení - Span 2 */}
        <div
          onClick={() => onNavigate('settings')}
          className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#00D991] hover:bg-white/[0.05] cursor-pointer transition-all duration-200 flex flex-col justify-between group h-44 text-left"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-[#00D991]/10 transition-colors">
              <Settings className="h-5 w-5 text-white/70 group-hover:text-[#00D991] transition-colors" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#00D991] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Konfigurace profilu
            </div>
            <h3 className="text-lg font-semibold mt-1">Nastavení</h3>
            <p className="text-xs text-white/60 mt-1 font-mono">
              Pracovní doba, šablony a pravidla
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
