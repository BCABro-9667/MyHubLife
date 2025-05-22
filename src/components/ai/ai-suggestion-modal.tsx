
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from 'lucide-react';
import { suggestNewEntries, SuggestNewEntriesInput } from '@/ai/flows/suggest-new-entries';
import { useToast } from "@/hooks/use-toast";
import type { SuggestibleContent, SuggestibleType } from '@/types';

interface AISuggestionModalProps<T extends SuggestibleContent> {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  existingItems: T[];
  itemType: SuggestibleType;
  onAddSuggestion: (suggestionText: string) => void; // Callback to add a suggestion to the main list
}

export function AISuggestionModal<T extends SuggestibleContent>({
  isOpen,
  onOpenChange,
  existingItems,
  itemType,
  onAddSuggestion,
}: AISuggestionModalProps<T>) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getExistingEntriesText = () => {
    if (itemType === 'todo') {
      return (existingItems as any[]).map((item: { task: string }) => item.task).join('\n');
    }
    if (itemType === 'plan' || itemType === 'story') {
      return (existingItems as any[]).map((item: { title: string; description?: string; content?: string }) => 
        `${item.title}${item.description ? ': ' + item.description : ''}${item.content ? ': ' + item.content.substring(0,100) : ''}`
      ).join('\n');
    }
    return '';
  };

  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const input: SuggestNewEntriesInput = {
        existingEntries: getExistingEntriesText() || `No existing ${itemType}s yet. Suggest some initial ${itemType}s.`,
        type: itemType,
      };
      const result = await suggestNewEntries(input);
      if (result && result.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        toast({ title: "AI Suggestion", description: "No suggestions received from AI.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast({ title: "AI Suggestion Error", description: "Could not fetch suggestions.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleAddAndClose = (suggestion: string) => {
    onAddSuggestion(suggestion);
    const newSuggestions = suggestions.filter(s => s !== suggestion);
    if (newSuggestions.length === 0) {
        onOpenChange(false); // Close modal if all suggestions are added
    }
    setSuggestions(newSuggestions); // Update suggestions list
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            AI-Powered Suggestions for {itemType.charAt(0).toUpperCase() + itemType.slice(1)}s
          </DialogTitle>
          <DialogDescription>
            Let AI help you brainstorm new {itemType}s based on your existing entries.
            Click "Get Suggestions" to start.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Generating ideas...</p>
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="space-y-3 py-4 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                <p className="text-sm">{suggestion}</p>
                <Button size="sm" variant="outline" onClick={() => handleAddAndClose(suggestion)}>Add</Button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && suggestions.length === 0 && !isLoading && (
             <div className="flex items-center justify-center h-40 text-muted-foreground">
                <p>Click "Get Suggestions" to see AI ideas here.</p>
            </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleFetchSuggestions} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Suggestions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
