
"use client";

import { useState, useEffect } from 'react';
import { Sparkles, ListChecks, ClipboardList, BookText, Loader2 } from 'lucide-react';
import AppHeader from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/lib/localStorage';
import { suggestNewEntries, SuggestNewEntriesInput } from '@/ai/flows/suggest-new-entries';
import type { Todo, Plan, Story, SuggestibleType } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

export default function AISuggestionsPage() {
  const { userId, loading: authLoading } = useAuth(); // Get userId
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [], userId); // Pass userId
  const [plans, setPlans] = useLocalStorage<Plan[]>('plans', [], userId); // Pass userId
  const [stories, setStories] = useLocalStorage<Story[]>('stories', [], userId); // Pass userId

  const [suggestionType, setSuggestionType] = useState<SuggestibleType>('todo');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const canOperate = mounted && !authLoading && !!userId;

  const getExistingEntriesText = () => {
    if (!canOperate) return `No existing ${suggestionType}s yet. Suggest some initial ${suggestionType}s.`;
    
    let existingItems: any[] = [];
    if (suggestionType === 'todo') existingItems = todos;
    else if (suggestionType === 'plan') existingItems = plans;
    else if (suggestionType === 'story') existingItems = stories;

    if (existingItems.length === 0) {
        return `No existing ${suggestionType}s yet. Suggest some initial ${suggestionType}s.`;
    }

    if (suggestionType === 'todo') {
      return existingItems.map((item: Todo) => item.task).join('\n');
    }
    if (suggestionType === 'plan' || suggestionType === 'story') {
      return existingItems.map((item: Plan | Story) => 
        `${item.title}${('description' in item && item.description) ? ': ' + item.description : ''}${('content' in item && item.content) ? ': ' + item.content.substring(0,100) : ''}`
      ).join('\n');
    }
    return '';
  };

  const handleFetchSuggestions = async () => {
    if (!canOperate) {
        toast({ title: "Login Required", description: "Please log in to get AI suggestions.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const input: SuggestNewEntriesInput = {
        existingEntries: getExistingEntriesText(), // This will now include the "no existing entries" message if needed
        type: suggestionType,
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

  const handleAddSuggestion = (suggestionText: string) => {
    if (!canOperate) return;
    const newItemId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (suggestionType === 'todo') {
      setTodos(prev => [...prev, { id: newItemId, task: suggestionText, completed: false, createdAt }]);
    } else if (suggestionType === 'plan') {
      setPlans(prev => [...prev, { id: newItemId, title: suggestionText, description: "AI Suggested - expand.", status: 'Not Started', createdAt }]);
    } else if (suggestionType === 'story') {
      setStories(prev => [...prev, { id: newItemId, title: suggestionText, content: "AI Suggested - write more.", status: 'Draft', createdAt }]);
    }
    toast({ title: "Suggestion Added!", description: `"${suggestionText.substring(0,30)}..." added to ${suggestionType}s.`});
    setSuggestions(prev => prev.filter(s => s !== suggestionText));
  };
  
  if (!mounted || authLoading) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="AI Suggestions" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <Sparkles className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="AI Suggestions" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><Sparkles className="mr-2 h-6 w-6 text-primary" /> Get Inspired!</CardTitle>
            <CardDescription>
              Select a category and let our AI suggest new ideas based on your existing entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Select value={suggestionType} onValueChange={(value) => setSuggestionType(value as SuggestibleType)} disabled={!canOperate}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo"><ListChecks className="inline-block mr-2 h-4 w-4" />Todos</SelectItem>
                <SelectItem value="plan"><ClipboardList className="inline-block mr-2 h-4 w-4" />Plans</SelectItem>
                <SelectItem value="story"><BookText className="inline-block mr-2 h-4 w-4" />Stories</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleFetchSuggestions} disabled={isLoading || !canOperate} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Suggestions
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Brewing up some fresh ideas for your {suggestionType}s...</p>
            <p className="text-muted-foreground">This might take a moment.</p>
          </div>
        )}

        {!isLoading && suggestions.length > 0 && canOperate && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Suggested {suggestionType.charAt(0).toUpperCase() + suggestionType.slice(1)}s:</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="bg-accent/10">
                  <CardContent className="p-4">
                    <p className="text-sm mb-3">{suggestion}</p>
                    <Button size="sm" onClick={() => handleAddSuggestion(suggestion)} className="w-full">
                      Add to my {suggestionType}s
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && suggestions.length === 0 && canOperate && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : 'Select a category and click "Generate Suggestions" to see AI-powered ideas here.'}
            </p>
          </div>
        )}
        {!canOperate && !isLoading && (
             <div className="text-center py-10">
                <p className="text-muted-foreground">Please log in to use AI suggestions.</p>
            </div>
        )}
      </main>
    </div>
  );
}
