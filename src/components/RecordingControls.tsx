import { Button } from './ui/button';
import { Mic, MicOff, ExternalLink } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  status: string;
  onToggleFloating?: () => void;
  isFloating?: boolean;
}

export const RecordingControls = ({ 
  isRecording, 
  onToggleRecording, 
  status, 
  onToggleFloating,
  isFloating 
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
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isRecording ? 'Recording...' : 'Click to Start'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{status}</p>
        {isFloating && (
          <p className="text-xs text-primary mt-1 font-medium">
            Floating window active - answers appear on top of other tabs
          </p>
        )}
      </div>
    </div>
  );
};
