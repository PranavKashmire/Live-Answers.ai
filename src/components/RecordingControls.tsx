import { Button } from './ui/button';
import { Mic, MicOff } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  status: string;
}

export const RecordingControls = ({ isRecording, onToggleRecording, status }: RecordingControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
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
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isRecording ? 'Recording...' : 'Click to Start'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{status}</p>
      </div>
    </div>
  );
};
