import React from 'react';
import { Activity } from '@/types';
import { updateActivity } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, User, Briefcase, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface RemindersViewProps {
  activities: Activity[];
  onRefresh: () => void;
  onNavigateToContact: (contactId: string) => void;
  onNavigateToDeal: (dealId: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  activities,
  onRefresh,
  onNavigateToContact,
  onNavigateToDeal,
}) => {
  // Filter: is_reminder = true, done = false, when <= today
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const pendingReminders = activities
    .filter((act) => act.is_reminder && !act.done && new Date(act.when) <= todayEnd)
    .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  const handleMarkDone = async (id: string) => {
    try {
      await updateActivity(id, { done: true });
      toast.success('Připomínka byla označena jako splněná.');
      onRefresh();
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat připomínku.');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-normal tracking-tight">Dnešní připomínky</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Přehled úkolů a připomínek na dnešní den nebo z minulosti, které ještě nejsou splněny.
        </p>
      </div>

      {pendingReminders.length === 0 ? (
        <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/60 stroke-[1.25] mb-3" />
          <CardTitle className="text-lg font-display font-normal">Máte hotovo</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1 max-w-xs">
            Na dnešek nemáte žádné nevyřízené připomínky. Vše je splněno!
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {pendingReminders.map((reminder) => {
            const isOverdue = new Date(reminder.when) < now && 
              new Date(reminder.when).toDateString() !== now.toDateString();

            return (
              <Card key={reminder.id} className="overflow-hidden hover:border-[#706F69]/40 transition-colors">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${
                        isOverdue 
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300'
                      }`}>
                        {reminder.type}
                      </span>
                      
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {formatDateTime(reminder.when)} {isOverdue && '(zpoždění)'}
                        </span>
                      </div>
                    </div>

                    <p className="text-foreground text-[15px] font-normal leading-relaxed">
                      {reminder.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      {reminder.contact && (
                        <button
                          onClick={() => onNavigateToContact(reminder.contact_id)}
                          className="flex items-center gap-1 hover:text-primary transition-colors text-left"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span className="underline decoration-stone-300 hover:decoration-primary">
                            {reminder.contact.full_name}
                          </span>
                        </button>
                      )}
                      
                      {reminder.deal && (
                        <button
                          onClick={() => onNavigateToDeal(reminder.deal_id!)}
                          className="flex items-center gap-1 hover:text-primary transition-colors text-left"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          <span className="underline decoration-stone-300 hover:decoration-primary">
                            {reminder.deal.deal_name}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center md:self-center">
                    <Button
                      onClick={() => handleMarkDone(reminder.id)}
                      variant="outline"
                      size="sm"
                      className="border-stone-300 hover:border-primary hover:bg-stone-50 gap-1.5 h-9"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Splnit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
