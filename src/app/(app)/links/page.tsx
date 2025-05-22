
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Link as LinkIconLucide, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { WebsiteLink } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

const initialFormState: Omit<WebsiteLink, 'id' | 'createdAt'> = {
  name: '',
  url: '',
  category: '',
  description: '',
};

export default function LinksPage() {
  const { userId, loading: authLoading } = useAuth(); // Get userId
  const [links, setLinks] = useLocalStorage<WebsiteLink[]>('links', [], userId); // Pass userId
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<WebsiteLink | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const canOperate = mounted && !authLoading && !!userId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!canOperate) return;
    if (formData.name.trim() === '' || formData.url.trim() === '') {
      alert("Link name and URL cannot be empty.");
      return;
    }
    try {
      new URL(formData.url);
    } catch (_) {
      alert("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    if (editingLink) {
      setLinks(
        links.map((link) =>
          link.id === editingLink.id ? { ...editingLink, ...formData } : link
        )
      );
    } else {
      const newLink: WebsiteLink = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setLinks([...links, newLink]);
    }
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingLink(null);
  };

  const openEditModal = (link: WebsiteLink) => {
    if (!canOperate) return;
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      category: link.category || '',
      description: link.description || '',
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    if (!canOperate) return;
    setEditingLink(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleDeleteLink = (id: string) => {
    if (!canOperate) return;
    if (window.confirm("Are you sure you want to delete this link?")) {
      setLinks(links.filter((link) => link.id !== id));
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Web Links" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <LinkIconLucide className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Web Links">
        <Button onClick={openAddModal} size="sm" disabled={!canOperate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Link
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {!canOperate || links.length === 0 ? (
          <EmptyState
            IconComponent={LinkIconLucide}
            title={!canOperate ? "Loading Links..." : "No Links Saved"}
            description={!canOperate ? "Please wait." : "Organize your favorite or important websites here. Add your first link."}
            actionButtonText="Add Web Link"
            onActionClick={openAddModal}
            actionButtonDisabled={!canOperate}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <Card key={link.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{link.name}</CardTitle>
                  {link.category && <CardDescription>Category: {link.category}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all flex items-center">
                    {link.url} <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                  </a>
                  {link.description && <p className="text-sm text-muted-foreground pt-1">{link.description}</p>}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(link)} aria-label="Edit link">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)} aria-label="Delete link">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit' : 'Add'} Web Link</DialogTitle>
            <DialogDescription>
              {editingLink ? 'Update the details for this link.' : 'Enter the details for the new link.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid gap-4 py-4 pr-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Link Name</label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. My Favorite Blog" className="mt-1" />
            </div>
            <div>
              <label htmlFor="url" className="text-sm font-medium">URL</label>
              <Input id="url" name="url" type="url" value={formData.url} onChange={handleInputChange} placeholder="https://example.com" className="mt-1" />
            </div>
            <div>
              <label htmlFor="category" className="text-sm font-medium">Category (Optional)</label>
              <Input id="category" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. News, Tools, Social" className="mt-1" />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="A short note about this link" className="mt-1" />
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingLink ? 'Save Changes' : 'Add Link'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
