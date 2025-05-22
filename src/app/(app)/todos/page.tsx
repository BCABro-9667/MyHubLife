
"use client";

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit3, Trash2, ListChecks, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import type { Todo } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
// AISuggestionModal and Sparkles might be removed or adapted later if they rely on LocalStorage for todos
// For now, AISuggestionModal is removed as it uses LocalStorage source for suggestions.
// import { AISuggestionModal } from '@/components/ai/ai-suggestion-modal';
// import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from "@/hooks/use-toast";

export default function TodosPage() {
  const { userId, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTask, setNewTodoTask] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editedTask, setEditedTask] = useState('');
  // const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false); // Removed for now
  const [isLoading, setIsLoading] = useState(true); // For initial data load

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const canOperate = mounted && !authLoading && !!userId;

  const fetchTodos = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch todos');
      }
      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({ title: "Error", description: (error as Error).message || "Could not fetch todos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (canOperate) {
      fetchTodos();
    } else if (!authLoading && !userId) {
      // User logged out, clear todos
      setTodos([]);
      setIsLoading(false);
    }
  }, [canOperate, fetchTodos, authLoading, userId]);

  const handleAddTodo = async () => {
    if (!canOperate || newTodoTask.trim() === '') return;
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTodoTask.trim(), userId, completed: false }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add todo');
      }
      const newTodo: Todo = await response.json();
      setTodos(prevTodos => [newTodo, ...prevTodos].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setNewTodoTask('');
      setIsAddModalOpen(false);
      toast({ title: "Success", description: "Todo added!" });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({ title: "Error", description: (error as Error).message || "Could not add todo.", variant: "destructive" });
    }
  };
  
  // const handleAddSuggestedTodo = (task: string) => { // Removed for now
  //   // This would need to call the API similar to handleAddTodo
  // };

  const toggleTodoCompletion = async (id: string) => {
    if (!canOperate) return;
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todoToUpdate.completed, userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update todo');
      }
      const updatedTodo: Todo = await response.json();
      setTodos(prevTodos => prevTodos.map(todo => todo.id === id ? updatedTodo : todo)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast({ title: "Error", description: (error as Error).message || "Could not update todo.", variant: "destructive" });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!canOperate) return;
    try {
      const response = await fetch(`/api/todos/${id}?userId=${userId}`, { // Pass userId in query for DELETE
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete todo');
      }
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      toast({ title: "Success", description: "Todo deleted." });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({ title: "Error", description: (error as Error).message || "Could not delete todo.", variant: "destructive" });
    }
  };

  const openEditModal = (todo: Todo) => {
    if (!canOperate) return;
    setEditingTodo(todo);
    setEditedTask(todo.task);
    setIsEditModalOpen(true);
  };

  const handleEditTodo = async () => {
    if (!canOperate || !editingTodo || editedTask.trim() === '') return;
    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: editedTask.trim(), userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit todo');
      }
      const updatedTodo: Todo = await response.json();
      setTodos(prevTodos => prevTodos.map(todo => todo.id === editingTodo.id ? updatedTodo : todo)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsEditModalOpen(false);
      setEditingTodo(null);
      toast({ title: "Success", description: "Todo updated." });
    } catch (error) {
      console.error("Error editing todo:", error);
      toast({ title: "Error", description: (error as Error).message || "Could not edit todo.", variant: "destructive" });
    }
  };

  if (!mounted || authLoading || (isLoading && !todos.length)) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Todos" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Todos">
        {/* <Button onClick={() => setIsAISuggestionModalOpen(true)} variant="outline" size="sm" disabled={!canOperate}>
          <Sparkles className="mr-2 h-4 w-4" /> AI Suggest
        </Button> */}
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" disabled={!canOperate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Todo
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {isLoading && todos.length === 0 ? (
           <div className="flex items-center justify-center h-full">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
           </div>
        ) : !isLoading && !canOperate && todos.length === 0 ? (
          <EmptyState
            IconComponent={ListChecks}
            title={"Login to see Todos"}
            description={"Please login to manage your tasks."}
          />
        )
        : !isLoading && canOperate && todos.length === 0 ? (
          <EmptyState
            IconComponent={ListChecks}
            title={"No Todos Yet"}
            description={"Get started by adding your first task."}
            actionButtonText="Add Your First Todo"
            onActionClick={() => setIsAddModalOpen(true)}
            actionButtonDisabled={!canOperate}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <ul className="space-y-3">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`todo-${todo.id}`}
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodoCompletion(todo.id)}
                          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        />
                        <label
                          htmlFor={`todo-${todo.id}`}
                          className={`cursor-pointer ${
                            todo.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {todo.task}
                        </label>
                      </div>
                      <div className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(todo)} aria-label="Edit todo">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTodo(todo.id)} aria-label="Delete todo">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Todo</DialogTitle>
            <DialogDescription>What task do you want to add to your list?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="newTodoTask"
              placeholder="E.g., Buy groceries"
              value={newTodoTask}
              onChange={(e) => setNewTodoTask(e.target.value)}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTodo}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>Update your task details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="editedTodoTask"
              value={editedTask}
              onChange={(e) => setEditedTask(e.target.value)}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleEditTodo()}
            />
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTodo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 
      AI Suggestion Modal is removed for now as its data source logic needs to be updated for MongoDB.
      <AISuggestionModal
        isOpen={isAISuggestionModalOpen}
        onOpenChange={setIsAISuggestionModalOpen}
        existingItems={todos} // This needs to be adapted if AISuggestionModal expects specific local storage structure
        itemType="todo"
        onAddSuggestion={handleAddSuggestedTodo} // This also needs to use the API
      /> 
      */}
    </div>
  );
}
