import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MicrophoneIcon } from '@/components/ui/microphone-icon';
import { Square, Download, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event) => {
          console.log('Speech recognition result received:', event.results.length);
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            console.log(`Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            console.log('Adding final transcript:', finalTranscript);
            setTranscription(prev => {
              const newTranscription = prev + finalTranscript;
              console.log('New total transcription:', newTranscription);
              onTranscriptionComplete(newTranscription); // Auto-update parent component
              return newTranscription;
            });
          }
          
          if (interimTranscript) {
            console.log('Updating interim transcript:', interimTranscript);
          }
          setInterimTranscription(interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.log('Speech recognition error:', event.error);
          // Only show error toast for serious errors, not no-speech
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            toast({
              title: "Microphone Access Required",
              description: "Please allow microphone access and try again.",
              variant: "destructive",
            });
            setIsRecording(false);
          } else if (event.error === 'network') {
            toast({
              title: "Network Error",
              description: "Please check your internet connection.",
              variant: "destructive",
            });
          }
          // For 'no-speech', 'audio-capture', and other non-critical errors, just log them
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          // Automatically restart if we're still supposed to be recording
          if (isRecording && recognitionRef.current) {
            console.log('Restarting speech recognition...');
            try {
              recognition.start();
            } catch (error) {
              console.log('Error restarting recognition:', error);
            }
          }
        };
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsTranscribing(true);
        };
        
        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (error) {
          console.log('Error starting recognition:', error);
          throw error;
        }
      } else {
        throw new Error('Speech Recognition not supported in this browser');
      }
      
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Start speaking! Your words will appear below in real-time.",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error && error.name === 'NotAllowedError' 
        ? "Please allow microphone access and try again."
        : "Could not access microphone. Please check permissions.";
      
      toast({
        title: "Microphone Access Required",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    setIsRecording(false);
    setIsTranscribing(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    setInterimTranscription('');
    
    if (transcription.trim()) {
      onTranscriptionComplete(transcription);
      toast({
        title: "Recording Stopped",
        description: "Transcription complete! You can now generate notes.",
      });
    } else {
      toast({
        title: "Recording Stopped",
        description: "No speech was detected. Please try speaking louder or closer to the microphone.",
      });
    }
  }, [transcription, onTranscriptionComplete, toast]);

  const clearTranscription = useCallback(() => {
    setTranscription('');
    setInterimTranscription('');
    onTranscriptionComplete('');
    toast({
      title: "Workspace Cleared",
      description: "Ready for a new recording session.",
    });
  }, [onTranscriptionComplete, toast]);

  const downloadTranscription = useCallback(() => {
    if (!transcription.trim()) {
      toast({
        title: "Nothing to Download",
        description: "No transcription available to download.",
        variant: "destructive",
      });
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([transcription], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcription-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Started",
      description: "Your transcription is being downloaded.",
    });
  }, [transcription, toast]);

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card className="p-8 text-center bg-gradient-surface border-border/50 shadow-elegant">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Notes Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Record lectures, discussions, or meetings and get AI-powered summarized notes instantly
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow"
              >
                <MicrophoneIcon className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="shadow-glow"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}
            
            <Button
              onClick={clearTranscription}
              variant="secondary"
              size="lg"
              disabled={!transcription.trim()}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Clear
            </Button>
            
            <Button
              onClick={downloadTranscription}
              variant="secondary"
              size="lg"
              disabled={!transcription.trim()}
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>
          </div>
          
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
              <span className="font-medium">Recording in progress...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Transcription Display */}
      {(transcription || isRecording) && (
        <Card className="p-6 bg-surface-elevated border-border/50 shadow-elegant">
          <div className="flex items-center gap-2 mb-4">
            <MicrophoneIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">
              {isRecording ? 'Live Transcription' : 'Transcribed Text'}
            </h3>
            {isRecording && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                Live
              </div>
            )}
          </div>
          <div className="bg-surface p-4 rounded-lg border border-border/30 max-h-60 overflow-y-auto">
            <p className="text-card-foreground whitespace-pre-wrap leading-relaxed">
              {transcription}
              {interimTranscription && (
                <span className="text-muted-foreground italic">
                  {interimTranscription}
                </span>
              )}
              {!transcription && !interimTranscription && isRecording && (
                <span className="text-muted-foreground">Start speaking... your words will appear here in real-time</span>
              )}
              {!transcription && !isRecording && (
                <span className="text-muted-foreground">Your transcription will appear here...</span>
              )}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};