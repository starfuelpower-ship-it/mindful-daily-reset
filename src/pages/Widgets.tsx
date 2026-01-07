import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetPreviews } from '@/components/WidgetPreviews';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function Widgets() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Widget Previews</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-foreground font-medium text-center">
            🚧 Android home screen widgets are coming in a future update
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            These are preview designs only — not yet functional
          </p>
        </div>

        {/* Widget Previews */}
        <WidgetPreviews />
      </div>

      <BottomTabBar />
    </div>
  );
}
