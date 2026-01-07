/**
 * UserDisplay Component
 * 
 * Displays the logged-in user's name/email in a compact format.
 * Only shows when user is logged in, hidden when logged out.
 */

import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDisplayProps {
  className?: string;
}

export function UserDisplay({ className }: UserDisplayProps) {
  const { user } = useAuth();
  
  // Don't render anything if not logged in
  if (!user) return null;
  
  // Get display name - prefer email username part, fallback to full email
  const getDisplayName = (): string => {
    if (user.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    if (user.email) {
      // Get the part before @ and truncate if too long
      const emailName = user.email.split('@')[0];
      return emailName.length > 12 ? emailName.slice(0, 10) + '...' : emailName;
    }
    return '';
  };
  
  const displayName = getDisplayName();
  
  if (!displayName) return null;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium max-w-[100px] truncate",
        className
      )}
    >
      <User className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{displayName}</span>
    </div>
  );
}
