import { Bell, BellOff, Sun, Moon, Flame, Cat } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationSettings() {
  const {
    settings,
    permission,
    isSupported,
    requestPermission,
    updateSetting,
    testNotification,
    scheduleNotifications,
  } = useNotifications();

  if (!isSupported) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Notifications not supported on this device</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enable Notifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">
              {permission === 'granted' ? 'Permission granted' : 'Permission required'}
            </p>
          </div>
        </div>
        {permission !== 'granted' ? (
          <Button size="sm" onClick={requestPermission} variant="outline">
            Enable
          </Button>
        ) : (
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSetting('enabled', checked)}
          />
        )}
      </div>

      {settings.enabled && permission === 'granted' && (
        <>
          {/* Morning Reminder */}
          <div className="pl-8 space-y-3 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Morning Reminder</span>
              </div>
              <Switch
                checked={settings.morningReminder}
                onCheckedChange={(checked) => updateSetting('morningReminder', checked)}
              />
            </div>
            {settings.morningReminder && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Time:</Label>
                <Input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => updateSetting('morningTime', e.target.value)}
                  className="w-28 h-8 text-sm"
                />
              </div>
            )}
          </div>

          {/* Evening Reminder */}
          <div className="pl-8 space-y-3 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm">Evening Reminder</span>
              </div>
              <Switch
                checked={settings.eveningReminder}
                onCheckedChange={(checked) => updateSetting('eveningReminder', checked)}
              />
            </div>
            {settings.eveningReminder && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Time:</Label>
                <Input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => updateSetting('eveningTime', e.target.value)}
                  className="w-28 h-8 text-sm"
                />
              </div>
            )}
          </div>

          {/* Streak Warning */}
          <div className="pl-8 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Streak Warning</span>
              </div>
              <Switch
                checked={settings.streakWarning}
                onCheckedChange={(checked) => updateSetting('streakWarning', checked)}
              />
            </div>
          </div>

          {/* Cat Reminder */}
          <div className="pl-8 border-l-2 border-border ml-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cat className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Cat Companion Reminder</span>
              </div>
              <Switch
                checked={settings.catReminder}
                onCheckedChange={(checked) => updateSetting('catReminder', checked)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => testNotification('morning')}
              className="flex-1"
            >
              Test
            </Button>
            <Button
              size="sm"
              onClick={scheduleNotifications}
              className="flex-1"
            >
              Save & Schedule
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
