import { useState } from 'react';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { NotesGenerator } from '@/components/NotesGenerator';

const Index = () => {
  const [transcription, setTranscription] = useState('');

  const handleTranscriptionComplete = (text: string) => {
    setTranscription(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
        <NotesGenerator transcription={transcription} />
      </div>
    </div>
  );
};

export default Index;
