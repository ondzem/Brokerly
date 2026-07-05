import React, { useState, useEffect } from 'react';
import { fetchSettings, fetchContacts, fetchProperties, fetchDeals, fetchActivities, saveSettings } from '@/lib/db';
import { Settings, Contact, Property, Deal, Activity } from '@/types';
import { KanbanView } from '@/components/KanbanView';
import { ContactsView } from '@/components/ContactsView';
import { PropertiesView } from '@/components/PropertiesView';
import { RemindersView } from '@/components/RemindersView';
import { SettingsView } from '@/components/SettingsView';
import { Briefcase, Users, Home, Clock, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

type ActiveTab = 'kanban' | 'contacts' | 'properties' | 'reminders' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  
  // Data States
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Link navigation focus states
  const [focusContactId, setFocusContactId] = useState<string | undefined>(undefined);
  const [focusPropertyId, setFocusPropertyId] = useState<string | undefined>(undefined);
  const [focusDealId, setFocusDealId] = useState<string | undefined>(undefined);

  // Load all tables
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch Settings first
      let currentSettings = await fetchSettings();
      if (!currentSettings) {
        // If settings table is empty, auto-insert a default record per spec
        currentSettings = await saveSettings({
          agent_name: 'Jan Makléř',
          sender_phone: '+420 777 000 111',
          sender_email: 'jan.makler@brokerly.cz',
          signature: 'S pozdravem,\nJan Makléř\nRealitní makléř',
          addressing: 'vykání',
          tone: 'věcný',
          reply_samples: null,
          languages: ['CZ'],
          reaction_limit_min: 15,
          escalation_rule: 'Pokud do 15 min neodpovím, poslat SMS',
          working_hours: 'Po-Pá 9:00 - 17:00',
          qualification_questions: null,
        });
      }
      setSettings(currentSettings);

      const [allContacts, allProperties, allDeals, allActivities] = await Promise.all([
        fetchContacts(),
        fetchProperties(),
        fetchDeals(),
        fetchActivities(),
      ]);

      setContacts(allContacts);
      setProperties(allProperties);
      setDeals(allDeals);
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Nepodařilo se načíst data z databáze.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute number of pending reminders today or overdue
  const getPendingRemindersCount = () => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return activities.filter(
      (act) => act.is_reminder && !act.done && new Date(act.when) <= todayEnd
    ).length;
  };

  const pendingCount = getPendingRemindersCount();

  // Navigation helpers to jump between views and focus on correct elements
  const handleNavigateToContact = (contactId: string) => {
    setFocusContactId(contactId);
    setActiveTab('contacts');
  };

  const handleNavigateToProperty = (propertyId: string) => {
    setFocusPropertyId(propertyId);
    setActiveTab('properties');
  };

  const handleNavigateToDeal = (dealId: string) => {
    setFocusDealId(dealId);
    setActiveTab('kanban');
    // Open deal detail directly if needed (will render on next mount)
  };

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-primary" />
          <p className="text-xs text-muted-foreground font-medium">Načítám data z databáze...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'kanban':
        return (
          <KanbanView
            deals={deals}
            contacts={contacts}
            properties={properties}
            activities={activities}
            onRefresh={() => loadData(true)}
            onNavigateToContact={handleNavigateToContact}
            onNavigateToProperty={handleNavigateToProperty}
          />
        );
      case 'contacts':
        return (
          <ContactsView
            contacts={contacts}
            deals={deals}
            properties={properties}
            activities={activities}
            initialSelectedContactId={focusContactId}
            onRefresh={() => loadData(true)}
            onNavigateToDeal={handleNavigateToDeal}
            onNavigateToProperty={handleNavigateToProperty}
          />
        );
      case 'properties':
        return (
          <PropertiesView
            properties={properties}
            contacts={contacts}
            deals={deals}
            initialSelectedPropertyId={focusPropertyId}
            onRefresh={() => loadData(true)}
            onNavigateToContact={handleNavigateToContact}
            onNavigateToDeal={handleNavigateToDeal}
          />
        );
      case 'reminders':
        return (
          <RemindersView
            activities={activities}
            onRefresh={() => loadData(true)}
            onNavigateToContact={handleNavigateToContact}
            onNavigateToDeal={handleNavigateToDeal}
          />
        );
      case 'settings':
        return (
          <SettingsView
            initialSettings={settings}
            onRefresh={() => loadData(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Editorial Header */}
      <header className="border-b border-[#00221F] bg-[#00221F] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Brand Logo */}
              <div className="flex flex-col text-left">
                <span className="font-display text-lg font-semibold tracking-tight text-white">
                  Brokerly
                </span>
                <span className="text-[10px] text-[#00D991] tracking-wider uppercase font-semibold -mt-1">
                  Denní jádro
                </span>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex gap-1.5">
                <button
                  onClick={() => {
                    setFocusDealId(undefined);
                    setActiveTab('kanban');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-colors ${
                    activeTab === 'kanban'
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 stroke-[1.5]" />
                  Nástěnka obchodů
                </button>

                <button
                  onClick={() => {
                    setFocusContactId(undefined);
                    setActiveTab('contacts');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-colors ${
                    activeTab === 'contacts'
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 stroke-[1.5]" />
                  Kontakty
                </button>

                <button
                  onClick={() => {
                    setFocusPropertyId(undefined);
                    setActiveTab('properties');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-colors ${
                    activeTab === 'properties'
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Home className="h-3.5 w-3.5 stroke-[1.5]" />
                  Nemovitosti
                </button>

                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-colors relative ${
                    activeTab === 'reminders'
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
                  Dnešní připomínky
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsIcon className="h-3.5 w-3.5 stroke-[1.5]" />
                Nastavení
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE9E2] bg-white py-4 text-center text-[10px] text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          Brokerly Denní jádro · Stage 1 Core CRM
        </div>
      </footer>
    </div>
  );
}
