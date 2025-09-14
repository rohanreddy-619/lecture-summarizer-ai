import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Download, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesGeneratorProps {
  transcription: string;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({ transcription }) => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Mock AI summarization - in a real app, this would call an AI service
  const generateNotes = async () => {
    if (!transcription.trim()) {
      toast({
        title: "No Content to Summarize",
        description: "Please record and transcribe some content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI-generated notes
    const mockNotes = generateMockNotes(transcription);
    setNotes(mockNotes);
    setIsGenerating(false);
    
    toast({
      title: "Notes Generated Successfully",
      description: "Your AI-powered study notes are ready!",
    });
  };

  const generateMockNotes = (text: string): string => {
    // Simple mock summarization logic
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, Math.min(5, sentences.length));
    
    let mockNotes = "# Study Notes\n\n";
    mockNotes += "## Key Points:\n\n";
    
    keyPoints.forEach((point, index) => {
      const cleanPoint = point.trim();
      if (cleanPoint) {
        mockNotes += `• **${cleanPoint}**\n\n`;
      }
    });
    
    mockNotes += "## Summary:\n\n";
    mockNotes += `This content covers important topics discussed in the recording. Key themes include the main concepts presented throughout the session.\n\n`;
    
    mockNotes += "## Action Items:\n\n";
    mockNotes += "• Review the highlighted key points\n";
    mockNotes += "• Research related topics for deeper understanding\n";
    mockNotes += "• Practice applying these concepts\n\n";
    
    mockNotes += "---\n\n";
    mockNotes += `*Generated on ${new Date().toLocaleDateString()} using AI Notes Generator*`;
    
    return mockNotes;
  };

  const downloadNotes = () => {
    if (!notes.trim()) {
      toast({
        title: "No Notes to Download",
        description: "Generate notes first before downloading.",
        variant: "destructive",
      });
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([notes], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `study-notes-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Started",
      description: "Your study notes are being downloaded as a Markdown file.",
    });
  };

  const copyToClipboard = async () => {
    if (!notes.trim()) {
      toast({
        title: "No Notes to Copy",
        description: "Generate notes first before copying.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied to Clipboard",
        description: "Your study notes have been copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Notes Section */}
      <Card className="p-6 bg-surface-elevated border-border/50 shadow-elegant">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-card-foreground">AI Notes Generator</h3>
            </div>
            
            <Button
              onClick={generateNotes}
              disabled={!transcription.trim() || isGenerating}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
          </div>
          
          {!transcription.trim() && (
            <p className="text-sm text-muted-foreground">
              Record and transcribe content to generate AI-powered study notes.
            </p>
          )}
        </div>
      </Card>

      {/* Generated Notes Display */}
      {notes && (
        <Card className="p-6 bg-surface-elevated border-border/50 shadow-elegant">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-card-foreground">Your Study Notes</h3>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  size="sm"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                
                <Button
                  onClick={downloadNotes}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="bg-surface p-4 rounded-lg border border-border/30 max-h-80 overflow-y-auto">
              <pre className="text-card-foreground whitespace-pre-wrap font-sans leading-relaxed text-sm">
                {notes}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};