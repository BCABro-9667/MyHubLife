
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, CreditCard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { CardInfo, PasswordEntry } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

const initialFormState: Omit<CardInfo, 'id' | 'createdAt'> = {
  cardName: '',
  cardType: 'credit',
  bankName: '',
  lastFourDigits: '',
  expiryDate: '',
  cardHolderName: '',
  notes: '',
  associatedWebsiteLoginIds: [],
};

export default function CardsPage() {
  const { userId, loading: authLoading } = useAuth(); // Get userId
  const [cards, setCards] = useLocalStorage<CardInfo[]>('cards', [], userId); // Pass userId
  // Passwords for association are still read with userId for consistency
  const [passwords] = useLocalStorage<PasswordEntry[]>('passwords', [], userId); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardInfo | null>(null);
  const [formData, setFormData] = useState<Omit<CardInfo, 'id' | 'createdAt'>>(initialFormState);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const canOperate = mounted && !authLoading && !!userId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'credit' | 'debit' | 'other') => {
    setFormData((prev) => ({ ...prev, cardType: value }));
  };
  
  const handleAssociatedLoginsChange = (loginId: string) => {
    setFormData(prev => {
      const currentAssociated = prev.associatedWebsiteLoginIds || [];
      const newAssociated = currentAssociated.includes(loginId)
        ? currentAssociated.filter(id => id !== loginId)
        : [...currentAssociated, loginId];
      return { ...prev, associatedWebsiteLoginIds: newAssociated };
    });
  };

  const handleSubmit = () => {
    if (!canOperate) return;
    if (formData.cardName.trim() === '') {
      alert("Card name cannot be empty.");
      return;
    }

    if (editingCard) {
      setCards(
        cards.map((card) =>
          card.id === editingCard.id ? { ...editingCard, ...formData } : card
        )
      );
    } else {
      const newCard: CardInfo = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setCards([...cards, newCard]);
    }
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingCard(null);
  };

  const openEditModal = (card: CardInfo) => {
    if (!canOperate) return;
    setEditingCard(card);
    setFormData({
      cardName: card.cardName,
      cardType: card.cardType,
      bankName: card.bankName || '',
      lastFourDigits: card.lastFourDigits || '',
      expiryDate: card.expiryDate || '',
      cardHolderName: card.cardHolderName || '',
      notes: card.notes || '',
      associatedWebsiteLoginIds: card.associatedWebsiteLoginIds || [],
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    if (!canOperate) return;
    setEditingCard(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    if (!canOperate) return;
    if (window.confirm("Are you sure you want to delete this card information?")) {
      setCards(cards.filter((card) => card.id !== id));
    }
  };

  const getPasswordEntryById = (id: string): PasswordEntry | undefined => {
    return passwords.find(p => p.id === id);
  };

  if (!mounted || authLoading) {
     return (
      <div className="flex flex-col h-full">
        <AppHeader title="Card Safe" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <CreditCard className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Card Safe">
        <Button onClick={openAddModal} size="sm" disabled={!canOperate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Card Info
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/30 text-destructive">
          <ShieldAlert className="h-5 w-5 !text-destructive" />
          <AlertTitle className="font-semibold">Important Security Reminder</AlertTitle>
          <AlertDescription className="text-destructive/90">
            This section is for storing notes, links related to your cards (e.g., bank login page, reward portal), or general card identifiers (like "Visa ending 1234").
            <strong>Do NOT store full card numbers, CVV codes, or PINs here.</strong> All data is saved in your browser's local storage.
          </AlertDescription>
        </Alert>

        {!canOperate || cards.length === 0 ? (
          <EmptyState
            IconComponent={CreditCard}
            title={!canOperate ? "Loading Card Info..." : "No Card Information Saved"}
            description={!canOperate ? "Please wait." : "Keep track of your card-related notes and links. Add your first card information entry."}
            actionButtonText="Add Card Info"
            onActionClick={openAddModal}
            actionButtonDisabled={!canOperate}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{card.cardName}</CardTitle>
                  <CardDescription>
                    {card.bankName ? `${card.bankName} - ` : ''}
                    {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}
                    {card.lastFourDigits ? ` (**** ${card.lastFourDigits})` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {card.cardHolderName && <p><span className="font-medium">Holder:</span> {card.cardHolderName}</p>}
                  {card.expiryDate && <p><span className="font-medium">Expires:</span> {card.expiryDate}</p>}
                  {card.notes && <p className="text-sm text-muted-foreground pt-1">Notes: {card.notes}</p>}
                  {card.associatedWebsiteLoginIds && card.associatedWebsiteLoginIds.length > 0 && (
                    <div className="pt-2">
                      <p className="font-medium text-sm mb-1">Associated Logins:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {card.associatedWebsiteLoginIds.map(id => {
                           const passwordEntry = getPasswordEntryById(id);
                           return passwordEntry ? <li key={id}>{passwordEntry.websiteName} ({passwordEntry.username})</li> : null;
                        })}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(card)} aria-label="Edit card info">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)} aria-label="Delete card info">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Edit' : 'Add'} Card Information</DialogTitle>
            <DialogDescription>
              {editingCard ? 'Update the details for this card.' : 'Enter the details for the new card.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1">
          <div className="grid gap-4 py-4 pr-4">
            <div>
              <Label htmlFor="cardName">Card Nickname</Label>
              <Input id="cardName" name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="e.g. My Amazon Visa" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cardType">Card Type</Label>
              <Select name="cardType" value={formData.cardType} onValueChange={handleSelectChange}>
                <SelectTrigger id="cardType" className="mt-1">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="debit">Debit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name (Optional)</Label>
              <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. Chase, Bank of America" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="lastFourDigits">Last Four Digits (Optional)</Label>
              <Input id="lastFourDigits" name="lastFourDigits" value={formData.lastFourDigits} onChange={handleInputChange} placeholder="e.g. 1234" maxLength={4} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date (MM/YY, Optional)</Label>
              <Input id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="e.g. 12/25" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cardHolderName">Card Holder Name (Optional)</Label>
              <Input id="cardHolderName" name="cardHolderName" value={formData.cardHolderName} onChange={handleInputChange} placeholder="e.g. John Doe" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="notes">Notes/Links (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="e.g. Bank login: https://bank.com, Rewards portal, Customer service number" className="mt-1" />
            </div>
             {passwords.length > 0 && (
              <div>
                <Label>Associate with Website Logins (Optional)</Label>
                <ScrollArea className="h-32 mt-1 border rounded-md p-2">
                  <div className="space-y-2">
                    {passwords.map(p => (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assoc-${p.id}`}
                          checked={(formData.associatedWebsiteLoginIds || []).includes(p.id)}
                          onCheckedChange={() => handleAssociatedLoginsChange(p.id)}
                        />
                        <Label htmlFor={`assoc-${p.id}`} className="text-sm font-normal cursor-pointer">
                          {p.websiteName} ({p.username})
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingCard ? 'Save Changes' : 'Add Card Info'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
