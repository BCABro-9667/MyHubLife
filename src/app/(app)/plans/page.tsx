
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, ClipboardList, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { Plan } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { AISuggestionModal } from '@/components/ai/ai-suggestion-modal';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialFormState: Omit<Plan, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  dueDate: '',
  status: 'Not Started',
  priority: 'Medium',
};

const statusColors: Record<Plan['status'], string> = {
  'Not Started': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400',
  'Completed': 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400',
  'On Hold': 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400',
};

const priorityColors: Record<NonNullable<Plan['priority']>, string> = {
  'Low': 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
  'Medium': 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-400',
  'High': 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400',
};


export default function PlansPage() {
  const [plans, setPlans] = useLocalStorage<Plan[]>('plans', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'status' | 'priority', value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddSuggestedPlan = (title: string) => {
    const newPlan: Plan = {
      id: crypto.randomUUID(),
      title: title,
      description: "AI Suggested Plan - add more details.",
      status: 'Not Started',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
    };
    setPlans(prevPlans => [...prevPlans, newPlan]);
  };

  const handleSubmit = () => {
    if (formData.title.trim() === '') {
      alert("Plan title cannot be empty.");
      return;
    }

    if (editingPlan) {
      setPlans(
        plans.map((plan) =>
          plan.id === editingPlan.id ? { ...editingPlan, ...formData } : plan
        )
      );
    } else {
      const newPlan: Plan = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setPlans([...plans, newPlan]);
    }
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingPlan(null);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      dueDate: plan.dueDate || '',
      status: plan.status,
      priority: plan.priority || 'Medium',
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      setPlans(plans.filter((plan) => plan.id !== id));
    }
  };

  if (!mounted) {
     return (
      <div className="flex flex-col h-full">
        <AppHeader title="My Plans" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <ClipboardList className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="My Plans">
        <Button onClick={() => setIsAISuggestionModalOpen(true)} variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" /> AI Suggest
        </Button>
        <Button onClick={openAddModal} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {plans.length === 0 ? (
          <EmptyState
            IconComponent={ClipboardList}
            title="No Plans Yet"
            description="Outline your goals, projects, or aspirations. Add your first plan or get suggestions from AI."
            actionButtonText="Add Your First Plan"
            onActionClick={openAddModal}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{plan.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className={statusColors[plan.status]}>{plan.status}</Badge>
                    {plan.priority && <Badge variant="outline" className={priorityColors[plan.priority]}>{plan.priority} Priority</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {plan.dueDate && <p className="text-sm"><span className="font-medium">Due:</span> {new Date(plan.dueDate).toLocaleDateString()}</p>}
                  <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">{plan.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(plan)} aria-label="Edit plan">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)} aria-label="Delete plan">
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
            <DialogTitle>{editingPlan ? 'Edit' : 'Add'} Plan</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update the details for this plan.' : 'Enter the details for the new plan.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid gap-4 py-4 pr-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Learn Next.js" className="mt-1" />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Details about the plan..." className="mt-1 min-h-[100px]" />
            </div>
            <div>
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date (Optional)</label>
              <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                  <SelectTrigger id="priority" className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPlan ? 'Save Changes' : 'Add Plan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AISuggestionModal
        isOpen={isAISuggestionModalOpen}
        onOpenChange={setIsAISuggestionModalOpen}
        existingItems={plans}
        itemType="plan"
        onAddSuggestion={handleAddSuggestedPlan}
      />
    </div>
  );
}
