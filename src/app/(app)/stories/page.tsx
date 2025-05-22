
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, BookText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { Story } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { AISuggestionModal } from '@/components/ai/ai-suggestion-modal';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialFormState: Omit<Story, 'id' | 'createdAt'> = {
  title: '',
  content: '',
  genre: '',
  status: 'Draft',
};

export default function StoriesPage() {
  const [stories, setStories] = useLocalStorage<Story[]>('stories', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as Story['status'] }));
  };
  
  const handleAddSuggestedStory = (title: string) => {
    const newStory: Story = {
      id: crypto.randomUUID(),
      title: title,
      content: "AI Suggested Story - expand this idea.",
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };
    setStories(prevStories => [...prevStories, newStory]);
  };

  const handleSubmit = () => {
    if (formData.title.trim() === '' || formData.content.trim() === '') {
      alert("Story title and content cannot be empty.");
      return;
    }

    if (editingStory) {
      setStories(
        stories.map((story) =>
          story.id === editingStory.id ? { ...editingStory, ...formData } : story
        )
      );
    } else {
      const newStory: Story = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setStories([...stories, newStory]);
    }
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingStory(null);
  };

  const openEditModal = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      genre: story.genre || '',
      status: story.status || 'Draft',
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStory(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleDeleteStory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      setStories(stories.filter((story) => story.id !== id));
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="My Stories" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <BookText className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="My Stories">
        <Button onClick={() => setIsAISuggestionModalOpen(true)} variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" /> AI Suggest
        </Button>
        <Button onClick={openAddModal} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Story
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {stories.length === 0 ? (
          <EmptyState
            IconComponent={BookText}
            title="No Stories Yet"
            description="Unleash your creativity. Write down your narratives, ideas, or journal entries. Get started or use AI for inspiration."
            actionButtonText="Add Your First Story"
            onActionClick={openAddModal}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{story.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {story.genre && <Badge variant="secondary">{story.genre}</Badge>}
                    {story.status && <Badge variant="outline">{story.status}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">{story.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(story)} aria-label="Edit story">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteStory(story.id)} aria-label="Delete story">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingStory ? 'Edit' : 'Add'} Story</DialogTitle>
            <DialogDescription>
              {editingStory ? 'Update the details for this story.' : 'Enter the details for the new story.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid gap-4 py-4 pr-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. The Lost City" className="mt-1" />
            </div>
            <div>
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="Start writing your story here..." className="mt-1 min-h-[150px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="genre" className="text-sm font-medium">Genre (Optional)</label>
                <Input id="genre" name="genre" value={formData.genre} onChange={handleInputChange} placeholder="e.g. Fantasy, Sci-Fi" className="mt-1" />
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <Select name="status" value={formData.status} onValueChange={handleSelectChange}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingStory ? 'Save Changes' : 'Add Story'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AISuggestionModal
        isOpen={isAISuggestionModalOpen}
        onOpenChange={setIsAISuggestionModalOpen}
        existingItems={stories}
        itemType="story"
        onAddSuggestion={handleAddSuggestedStory}
      />
    </div>
  );
}
