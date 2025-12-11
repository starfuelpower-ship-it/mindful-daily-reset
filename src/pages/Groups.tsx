import { useState } from 'react';
import { Users, Plus, UserPlus, LogOut, Copy, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useGroups } from '@/hooks/useGroups';
import { BottomTabBar } from '@/components/BottomTabBar';
import { PremiumLock } from '@/components/PremiumLock';
import { GroupLeaderboard } from '@/components/GroupLeaderboard';
import { GroupActivityFeed } from '@/components/GroupActivityFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { 
    groups, 
    members, 
    activities,
    currentGroup, 
    isLoading, 
    createGroup, 
    joinGroup, 
    leaveGroup,
    refetchActivities 
  } = useGroups();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    setIsSubmitting(true);
    const result = await createGroup(groupName.trim());
    setIsSubmitting(false);
    if (result) {
      setGroupName('');
      setCreateDialogOpen(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }
    setIsSubmitting(true);
    const success = await joinGroup(inviteCode.trim());
    setIsSubmitting(false);
    if (success) {
      setInviteCode('');
      setJoinDialogOpen(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (currentGroup) {
      await leaveGroup(currentGroup.id);
    }
  };

  const copyInviteCode = () => {
    if (currentGroup) {
      navigator.clipboard.writeText(currentGroup.invite_code);
      toast.success('Invite code copied!');
    }
  };

  const hasGroup = groups.length > 0 && currentGroup;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="text-sm text-muted-foreground">Build habits together</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : hasGroup ? (
          /* Group View */
          <div className="space-y-6 animate-fade-in">
            {/* Group Header Card */}
            <div className="ios-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{currentGroup.name}</h2>
                    <p className="text-sm text-muted-foreground">{members.length} members</p>
                  </div>
                </div>
                {currentGroup.created_by === user.id && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              
              {/* Invite Code */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                <span className="text-sm text-muted-foreground">Invite Code:</span>
                <span className="font-mono font-semibold text-foreground">{currentGroup.invite_code}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-auto"
                  onClick={copyInviteCode}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Leaderboard */}
            <GroupLeaderboard members={members} currentUserId={user.id} />

            {/* Activity Feed */}
            <GroupActivityFeed 
              activities={activities} 
              currentUserId={user.id}
              onReactionChange={refetchActivities}
            />

            {/* Leave Group Button */}
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleLeaveGroup}
            >
              <LogOut className="w-4 h-4" />
              Leave Group
            </Button>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
            {/* Illustration */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -right-4 -bottom-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </div>

            {/* Text */}
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Better Together
            </h2>
            <p className="text-muted-foreground max-w-xs mb-8">
              It's always nice to have someone on your side. Create or join a group to share your journey and keep each other motivated.
            </p>

            {/* Actions */}
            {isPremium ? (
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 h-12 rounded-xl">
                      <Plus className="w-5 h-5" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        maxLength={50}
                      />
                      <Button
                        className="w-full"
                        onClick={handleCreateGroup}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Group'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 h-12 rounded-xl">
                      <UserPlus className="w-5 h-5" />
                      Join Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="uppercase"
                      />
                      <Button
                        className="w-full"
                        onClick={handleJoinGroup}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Joining...' : 'Join Group'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <PremiumLock feature="Create and join groups to share streaks">
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button className="gap-2 h-12 rounded-xl" disabled>
                    <Plus className="w-5 h-5" />
                    Create Group
                  </Button>
                  <Button variant="outline" className="gap-2 h-12 rounded-xl" disabled>
                    <UserPlus className="w-5 h-5" />
                    Join Group
                  </Button>
                </div>
              </PremiumLock>
            )}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
