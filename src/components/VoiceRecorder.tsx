import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, RotateCcw, FileAudio, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline } from '@xenova/transformers';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is audio format
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an MP3 or WAV audio file.",
        variant: "destructive",
      });
      return;
    }

    // Check file duration using audio element
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.onloadedmetadata = () => {
      const durationInMinutes = audio.duration / 60;
      
      // Check if audio is longer than 40 minutes
      if (durationInMinutes > 40) {
        toast({
          title: "File Too Long",
          description: "Please upload an audio file shorter than 40 minutes.",
          variant: "destructive",
        });
        URL.revokeObjectURL(url);
        return;
      }
      
      setUploadedFile(file);
      setAudioUrl(url);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} (${Math.round(durationInMinutes)}min) is ready for transcription and playback.`,
      });
    };
    
    audio.onerror = () => {
      toast({
        title: "Invalid Audio File",
        description: "Could not load the audio file. Please try a different file.",
        variant: "destructive",
      });
      URL.revokeObjectURL(url);
    };
    
    audio.src = url;
  }, [toast]);

  const transcribeAudio = useCallback(async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload an audio file first.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    
    try {
      toast({
        title: "Transcription Started",
        description: "Loading Whisper model and processing your audio...",
      });

      // Use Whisper base model for better accuracy on longer audio
      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en');
      
      // Create URL for the audio file that the pipeline can process
      const audioUrl = URL.createObjectURL(uploadedFile);
      
      console.log('Starting transcription with file:', uploadedFile.name);
      
      // Transcribe the complete audio with optimized settings for full coverage
      const result = await transcriber(audioUrl, {
        // Longer chunks to reduce segmentation issues
        chunk_length_s: 60,
        // Larger stride to ensure overlap and continuity
        stride_length_s: 10,
        // Return timestamps to debug chunk processing if needed
        return_timestamps: true,
        // Force processing of the entire audio
        force_full_sequences: true,
      });
      
      console.log('Transcription result:', result);
      
      // Handle the result more comprehensively
      let transcribedText = '';
      let allChunks = [];
      
      if (Array.isArray(result)) {
        // If result is an array of chunks, process each chunk
        allChunks = result;
        console.log(`Processing ${result.length} chunks`);
      } else if (result && typeof result === 'object') {
        // If single result, convert to array for uniform processing
        allChunks = [result];
        console.log('Processing single result');
      }
      
      // Extract and combine text from all chunks
      const textSegments = allChunks
        .map((chunk, index) => {
          const text = chunk.text || '';
          console.log(`Chunk ${index + 1}: "${text.substring(0, 100)}..."`);
          return text.trim();
        })
        .filter(text => text.length > 0);
      
      // Join all text segments with proper spacing
      transcribedText = textSegments.join(' ').trim();
      
      // Clean up duplicate words at chunk boundaries
      const words = transcribedText.split(/\s+/);
      const cleanedWords = [];
      
      for (let i = 0; i < words.length; i++) {
        const currentWord = words[i];
        const nextWord = words[i + 1];
        
        // Skip if the next word is identical (likely a chunk boundary duplicate)
        if (currentWord && (!nextWord || currentWord !== nextWord)) {
          cleanedWords.push(currentWord);
        }
      }
      
      transcribedText = cleanedWords.join(' ');
      
      if (!transcribedText || transcribedText.length === 0) {
        transcribedText = "No speech detected in the audio file.";
      }
      
      console.log(`Final transcription length: ${transcribedText.length} characters, ${cleanedWords.length} words`);
      
      // Limit to 50,000 words (approximately 300,000 characters)
      if (cleanedWords.length > 50000) {
        transcribedText = cleanedWords.slice(0, 50000).join(' ') + '\n\n[Transcription truncated at 50,000 words]';
      }
      
      setTranscription(transcribedText);
      onTranscriptionComplete(transcribedText);
      setIsTranscribing(false);
      
      // Clean up the created URL
      URL.revokeObjectURL(audioUrl);
      
      const wordCount = transcribedText.split(/\s+/).filter(word => word.length > 0).length;
      toast({
        title: "Transcription Complete",
        description: `Your audio has been converted to text! (${wordCount.toLocaleString()} words)`,
      });

    } catch (error) {
      console.error('Error transcribing audio:', error);
      setIsTranscribing(false);
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe the audio file. Please try again.",
        variant: "destructive",
      });
    }
  }, [uploadedFile, onTranscriptionComplete, toast]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const clearWorkspace = useCallback(() => {
    setTranscription('');
    setUploadedFile(null);
    setIsPlaying(false);
    
    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    onTranscriptionComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Workspace Cleared",
      description: "Ready for a new audio file.",
    });
  }, [onTranscriptionComplete, audioUrl, toast]);


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
            Upload your audio files (MP3/WAV) and get AI-powered transcription and summarized notes instantly
          </p>
          
          <div className="space-y-4">
            {/* File Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,audio/mp3,audio/mpeg,audio/wav,audio/wave"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Audio File
              </Button>
              
              {uploadedFile && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-surface-elevated px-3 py-2 rounded-md border border-border/50">
                    <FileAudio className="w-4 h-4 text-primary" />
                    <span>{uploadedFile.name}</span>
                  </div>
                  
                  {/* Audio Player Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={togglePlayPause}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play Audio
                        </>
                      )}
                    </Button>
                    
                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                onClick={transcribeAudio}
                size="lg"
                variant="secondary"
                disabled={!uploadedFile || isTranscribing}
                className="shadow-glow"
              >
                {isTranscribing ? (
                  <>
                    <div className="w-5 h-5 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
                    Transcribing...
                  </>
                ) : (
                  <>
                    <FileAudio className="w-5 h-5 mr-2" />
                    Transcribe
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearWorkspace}
                variant="secondary"
                size="lg"
                disabled={!uploadedFile && !transcription.trim()}
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
          </div>
        </div>
      </Card>

      {/* Transcription Display */}
      {transcription && (
        <Card className="p-6 bg-surface-elevated border-border/50 shadow-elegant">
          <div className="flex items-center gap-2 mb-4">
            <FileAudio className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">
              Transcribed Text
            </h3>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-border/30 max-h-96 overflow-y-auto">
            <p className="text-card-foreground whitespace-pre-wrap leading-relaxed text-sm">
              {transcription}
            </p>
            <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground">
              Words: {transcription.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};