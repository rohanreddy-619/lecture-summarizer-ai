import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Download, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesData {
  keyPoints: string[];
  abbreviations: { term: string; meaning: string; }[];
  uniqueWords: string[];
  generatedDate: string;
}

interface NotesGeneratorProps {
  transcription: string;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({ transcription }) => {
  const [notes, setNotes] = useState<NotesData | null>(null);
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

  const generateMockNotes = (text: string) => {
    // Simple mock summarization logic
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, Math.min(8, sentences.length));
    
    // Extract potential keywords and create abbreviations
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    const uniqueWords = words
      .filter(word => word.length > 4 && !commonWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 6);
    
    const processedKeyPoints = keyPoints.map(point => point.trim()).filter(point => point.length > 0);
    
    const abbreviations = [
      { term: 'AI', meaning: 'Artificial Intelligence' },
      { term: 'ML', meaning: 'Machine Learning' },
      { term: 'API', meaning: 'Application Programming Interface' },
      { term: 'UI/UX', meaning: 'User Interface/User Experience' },
      { term: 'SaaS', meaning: 'Software as a Service' },
      { term: 'CRM', meaning: 'Customer Relationship Management' }
    ];
    
    return {
      keyPoints: processedKeyPoints,
      abbreviations: abbreviations,
      uniqueWords: uniqueWords,
      generatedDate: new Date().toLocaleDateString()
    };
  };

  const downloadNotes = () => {
    if (!notes || !notes.keyPoints.length) {
      toast({
        title: "No Notes to Download",
        description: "Generate notes first before downloading.",
        variant: "destructive",
      });
      return;
    }

    // Convert notes object to markdown format
    let markdownContent = `# Study Notes\n\n`;
    markdownContent += `## Key Points\n\n`;
    notes.keyPoints.forEach((point) => {
      markdownContent += `• ${point}\n\n`;
    });
    
    markdownContent += `## Abbreviations & Keywords\n\n`;
    notes.abbreviations.forEach((item) => {
      markdownContent += `**${item.term}**: ${item.meaning}\n\n`;
    });
    
    if (notes.uniqueWords.length > 0) {
      markdownContent += `## Key Terms\n\n`;
      notes.uniqueWords.forEach((word) => {
        markdownContent += `• ${word}\n\n`;
      });
    }
    
    markdownContent += `---\n\n*Generated on ${notes.generatedDate} using AI Notes Generator*`;

    const element = document.createElement('a');
    const file = new Blob([markdownContent], { type: 'text/markdown' });
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
    if (!notes || !notes.keyPoints.length) {
      toast({
        title: "No Notes to Copy",
        description: "Generate notes first before copying.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert notes object to text format
      let textContent = `STUDY NOTES\n\n`;
      textContent += `KEY POINTS:\n`;
      notes.keyPoints.forEach((point) => {
        textContent += `• ${point}\n`;
      });
      
      textContent += `\nABBREVIATIONS & KEYWORDS:\n`;
      notes.abbreviations.forEach((item) => {
        textContent += `${item.term}: ${item.meaning}\n`;
      });
      
      if (notes.uniqueWords.length > 0) {
        textContent += `\nKEY TERMS:\n`;
        notes.uniqueWords.forEach((word) => {
          textContent += `• ${word}\n`;
        });
      }
      
      textContent += `\nGenerated on ${notes.generatedDate}`;

      await navigator.clipboard.writeText(textContent);
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
            
            <div className="bg-surface border border-border/30 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Key Points Column */}
                <div className="p-4 border-r border-border/30">
                  <h4 className="font-semibold text-card-foreground mb-3 text-base">Key Points</h4>
                  <div className="space-y-2">
                    {notes.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-sm text-card-foreground leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Abbreviations & Keywords Column */}
                <div className="p-4">
                  <h4 className="font-semibold text-card-foreground mb-3 text-base">Abbreviations & Keywords</h4>
                  <div className="space-y-2">
                    {notes.abbreviations.map((item, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-accent">{item.term}:</span>{' '}
                        <span className="text-card-foreground">{item.meaning}</span>
                      </div>
                    ))}
                    
                    {notes.uniqueWords.length > 0 && (
                      <>
                        <div className="mt-4 pt-3 border-t border-border/20">
                          <p className="font-medium text-card-foreground text-xs mb-2">Key Terms:</p>
                          <div className="flex flex-wrap gap-1">
                            {notes.uniqueWords.map((word, index) => (
                              <span key={index} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-surface-elevated/50 border-t border-border/20">
                <p className="text-xs text-muted-foreground text-center">
                  Generated on {notes.generatedDate}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};