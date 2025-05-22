
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { PasswordEntry } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialFormState: Omit<PasswordEntry, 'id' | 'createdAt'> = {
  websiteName: '',
  url: '',
  username: '',
  passwordValue: '',
  notes: '',
};

export default function PasswordsPage() {
  const [passwords, setPasswords] = useLocalStorage<PasswordEntry[]>('passwords', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Hydration-safe state for rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (formData.websiteName.trim() === '' || formData.username.trim() === '' || formData.passwordValue.trim() === '') {
      // Basic validation
      alert("Website name, username, and password cannot be empty.");
      return;
    }

    if (editingPassword) {
      setPasswords(
        passwords.map((p) =>
          p.id === editingPassword.id ? { ...editingPassword, ...formData } : p
        )
      );
    } else {
      const newPassword: PasswordEntry = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setPasswords([...passwords, newPassword]);
    }
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingPassword(null);
  };

  const openEditModal = (password: PasswordEntry) => {
    setEditingPassword(password);
    setFormData({
      websiteName: password.websiteName,
      url: password.url || '',
      username: password.username,
      passwordValue: password.passwordValue,
      notes: password.notes || '',
    });
    setIsModalOpen(true);
    setShowPassword(false); // Reset visibility in modal
  };

  const openAddModal = () => {
    setEditingPassword(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
    setShowPassword(false); // Reset visibility in modal
  };

  const handleDeletePassword = (id: string) => {
    if (window.confirm("Are you sure you want to delete this password entry?")) {
      setPasswords(passwords.filter((p) => p.id !== id));
    }
  };
  
  const togglePasswordVisibility = (id?: string) => {
    if (id) { // For list items
      setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    } else { // For modal
      setShowPassword(!showPassword);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Passwords" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <Lock className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Passwords">
        <Button onClick={openAddModal} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Password
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/30 text-destructive">
          <ShieldAlert className="h-5 w-5 !text-destructive" />
          <AlertTitle className="font-semibold">Important Security Notice</AlertTitle>
          <AlertDescription className="text-destructive/90">
            Passwords stored here are saved in your browser's local storage. This is NOT a secure vault for highly sensitive information.
            Avoid using this for critical accounts like banking. This feature is for convenience with less critical logins.
            Ensure your device is secure.
          </AlertDescription>
        </Alert>

        {passwords.length === 0 ? (
          <EmptyState
            IconComponent={Lock}
            title="No Passwords Saved"
            description="Keep your website logins organized. Add your first password entry."
            actionButtonText="Add Password Entry"
            onActionClick={openAddModal}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {passwords.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{p.websiteName}</CardTitle>
                  {p.url && <CardDescription><a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">{p.url}</a></CardDescription>}
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p><span className="font-medium">Username:</span> {p.username}</p>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Password:</span>
                    <Input
                      type={visiblePasswords[p.id] ? 'text' : 'password'}
                      value={p.passwordValue}
                      readOnly
                      className="flex-1 mr-2 h-8 text-sm"
                    />
                    <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility(p.id)} className="h-8 w-8">
                      {visiblePasswords[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {p.notes && <p className="text-sm text-muted-foreground pt-1">Notes: {p.notes}</p>}
                </CardContent>
                <CardFooter className="flex justify-between gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(p.passwordValue)}>Copy Password</Button>
                  <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(p)} aria-label="Edit password">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePassword(p.id)} aria-label="Delete password">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPassword ? 'Edit' : 'Add'} Password Entry</DialogTitle>
            <DialogDescription>
              {editingPassword ? 'Update the details for this login.' : 'Enter the details for the new login.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid gap-4 py-4 pr-4">
            <div>
              <label htmlFor="websiteName" className="text-sm font-medium">Website Name</label>
              <Input id="websiteName" name="websiteName" value={formData.websiteName} onChange={handleInputChange} placeholder="e.g. My Example Site" className="mt-1" />
            </div>
            <div>
              <label htmlFor="url" className="text-sm font-medium">Website URL (Optional)</label>
              <Input id="url" name="url" type="url" value={formData.url} onChange={handleInputChange} placeholder="e.g. https://example.com" className="mt-1" />
            </div>
            <div>
              <label htmlFor="username" className="text-sm font-medium">Username/Email</label>
              <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="e.g. user@example.com" className="mt-1" />
            </div>
            <div>
              <label htmlFor="passwordValue" className="text-sm font-medium">Password</label>
              <div className="flex items-center mt-1">
                <Input
                  id="passwordValue"
                  name="passwordValue"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.passwordValue}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility()} className="ml-2">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="e.g. Security questions, recovery email" className="mt-1" />
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPassword ? 'Save Changes' : 'Add Entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
