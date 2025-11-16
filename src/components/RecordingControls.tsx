import { Button } from './ui/button';
import { Mic, MicOff, ExternalLink, EyeOff } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  status: string;
  onToggleFloating?: () => void;
  isFloating?: boolean;
  onToggleStealth?: () => void;
}

export const RecordingControls = ({ 
  isRecording, 
  onToggleRecording, 
  status, 
  onToggleFloating,
  isFloating,
  onToggleStealth
}: RecordingControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={onToggleRecording}
          size="lg"
          className={`w-20 h-20 rounded-full transition-all duration-300 ${
            isRecording 
              ? 'bg-destructive hover:bg-destructive/90 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
              : 'bg-primary hover:bg-primary/90 shadow-[var(--shadow-elevated)]'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
        
        {onToggleFloating && (
          <Button
            onClick={onToggleFloating}
            size="lg"
            variant={isFloating ? "default" : "outline"}
            className="h-12 gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            {isFloating ? 'Close Float' : 'Float Answers'}
          </Button>
        )}
        
        {onToggleStealth && (
          <Button
            onClick={onToggleStealth}
            size="lg"
            variant="outline"
            className="h-12 gap-2"
            title="Hide interface for screen sharing"
          >
            <EyeOff className="w-5 h-5" />
            Stealth Mode
          </Button>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isRecording ? 'Recording...' : 'Click to Start'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{status}</p>
        {isFloating && (
          <p className="text-xs text-primary mt-1 font-medium">
            💡 Tip: Use Stealth Mode before screen sharing to hide this tab
          </p>
        )}
      </div>
    </div>
  );
};
