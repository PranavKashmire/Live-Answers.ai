import { useState, useRef, useEffect } from 'react';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { ConversationDisplay, Message } from '@/components/ConversationDisplay';
import { RecordingControls } from '@/components/RecordingControls';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('Ready to listen');
  const [audioData, setAudioData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      console.log('Transcription:', transcript);
      
      setStatus('Processing...');
      
      try {
        const { data, error } = await supabase.functions.invoke('process-audio', {
          body: { transcription: transcript }
        });

        if (error) throw error;

        if (data.question && data.answer) {
          setMessages(prev => [
            ...prev,
            { type: 'question', text: data.question, timestamp: new Date() },
            { type: 'answer', text: data.answer, timestamp: new Date() }
          ]);
          
          toast({
            title: "Answer generated",
            description: "AI has responded to your question",
          });
        }

        setStatus('Listening...');
      } catch (error: any) {
        console.error('Error processing audio:', error);
        
        if (error.message?.includes('429')) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment before asking another question.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "AI credits depleted",
            description: "Please add credits to your workspace to continue.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to process your question. Please try again.",
            variant: "destructive",
          });
        }
        
        setStatus('Ready to listen');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast({
          title: "Recognition error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognitionRef.current = recognition;
  }, [toast]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start speech recognition
        recognitionRef.current?.start();
        
        // Set up audio visualization
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateAudioData = () => {
          if (!isRecording) return;
          analyser.getByteFrequencyData(dataArray);
          setAudioData(Array.from(dataArray).map(v => v / 255));
          requestAnimationFrame(updateAudioData);
        };
        updateAudioData();
        
        setIsRecording(true);
        setStatus('Listening...');
        
        toast({
          title: "Recording started",
          description: "Speak your questions naturally",
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Microphone error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    } else {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
      setStatus('Ready to listen');
      setAudioData([]);
      
      toast({
        title: "Recording stopped",
        description: "Click to start recording again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Answer AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time AI assistant that detects questions and generates instant answers
          </p>
        </div>

        <AudioVisualizer isRecording={isRecording} audioData={audioData} />

        <ConversationDisplay messages={messages} />

        <div className="flex justify-center pt-4">
          <RecordingControls 
            isRecording={isRecording} 
            onToggleRecording={toggleRecording}
            status={status}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
