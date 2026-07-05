import React, { useState, useEffect } from 'react';
import { Settings } from '@/types';
import { saveSettings } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, User, Settings as SettingsIcon } from 'lucide-react';

interface SettingsViewProps {
  initialSettings: Settings | null;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialSettings, onRefresh }) => {
  const [agentName, setAgentName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [signature, setSignature] = useState('');
  const [addressing, setAddressing] = useState<'tykání' | 'vykání'>('vykání');
  const [tone, setTone] = useState<'přátelský' | 'věcný' | 'formální'>('věcný');
  const [replySamples, setReplySamples] = useState('');
  const [languages, setLanguages] = useState<('CZ' | 'EN' | 'DE' | 'UA')[]>(['CZ']);
  const [reactionLimitMin, setReactionLimitMin] = useState(15);
  const [escalationRule, setEscalationRule] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [qualificationQuestions, setQualificationQuestions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setAgentName(initialSettings.agent_name || '');
      setSenderPhone(initialSettings.sender_phone || '');
      setSenderEmail(initialSettings.sender_email || '');
      setSignature(initialSettings.signature || '');
      setAddressing(initialSettings.addressing || 'vykání');
      setTone(initialSettings.tone || 'věcný');
      setReplySamples(initialSettings.reply_samples || '');
      setLanguages(initialSettings.languages || ['CZ']);
      setReactionLimitMin(initialSettings.reaction_limit_min || 15);
      setEscalationRule(initialSettings.escalation_rule || '');
      setWorkingHours(initialSettings.working_hours || '');
      setQualificationQuestions(initialSettings.qualification_questions || '');
    }
  }, [initialSettings]);

  const handleLanguageToggle = (lang: 'CZ' | 'EN' | 'DE' | 'UA') => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !senderPhone || !senderEmail || !signature || !escalationRule) {
      toast.error('Prosím vyplňte všechna povinná pole.');
      return;
    }

    setLoading(true);
    try {
      await saveSettings({
        id: initialSettings?.id,
        agent_name: agentName,
        sender_phone: senderPhone,
        sender_email: senderEmail,
        signature,
        addressing,
        tone,
        reply_samples: replySamples || null,
        languages,
        reaction_limit_min: Number(reactionLimitMin),
        escalation_rule: escalationRule,
        working_hours: workingHours || null,
        qualification_questions: qualificationQuestions || null,
      });
      toast.success('Nastavení bylo úspěšně uloženo.');
      onRefresh();
    } catch (error) {
      toast.error('Nepodařilo se uložit nastavení.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-normal tracking-tight">Nastavení asistenta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Konfigurace vašeho osobního profilu makléře. Tato data slouží pro přípravu budoucí automatizace.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profil makléře */}
        <Card className="border-[#EAE9E2] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display font-normal flex items-center gap-2">
              <User className="h-5 w-5 stroke-[1.5]" />
              Základní údaje
            </CardTitle>
            <CardDescription className="text-xs">
              Vaše kontaktní údaje a podpis používaný v komunikaci.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="agent_name">Jméno makléře *</Label>
                <Input
                  id="agent_name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="např. Patrik Makléř"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="working_hours">Pracovní doba</Label>
                <Input
                  id="working_hours"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="např. Po-Pá 8:00 - 18:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sender_phone">Telefon odesílatele *</Label>
                <Input
                  id="sender_phone"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+420 777 999 888"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sender_email">E-mail odesílatele *</Label>
                <Input
                  id="sender_email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="patrik.makler@brokerly.cz"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signature">Podpis makléře *</Label>
              <Textarea
                id="signature"
                rows={4}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="např.&#10;S pozdravem,&#10;Patrik Makléř&#10;+420 777 999 888"
                required
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tón a komunikace */}
        <Card className="border-[#EAE9E2] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display font-normal flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 stroke-[1.5]" />
              Styl komunikace a konfigurace
            </CardTitle>
            <CardDescription className="text-xs">
              Definujte, jak má budoucí AI asistent oslovovat klienty a jaké tóny má volit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addressing">Oslovení *</Label>
                <Select
                  value={addressing}
                  onValueChange={(val) => { if (val === 'tykání' || val === 'vykání') setAddressing(val); }}
                >
                  <SelectTrigger id="addressing">
                    <SelectValue placeholder="Vyberte oslovení" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tykání">Tykání (kamarádský přístup)</SelectItem>
                    <SelectItem value="vykání">Vykání (profesionální přístup)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tone">Tón *</Label>
                <Select
                  value={tone}
                  onValueChange={(val) => { if (val === 'přátelský' || val === 'věcný' || val === 'formální') setTone(val); }}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Vyberte tón" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="přátelský">Přátelský</SelectItem>
                    <SelectItem value="věcný">Věcný / Stručný</SelectItem>
                    <SelectItem value="formální">Formální / Korporátní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jazyky, ve kterých komunikujete</Label>
              <div className="flex flex-wrap gap-4 pt-1">
                {(['CZ', 'EN', 'DE', 'UA'] as const).map((lang) => (
                  <label key={lang} className="flex items-center gap-2 text-sm font-normal cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                      className="rounded border-[#EAE9E2] text-primary focus:ring-primary h-4 w-4"
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reaction_limit">Reakční limit (speed-to-lead) v minutách *</Label>
                <Input
                  id="reaction_limit"
                  type="number"
                  min={1}
                  value={reactionLimitMin}
                  onChange={(e) => setReactionLimitMin(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="escalation_rule">Pravidlo eskalace *</Label>
                <Input
                  id="escalation_rule"
                  value={escalationRule}
                  onChange={(e) => setEscalationRule(e.target.value)}
                  placeholder="např. Pokud do 15 min neodpovím, pošli SMS upozornění"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualification_questions">Kvalifikační otázky na zájemce</Label>
              <Textarea
                id="qualification_questions"
                rows={3}
                value={qualificationQuestions}
                onChange={(e) => setQualificationQuestions(e.target.value)}
                placeholder="např. Jaký je váš rozpočet? Máte schválenou hypotéku? Musíte nejdříve prodat jinou nemovitost?"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reply_samples">Ukázky vašich odpovědí (pro trénování tónu AI)</Label>
              <Textarea
                id="reply_samples"
                rows={4}
                value={replySamples}
                onChange={(e) => setReplySamples(e.target.value)}
                placeholder="Vložte sem ukázky e-mailů nebo SMS zpráv, které běžně posíláte klientům."
              />
            </div>
          </CardContent>
        </Card>

        {/* Sekce Kancelář - disabled / deferred */}
        <Card className="border-[#EAE9E2] bg-stone-50/50 shadow-sm opacity-70">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display font-normal text-muted-foreground">
              Týmové funkce (Kancelář)
            </CardTitle>
            <CardDescription className="text-xs">
              Tato nastavení budou zprovozněna v pozdějších etapách.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Pravidlo přiřazení leadu (office-only)</Label>
                <Input disabled placeholder="rotace; podle lokality; podle vytížení" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Eskalace při nereakci (office-only, min)</Label>
                <Input disabled type="number" placeholder="Prázdné" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Příjemce reportu (office-only)</Label>
              <Input disabled placeholder="E-mail ředitele kanceláře" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="px-6 font-medium gap-2 h-10"
          >
            <Save className="h-4.5 w-4.5" />
            {loading ? 'Ukládám...' : 'Uložit nastavení'}
          </Button>
        </div>
      </form>
    </div>
  );
};
