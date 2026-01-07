import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ExportData {
  exportDate: string;
  user: {
    id: string;
    email: string | undefined;
  };
  habits: any[];
  completions: any[];
  points: any;
  achievements: any[];
  settings: any;
}

export function useDataExport() {
  const { user } = useAuth();

  const exportAsJSON = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to export data');
      return;
    }

    try {
      toast.loading('Preparing your data export...');

      // Fetch all user data in parallel
      const [
        { data: habits },
        { data: completions },
        { data: points },
        { data: achievements },
        { data: settings },
      ] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('habit_completions').select('*').eq('user_id', user.id),
        supabase.from('user_points').select('*').eq('user_id', user.id).single(),
        supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ]);

      const exportData: ExportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        habits: habits || [],
        completions: completions || [],
        points: points || null,
        achievements: achievements || [],
        settings: settings || null,
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cozy-habits-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Failed to export data');
    }
  }, [user]);

  const exportAsCSV = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to export data');
      return;
    }

    try {
      toast.loading('Preparing your data export...');

      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      if (!habits || habits.length === 0) {
        toast.dismiss();
        toast.error('No habits to export');
        return;
      }

      // Create CSV
      const headers = ['Name', 'Category', 'Streak', 'Created At', 'Last Completed', 'Notes'];
      const rows = habits.map(h => [
        `"${h.name}"`,
        h.category,
        h.streak || 0,
        format(new Date(h.created_at), 'yyyy-MM-dd'),
        h.last_completed_date || 'Never',
        `"${h.notes || ''}"`,
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cozy-habits-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Data exported as CSV!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Failed to export data');
    }
  }, [user]);

  return { exportAsJSON, exportAsCSV };
}
