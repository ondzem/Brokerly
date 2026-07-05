import React, { useState, useEffect } from 'react';
import { fetchSettings, fetchContacts, fetchProperties, fetchDeals, fetchActivities, saveSettings } from '@/lib/db';
import { Settings, Contact, Property, Deal, Activity } from '@/types';
import { KanbanView } from '@/components/KanbanView';
import { ContactsView } from '@/components/ContactsView';
import { PropertiesView } from '@/components/PropertiesView';
import { RemindersView } from '@/components/RemindersView';
import { SettingsView } from '@/components/SettingsView';
import { Briefcase, Users, Home, Clock, Settings as SettingsIcon, Key } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-16 bg-[#00221F] border-r border-[#00221F] flex flex-col justify-between items-center py-6 fixed left-0 top-0 bottom-0 z-40">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Brand Logo */}
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 border border-white/10">
            <Key className="h-5 w-5 text-[#00D991]" />
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-3 w-full px-2">
            <button
              onClick={() => {
                setFocusDealId(undefined);
                setActiveTab('kanban');
              }}
              title="Nástěnka obchodů"
              className={`flex items-center justify-center p-3 rounded-md transition-all ${
                activeTab === 'kanban'
                  ? 'bg-white/10 text-[#00D991] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="h-5 w-5 stroke-[1.5]" />
            </button>

            <button
              onClick={() => {
                setFocusContactId(undefined);
                setActiveTab('contacts');
              }}
              title="Kontakty"
              className={`flex items-center justify-center p-3 rounded-md transition-all ${
                activeTab === 'contacts'
                  ? 'bg-white/10 text-[#00D991] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="h-5 w-5 stroke-[1.5]" />
            </button>

            <button
              onClick={() => {
                setFocusPropertyId(undefined);
                setActiveTab('properties');
              }}
              title="Nemovitosti"
              className={`flex items-center justify-center p-3 rounded-md transition-all ${
                activeTab === 'properties'
                  ? 'bg-white/10 text-[#00D991] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="h-5 w-5 stroke-[1.5]" />
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              title="Dnešní připomínky"
              className={`flex items-center justify-center p-3 rounded-md transition-all relative ${
                activeTab === 'reminders'
                  ? 'bg-white/10 text-[#00D991] border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="h-5 w-5 stroke-[1.5]" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Action */}
        <div className="w-full px-2">
          <button
            onClick={() => setActiveTab('settings')}
            title="Nastavení"
            className={`flex items-center justify-center p-3 rounded-md w-full transition-all ${
              activeTab === 'settings'
                ? 'bg-white/10 text-[#00D991] border border-white/15'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-grow flex flex-col min-h-screen pl-16">
        {/* Main Container */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E8E8E8] bg-white py-4 text-center text-[10px] text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            Brokerly Denní jádro · Stage 1 Core CRM
          </div>
        </footer>
      </div>
    </div>
  );
}
